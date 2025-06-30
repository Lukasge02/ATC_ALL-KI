"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ArrowRight,
  Code,
  GraduationCap,
  Briefcase,
  Palette,
  Heart,
  Bot,
  Sparkles,
  Brain,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { ProfileCategory } from "@/lib/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useToastContext } from "@/components/providers/toast-provider";
import AIInterviewChat from "@/components/features/ai-interview-chat";
import { useContextStore } from "@/lib/store/useContextStore";

// Template Definitions
const PROFILE_TEMPLATES = {
  developer: {
    name: "Senior Developer",
    description: "Ein erfahrener Entwickler-Mentor für Code, Architektur und Best Practices",
    avatar: "👨‍💻",
    category: "developer" as ProfileCategory,
    personality: {
      tone: "professional",
      expertise: ["JavaScript", "TypeScript", "React", "Node.js", "System Design"],
      interests: ["Clean Code", "Performance", "Testing", "DevOps"],
      responseStyle: "detailed"
    },
    systemPrompt: "Du bist ein erfahrener Senior Developer mit 10+ Jahren Erfahrung. Du hilfst bei Code-Reviews, Architektur-Entscheidungen und teilst Best Practices. Antworte präzise und mit praktischen Beispielen."
  },
  student: {
    name: "Lern-Begleiter",
    description: "Ein geduldiger Tutor für Studium, Lerntechniken und Prüfungsvorbereitung",
    avatar: "🎓",
    category: "student" as ProfileCategory,
    personality: {
      tone: "encouraging",
      expertise: ["Lerntechniken", "Zeitmanagement", "Prüfungsvorbereitung", "Motivation"],
      interests: ["Bildung", "Produktivität", "Mindset", "Erfolg"],
      responseStyle: "supportive"
    },
    systemPrompt: "Du bist ein erfahrener Lern-Coach und Tutor. Du hilfst Studenten beim Lernen, der Prüfungsvorbereitung und Motivation. Sei geduldig, ermutigend und erkläre komplexe Themen verständlich."
  },
  business: {
    name: "Business Coach",
    description: "Ein strategischer Berater für Unternehmensentscheidungen und Karriere",
    avatar: "💼",
    category: "business" as ProfileCategory,
    personality: {
      tone: "confident",
      expertise: ["Strategie", "Leadership", "Marketing", "Finanzen", "Networking"],
      interests: ["Unternehmertum", "Innovation", "Wachstum", "Trends"],
      responseStyle: "strategic"
    },
    systemPrompt: "Du bist ein erfahrener Business Coach und Strategieberater. Du hilfst bei Geschäftsentscheidungen, Karriereplanung und Unternehmensführung. Antworte strategisch und zielorientiert."
  },
  creative: {
    name: "Kreativ-Partner",
    description: "Ein inspirierender Begleiter für Design, Kunst und kreative Projekte",
    avatar: "🎨",
    category: "creative" as ProfileCategory,
    personality: {
      tone: "inspiring",
      expertise: ["Design", "Fotografie", "Schreiben", "Kunst", "Kreativität"],
      interests: ["Ästhetik", "Trends", "Innovation", "Ausdruck"],
      responseStyle: "creative"
    },
    systemPrompt: "Du bist ein kreativer Partner und Inspirationsquelle. Du hilfst bei Design-Entscheidungen, kreativen Projekten und künstlerischer Entwicklung. Sei inspirierend und denke außerhalb der Box."
  },
  personal: {
    name: "Lebens-Coach",
    description: "Ein empathischer Begleiter für persönliche Entwicklung und Wohlbefinden",
    avatar: "❤️",
    category: "personal" as ProfileCategory,
    personality: {
      tone: "empathetic",
      expertise: ["Persönlichkeitsentwicklung", "Achtsamkeit", "Beziehungen", "Gesundheit"],
      interests: ["Selbstreflexion", "Balance", "Glück", "Wachstum"],
      responseStyle: "caring"
    },
    systemPrompt: "Du bist ein empathischer Lebens-Coach. Du unterstützt bei persönlicher Entwicklung, Selbstreflexion und Wohlbefinden. Sei verständnisvoll, ermutigend und respektvoll."
  },
  general: {
    name: "Universal-Assistent",
    description: "Ein vielseitiger Helfer für alle Bereiche des Lebens",
    avatar: "🤖",
    category: "general" as ProfileCategory,
    personality: {
      tone: "friendly",
      expertise: ["Allgemeinwissen", "Recherche", "Organisation", "Kommunikation"],
      interests: ["Lernen", "Helfen", "Effizienz", "Lösungen"],
      responseStyle: "balanced"
    },
    systemPrompt: "Du bist ein hilfsbereiter Universal-Assistent. Du unterstützt bei verschiedenen Aufgaben und Fragen mit ausgewogenen, informativen Antworten."
  }
};

