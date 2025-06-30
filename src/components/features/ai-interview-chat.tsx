"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  CheckCircle,
  Loader2,
  ArrowRight,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION_PRESETS } from "@/lib/constants";
import { useContextStore } from "@/lib/store/useContextStore";

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface ProfileData {
  name?: string;
  category?: string;
  tone?: string;
  expertise?: string[];
  goals?: string;
  responseStyle?: string;
}

interface AIInterviewChatProps {
  onComplete: (profileData: ProfileData) => void;
  onCancel: () => void;
}

// Vereinfachte Questions mit Smart Context
const getNextQuestion = (data: ProfileData, questionNumber: number): string => {
  const name = data.name || 'dein Assistent';
  
  switch (questionNumber) {
    case 1:
      return "Hi! 👋 Wie soll dein AI-Assistent heißen?";
    
    case 2:
      const lowerName = name.toLowerCase();
      if (lowerName.includes('sport') || lowerName.includes('fit')) {
        return `${name} für Sport! Welche Sportart oder Fitness-Ziele hast du? (z.B. Laufen, Krafttraining, Yoga)`;
      }
      if (lowerName.includes('dev') || lowerName.includes('code')) {
        return `${name} für Entwicklung! Welche Programmiersprachen oder Technologien interessieren dich?`;
      }
      if (lowerName.includes('learn') || lowerName.includes('study')) {
        return `${name} als Lern-Buddy! Was möchtest du lernen oder in welchem Bereich brauchst du Hilfe?`;
      }
      return `${name} ist ein schöner Name! In welchem Bereich soll er dir hauptsächlich helfen?`;
    
    case 3:
      const category = data.category?.toLowerCase() || '';
      if (category.includes('sport') || category.includes('lauf') || category.includes('fitness')) {
        return `Perfekt! Soll ${name} dich motivierend anfeuern oder eher ruhig und sachlich beraten?`;
      }
      if (category.includes('programming') || category.includes('code') || category.includes('entwickl')) {
        return `Super! Soll ${name} technisch-präzise antworten oder eher locker und erklärend?`;
      }
      return `Wie soll ${name} mit dir kommunizieren? Eher freundlich-motivierend oder sachlich-professionell?`;
    
    case 4:
      return `Was ist dein Hauptziel mit ${name}? Was möchtest du konkret erreichen oder verbessern?`;
    
    case 5:
      return `Fast fertig! Soll ${name} dir lieber kurze, direkte Antworten geben oder ausführlich erklären?`;
    
    case 6:
      return `Noch eine letzte Frage: Welche spezifischen Themen oder Fähigkeiten sind dir besonders wichtig?`;
    
    default:
      return "Erzähl mir mehr über deine Bedürfnisse!";
  }
};