// Category mapping for chat responses
const CATEGORY_MAPPING: Record<string, ProfileCategory> = {
  'entwicklung': 'developer',
  'technik': 'developer',
  'programmierung': 'developer',
  'code': 'developer',
  'entwickler': 'developer',
  'lernen': 'student',
  'studium': 'student',
  'student': 'student',
  'prüfung': 'student',
  'universität': 'student',
  'business': 'business',
  'karriere': 'business',
  'beruf': 'business',
  'unternehmen': 'business',
  'marketing': 'business',
  'kreativ': 'creative',
  'design': 'creative',
  'kunst': 'creative',
  'schreiben': 'creative',
  'fotografie': 'creative',
  'persönlich': 'personal',
  'coaching': 'personal',
  'persönlichkeitsentwicklung': 'personal',
  'wellness': 'personal',
  'allgemein': 'general',
  'verschiedenes': 'general',
  'alles': 'general'
};

const TONE_MAPPING: Record<string, 'professional' | 'casual' | 'friendly' | 'expert'> = {
  'professionell': 'professional',
  'sachlich': 'professional',
  'expertenhaft': 'expert',
  'freundlich': 'friendly',
  'warm': 'friendly',
  'locker': 'casual',
  'entspannt': 'casual',
  'persönlich': 'casual',
  'inspirierend': 'friendly'
};

const RESPONSE_STYLE_MAPPING: Record<string, 'concise' | 'detailed' | 'creative'> = {
  'kurz': 'concise',
  'knapp': 'concise',
  'prägnant': 'concise',
  'ausgewogen': 'detailed',
  'mittel': 'detailed',
  'ausführlich': 'detailed',
  'detailliert': 'detailed',
  'umfassend': 'detailed'
};

export default function NewProfilePage() {
  const router = useRouter();
  const { toast } = useToastContext();
  const { addProfile } = useAuthStore();
  const { addMemory, clearContext } = useContextStore();
  
  const [creationMode, setCreationMode] = useState<"select" | "template" | "interview">("select");
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = async (templateKey: keyof typeof PROFILE_TEMPLATES) => {
    try {
      setIsCreating(true);
      const template = PROFILE_TEMPLATES[templateKey];
      
      // Create profile via API with correct format
      const profileData = {
        name: template.name,
        description: template.description,
        avatar: template.avatar,
        category: template.category,
        personality: {
          tone: template.personality.tone,
          expertise: template.personality.expertise,
          interests: template.personality.interests,
          responseStyle: template.personality.responseStyle
        },
        systemPrompt: template.systemPrompt
      };
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Profils');
      }
      
      const result = await response.json();
      addProfile(result.profile);
      
      toast.success('Profil erstellt', `${template.name} wurde erfolgreich erstellt.`);
      router.push('/profiles');
    } catch (error) {
      toast.error('Fehler', error instanceof Error ? error.message : 'Profil konnte nicht erstellt werden.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInterviewComplete = async (chatData: any) => {
    try {
      setIsCreating(true);
      
      // Convert chat data to profile format
      const profileData = convertChatDataToProfile(chatData);
      
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Profils');
      }
      
      const result = await response.json();
      const newProfile = result.profile;
      addProfile(newProfile);
      
      // Initialize context memory for the new profile
      const profileId = newProfile.id;
      
      // Transfer interview context if available
      if (chatData._interviewContextId) {
        const { transferMemoriesToProfile } = useContextStore.getState();
        transferMemoriesToProfile(chatData._interviewContextId, profileId);
      } else {
        // Fallback: Add basic memories from chat data
        if (chatData.name) {
          addMemory(profileId, 'profile_name', chatData.name, 'profile', 1.0);
        }
        if (chatData.goals) {
          addMemory(profileId, 'goals', [chatData.goals], 'profile', 0.9);
        }
        if (chatData.expertise) {
          addMemory(profileId, 'expertise', Array.isArray(chatData.expertise) ? chatData.expertise : [chatData.expertise], 'profile', 0.9);
        }
        if (chatData.category) {
          addMemory(profileId, 'category', chatData.category, 'profile', 0.9);
        }
        if (chatData.tone) {
          addMemory(profileId, 'communication_style', chatData.tone, 'profile', 0.9);
        }
        if (chatData.responseStyle) {
          addMemory(profileId, 'response_style', chatData.responseStyle, 'profile', 0.9);
        }
      }
      
      // Add creation context summary
      addMemory(profileId, 'creation_context', {
        createdVia: 'ai-interview',
        timestamp: new Date().toISOString(),
        initialGoals: chatData.goals,
        expectedUse: 'Als personalisierter Assistent basierend auf Interview-Antworten'
      }, 'profile', 1.0);
      
      toast.success('Profil erstellt', 'Dein personalisierter Assistent wurde erfolgreich erstellt und lernt bereits aus eurem Gespräch!');
      router.push('/profiles');
    } catch (error) {
      toast.error('Fehler', error instanceof Error ? error.message : 'Profil konnte nicht erstellt werden.');
    } finally {
      setIsCreating(false);
    }
  };


  const convertChatDataToProfile = (chatData: any) => {
    // Smart category detection based on actual answers
    const categoryText = chatData.category?.toLowerCase() || '';
    let category: ProfileCategory = 'general';
    let avatar = '🤖';
    
    // Detect category from category answer
    if (categoryText.includes('sport') || categoryText.includes('lauf') || categoryText.includes('fitness') || categoryText.includes('training')) {
      category = 'personal';
      avatar = '🏃‍♂️';
    } else if (categoryText.includes('code') || categoryText.includes('programming') || categoryText.includes('entwickl') || categoryText.includes('javascript') || categoryText.includes('python')) {
      category = 'developer';
      avatar = '👨‍💻';
    } else if (categoryText.includes('learn') || categoryText.includes('stud') || categoryText.includes('math') || categoryText.includes('sprach')) {
      category = 'student';
      avatar = '🎓';
    } else if (categoryText.includes('business') || categoryText.includes('marketing') || categoryText.includes('verkauf')) {
      category = 'business';
      avatar = '💼';
    } else if (categoryText.includes('design') || categoryText.includes('kunst') || categoryText.includes('kreativ')) {
      category = 'creative';
      avatar = '🎨';
    }
    
    // Smart tone mapping
    const toneText = chatData.tone?.toLowerCase() || '';
    let tone: 'professional' | 'casual' | 'friendly' | 'expert' = 'friendly';
    
    if (toneText.includes('motivier') || toneText.includes('anfeur')) {
      tone = 'friendly';
    } else if (toneText.includes('ruhig') || toneText.includes('sachlich')) {
      tone = 'professional';
    } else if (toneText.includes('locker') || toneText.includes('entspannt')) {
      tone = 'casual';
    } else if (toneText.includes('technisch') || toneText.includes('präzise') || toneText.includes('expert')) {
      tone = 'expert';
    }
    
    // Smart response style mapping
    const styleText = chatData.responseStyle?.toLowerCase() || '';
    let responseStyle: 'concise' | 'detailed' | 'creative' = 'detailed';
    
    if (styleText.includes('kurz') || styleText.includes('direkt') || styleText.includes('knapp')) {
      responseStyle = 'concise';
    } else if (styleText.includes('ausführlich') || styleText.includes('detail') || styleText.includes('erklär')) {
      responseStyle = 'detailed';
    } else if (styleText.includes('kreativ') || styleText.includes('inspirier')) {
      responseStyle = 'creative';
    }
    
    // Generate expertise from category answer instead of using template
    let expertise: string[] = [];
    if (categoryText.includes('lauf')) {
      expertise = ['Laufen', 'Ausdauertraining', 'Motivation', 'Trainingspläne'];
    } else if (categoryText.includes('sport') || categoryText.includes('fitness')) {
      expertise = ['Fitness', 'Training', 'Ernährung', 'Motivation'];
    } else if (categoryText.includes('javascript')) {
      expertise = ['JavaScript', 'Web Development', 'Frontend', 'React'];
    } else if (categoryText.includes('python')) {
      expertise = ['Python', 'Data Science', 'Backend', 'Automation'];
    } else if (categoryText.includes('programming') || categoryText.includes('code')) {
      expertise = ['Programming', 'Software Development', 'Problem Solving', 'Debugging'];
    } else if (chatData.expertise && Array.isArray(chatData.expertise)) {
      expertise = chatData.expertise;
    } else if (chatData.expertise) {
      expertise = [chatData.expertise];
    } else {
      // Use category answer as expertise
      expertise = [chatData.category || 'Allgemeinwissen'];
    }
    
    // Generate interests from goals and category
    let interests: string[] = [];
    const goalsText = chatData.goals?.toLowerCase() || '';
    if (goalsText.includes('marathon') || goalsText.includes('wettkampf')) {
      interests = ['Wettkampf', 'Leistung', 'Ausdauer', 'Disziplin'];
    } else if (goalsText.includes('abnehm') || goalsText.includes('gesund')) {
      interests = ['Gesundheit', 'Ernährung', 'Lifestyle', 'Wohlbefinden'];
    } else if (goalsText.includes('app') || goalsText.includes('projekt')) {
      interests = ['Innovation', 'Projekte', 'Technologie', 'Problemlösung'];
    } else {
      interests = ['Lernen', 'Verbesserung', 'Effizienz', 'Erfolg'];
    }
    
    return {
      name: chatData.name || 'Mein Assistent',
      description: chatData.goals || `Ein personalisierter Assistent für ${chatData.category || 'verschiedene Bereiche'}`,
      avatar: avatar,
      category: category,
      personality: {
        tone: tone,
        expertise: expertise,
        interests: interests,
        responseStyle: responseStyle
      },
      systemPrompt: `Du bist ${chatData.name}, ein ${tone === 'friendly' ? 'freundlicher und motivierender' : tone === 'professional' ? 'professioneller und sachlicher' : tone === 'casual' ? 'lockerer und entspannter' : 'technisch präziser'} Assistent für ${chatData.category}. 
      
Deine Expertise: ${expertise.join(', ')}
Benutzer-Ziele: ${chatData.goals}
Kommunikationsstil: ${toneText}
Antwort-Stil: ${responseStyle === 'concise' ? 'Kurz und direkt' : responseStyle === 'detailed' ? 'Ausführlich und erklärend' : 'Kreativ und inspirierend'}

Antworte immer im Kontext dieser Informationen und erinnere dich an die Präferenzen des Benutzers.`
    };
  };

  const handleCancelInterview = () => {
    setCreationMode("select");
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial="initial"
      animate="animate"
      variants={ANIMATION_PRESETS.slideUp}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (creationMode === "select") {
              router.push('/profiles');
            } else {
              setCreationMode("select");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neues AI-Profil</h1>
          <p className="text-muted-foreground">
            {creationMode === "select" && "Wähle, wie du dein Profil erstellen möchtest"}
            {creationMode === "template" && "Wähle eine vorgefertigte Vorlage"}
            {creationMode === "interview" && "Conversational AI-Interview"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Mode Selection */}
        {creationMode === "select" && (
          <motion.div
            key="select"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={ANIMATION_PRESETS.slideUp}
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                  onClick={() => setCreationMode("template")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg gradient-primary text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Schnell-Start Templates</CardTitle>
                    <CardDescription>
                      Vorgefertigte Profile für häufige Anwendungsfälle
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Wähle aus professionell erstellten Vorlagen wie Developer, Student, Business Coach oder Kreativ-Partner.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span>Sofort einsatzbereit</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                  onClick={() => setCreationMode("interview")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg gradient-primary text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>AI-Interview</CardTitle>
                    <CardDescription>
                      Personalisiertes Profil durch intelligente Fragen
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Beantworte ein paar Fragen und erhalte einen perfekt auf dich zugeschnittenen KI-Assistenten.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span>Vollständig personalisiert</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Template Selection */}
        {creationMode === "template" && (
          <motion.div
            key="template"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={ANIMATION_PRESETS.slideUp}
          >
            {Object.entries(PROFILE_TEMPLATES).map(([key, template]) => (
              <Card 
                key={key}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={() => handleTemplateSelect(key as keyof typeof PROFILE_TEMPLATES)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{template.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    {template.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.personality.expertise.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span>Verwenden</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* AI Interview Chat */}
        {creationMode === "interview" && (
          <motion.div
            key="interview-chat"
            variants={ANIMATION_PRESETS.slideUp}
          >
            <AIInterviewChat
              onComplete={handleInterviewComplete}
              onCancel={handleCancelInterview}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}