export default function AIInterviewChat({ onComplete, onCancel }: AIInterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [canCreateProfile, setCanCreateProfile] = useState(false);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addMemory } = useContextStore();
  const tempProfileId = useRef(`interview-${Date.now()}`).current;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Focus input when ready
  useEffect(() => {
    if (!isAiTyping && isStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAiTyping, isStarted]);

  // Check if we can create profile (after 3 questions)
  useEffect(() => {
    if (questionNumber >= 4 && profileData.name && profileData.category) {
      setCanCreateProfile(true);
    }
  }, [questionNumber, profileData]);

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const message: Message = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addAiMessage = (content: string) => {
    setIsAiTyping(true);
    setTimeout(() => {
      addMessage('ai', content);
      setIsAiTyping(false);
    }, 800 + Math.random() * 400);
  };

  const startInterview = () => {
    setIsStarted(true);
    const firstQuestion = getNextQuestion({}, 1);
    addAiMessage(firstQuestion);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim() || isAiTyping) return;

    const userMessage = currentInput.trim();
    addMessage('user', userMessage);

    // Update profile data based on question number
    let updatedData = { ...profileData };
    
    switch (questionNumber) {
      case 1:
        updatedData.name = userMessage;
        // Store name in context memory
        addMemory(tempProfileId, 'profile_name', userMessage, 'interview', 1.0);
        break;
      case 2:
        updatedData.category = userMessage;
        // Store category in context memory
        addMemory(tempProfileId, 'category', userMessage, 'interview', 0.9);
        break;
      case 3:
        updatedData.tone = userMessage;
        // Store communication style in context memory
        addMemory(tempProfileId, 'communication_style', userMessage, 'interview', 0.9);
        break;
      case 4:
        updatedData.goals = userMessage;
        // Store goals in context memory
        addMemory(tempProfileId, 'goals', [userMessage], 'interview', 0.9);
        break;
      case 5:
        updatedData.responseStyle = userMessage;
        // Store response style in context memory
        addMemory(tempProfileId, 'response_style', userMessage, 'interview', 0.9);
        break;
      case 6:
        // Parse expertise as array
        const expertiseArray = userMessage
          .split(/[,\n•·\-\*]/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        updatedData.expertise = expertiseArray;
        // Store expertise in context memory
        addMemory(tempProfileId, 'expertise', expertiseArray, 'interview', 0.9);
        break;
    }

    setProfileData(updatedData);
    setCurrentInput("");

    // Move to next question or show completion
    const nextQuestionNum = questionNumber + 1;
    
    if (nextQuestionNum <= 6) {
      setTimeout(() => {
        const nextQuestion = getNextQuestion(updatedData, nextQuestionNum);
        addAiMessage(nextQuestion);
        setQuestionNumber(nextQuestionNum);
        
        // Show create option after question 3
        if (nextQuestionNum > 3) {
          setTimeout(() => {
            setShowCreateOption(true);
          }, 1000);
        }
      }, 1000);
    } else {
      // Interview complete
      setTimeout(() => {
        const expertiseText = Array.isArray(updatedData.expertise) 
          ? updatedData.expertise.join(', ') 
          : updatedData.expertise || 'Allgemeinwissen';
        
        addAiMessage(
          `Perfekt! 🎉 ${updatedData.name} ist bereit!\n\n**Dein personalisierter Assistent:**\n• **Name:** ${updatedData.name}\n• **Bereich:** ${updatedData.category}\n• **Stil:** ${updatedData.tone}\n• **Expertise:** ${expertiseText}\n• **Ziele:** ${updatedData.goals}\n• **Antwort-Stil:** ${updatedData.responseStyle}\n\nBereit zum Erstellen?`
        );
        setShowCreateOption(true);
      }, 1000);
    }
  };

  const handleCreateProfile = () => {
    // Ensure minimum required data
    const finalData = {
      name: profileData.name || 'Mein Assistent',
      category: profileData.category || 'Allgemein',
      tone: profileData.tone || 'freundlich',
      expertise: profileData.expertise || ['Allgemeinwissen'],
      goals: profileData.goals || 'Hilfe und Unterstützung',
      responseStyle: profileData.responseStyle || 'ausgewogen',
      // Pass the tempProfileId so the parent can transfer memories
      _interviewContextId: tempProfileId
    };
    
    // Add final summary to context memory
    addMemory(tempProfileId, 'interview_completed', {
      name: finalData.name,
      category: finalData.category,
      tone: finalData.tone,
      goals: finalData.goals,
      responseStyle: finalData.responseStyle,
      expertise: finalData.expertise,
      completedAt: new Date().toISOString()
    }, 'interview', 1.0);
    
    onComplete(finalData);
  };

  const progressPercentage = Math.round(Math.min((questionNumber / 6) * 100, 100));

  if (!isStarted) {
    return (
      <motion.div
        className="max-w-4xl mx-auto h-[600px] flex flex-col items-center justify-center text-center space-y-6"
        initial="initial"
        animate="animate"
        variants={ANIMATION_PRESETS.slideUp}
      >
        <div className="space-y-4">
          <Avatar className="h-16 w-16 mx-auto">
            <AvatarFallback className="gradient-primary text-white">
              <Sparkles className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">AI Profile Interview</h2>
            <p className="text-muted-foreground max-w-md">
              Beantworte ein paar einfache Fragen und ich erstelle einen perfekt 
              auf dich zugeschnittenen KI-Assistenten. Du kannst schon nach 3-4 Fragen starten!
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">⚡ 2-3 Minuten</Badge>
            <Badge variant="outline">🎯 Personalisiert</Badge>
            <Badge variant="outline">✨ Intelligent</Badge>
          </div>
        </div>
        
        <Button onClick={startInterview} variant="gradient" size="lg" className="gap-2">
          <Play className="h-5 w-5" />
          Interview starten
        </Button>
        
        <Button variant="ghost" onClick={onCancel} className="text-sm">
          Abbrechen
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto h-[600px] flex flex-col"
      initial="initial"
      animate="animate"
      variants={ANIMATION_PRESETS.slideUp}
    >
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="gradient-primary text-white">
                <Sparkles className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">AI Profile Interview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Frage {questionNumber} von 6 {canCreateProfile && "(kann jederzeit erstellt werden)"}
              </p>
            </div>
            <div className="w-24">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="gradient-primary text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-12'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="gradient-primary text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">tippt...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-3 w-full">
              <Textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Deine Antwort... (Enter zum Senden)"
                disabled={isAiTyping}
                className="w-full resize-none"
                rows={3}
              />
              
              <div className="flex justify-between items-center">
                {/* Create Profile Option (appears after question 3) */}
                {showCreateOption && canCreateProfile && (
                  <Button 
                    variant="outline" 
                    onClick={handleCreateProfile}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Jetzt Profil erstellen
                  </Button>
                )}
                
                <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" onClick={onCancel}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isAiTyping}
                    variant="gradient"
                    className="px-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Senden
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}