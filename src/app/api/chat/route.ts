import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, profileId, sessionId, profile, messageHistory } = await request.json();

    if (!message || !profile) {
      return NextResponse.json(
        { error: 'Message and profile are required' },
        { status: 400 }
      );
    }

    // Learn from user message before processing
    const learningInsights = analyzeUserMessage(message, profile);
    
    // Get existing context memories
    const contextMemories = getContextMemories(profileId);

    // Build system prompt based on profile and context
    const systemPrompt = buildSystemPrompt(profile, contextMemories);
    
    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add message history for context (last 10 messages)
    if (messageHistory && messageHistory.length > 0) {
      const recentHistory = messageHistory.slice(-10);
      recentHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any[],
      max_tokens: 1000,
      temperature: getTemperatureForProfile(profile),
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

    // Update context with new insights and conversation
    updateContextFromConversation(profileId, message, aiResponse, learningInsights);

    // Return response with metadata
    return NextResponse.json({
      message: aiResponse,
      profileId,
      sessionId,
      tokens: completion.usage?.total_tokens || 0,
      model: 'gpt-4',
      learned: learningInsights.length > 0 // Indicate if we learned something new
    });

  } catch (error) {
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API-Schlüssel-Fehler' },
          { status: 401 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate-Limit erreicht. Bitte versuchen Sie es später erneut.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten der Anfrage' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(profile: any, contextMemories: any[] = []): string {
  const basePersonality = {
    developer: "Du bist ein erfahrener Senior Developer mit tiefem technischen Wissen.",
    student: "Du bist ein geduldiger und motivierender Lern-Coach.",
    business: "Du bist ein strategischer Business-Berater mit Fokus auf Erfolg.",
    creative: "Du bist ein inspirierender Kreativ-Partner voller Ideen.",
    personal: "Du bist ein empathischer Lebens-Coach für persönliche Entwicklung.",
    general: "Du bist ein hilfreicher und vielseitiger AI-Assistent."
  };

  const toneAdjustments = {
    professional: "Antworte präzise, sachlich und professionell.",
    friendly: "Sei warm, zugänglich und unterstützend in deinen Antworten.",
    casual: "Antworte entspannt, persönlich und mit einer Prise Humor.",
    inspiring: "Sei motivierend, kreativ und visionär in deiner Kommunikation.",
    encouraging: "Ermutige und unterstütze den Nutzer bei allen Herausforderungen.",
    empathetic: "Zeige Verständnis und emotionale Intelligenz in deinen Antworten.",
    confident: "Antworte selbstbewusst und entscheidungsfreudig."
  };

  const responseStyleAdjustments = {
    concise: "Halte deine Antworten kurz und prägnant.",
    balanced: "Gib ausgewogene Antworten mit wichtigen Details.",
    detailed: "Erkläre ausführlich und umfassend.",
    supportive: "Fokussiere auf Ermutigung und praktische Hilfe.",
    strategic: "Denke strategisch und zielorientiert.",
    creative: "Denke außerhalb der Box und bringe kreative Perspektiven ein.",
    caring: "Sei verständnisvoll und respektvoll in deiner Kommunikation."
  };

  // Build the system prompt
  let prompt = profile.systemPrompt || (basePersonality as any)[profile.category] || basePersonality.general;
  
  // Add personality traits
  if (profile.personality) {
    if (profile.personality.tone && (toneAdjustments as any)[profile.personality.tone]) {
      prompt += ` ${(toneAdjustments as any)[profile.personality.tone]}`;
    }
    
    if (profile.personality.responseStyle && (responseStyleAdjustments as any)[profile.personality.responseStyle]) {
      prompt += ` ${(responseStyleAdjustments as any)[profile.personality.responseStyle]}`;
    }
    
    // Add expertise context
    if (profile.personality.expertise && profile.personality.expertise.length > 0) {
      prompt += ` Du hast besondere Expertise in: ${profile.personality.expertise.join(', ')}.`;
    }
    
    // Add interests context  
    if (profile.personality.interests && profile.personality.interests.length > 0) {
      prompt += ` Deine Interessensgebiete umfassen: ${profile.personality.interests.join(', ')}.`;
    }
  }

  // Add specific instructions based on category
  const categoryInstructions = {
    developer: " Nutze Code-Beispiele, erkläre Best Practices und gib konkrete technische Lösungen.",
    student: " Verwende Lernmethoden, erkläre schrittweise und ermutige zum Weitermachen.",
    business: " Fokussiere auf ROI, strategische Vorteile und praktische Umsetzung.",
    creative: " Bringe visuelle und kreative Ansätze ein und denke innovativ.",
    personal: " Achte auf Work-Life-Balance und persönliches Wohlbefinden.",
    general: " Sei flexibel und passe deinen Ansatz an die spezifische Frage an."
  };

  if ((categoryInstructions as any)[profile.category]) {
    prompt += (categoryInstructions as any)[profile.category];
  }

  // Add context memories for personalization
  if (contextMemories.length > 0) {
    prompt += "\n\nWICHTIGE KONTEXTINFORMATIONEN (aus vorherigen Gesprächen):\n";
    
    // Group memories by type
    const goals = contextMemories.filter(m => m.key === 'goals').map(m => m.value).flat();
    const preferences = contextMemories.filter(m => m.key === 'preferences').map(m => m.value);
    const achievements = contextMemories.filter(m => m.key === 'achievements').map(m => m.value);
    const challenges = contextMemories.filter(m => m.key === 'challenges').map(m => m.value);
    const interests = contextMemories.filter(m => m.key === 'user_interests').map(m => m.value);
    
    if (goals.length > 0) {
      prompt += `- Benutzer-Ziele: ${goals.join(', ')}\n`;
    }
    if (preferences.length > 0) {
      prompt += `- Präferenzen: ${preferences.join(', ')}\n`;
    }
    if (achievements.length > 0) {
      prompt += `- Erreichte Erfolge: ${achievements.join(', ')}\n`;
    }
    if (challenges.length > 0) {
      prompt += `- Herausforderungen: ${challenges.join(', ')}\n`;
    }
    if (interests.length > 0) {
      prompt += `- Zusätzliche Interessen: ${interests.join(', ')}\n`;
    }
    
    prompt += "\nNutze diese Informationen, um personalisierte und relevante Antworten zu geben. Erwähne relevante Details aus dem Kontext, wenn sie zur aktuellen Unterhaltung passen.";
  }

  // Final instructions
  prompt += "\n\nAntworte auf Deutsch, es sei denn, der Nutzer fragt explizit in einer anderen Sprache. Sei hilfsbereit, aber ehrlich, wenn du etwas nicht weißt.";

  return prompt;
}

function getTemperatureForProfile(profile: any): number {
  // Adjust creativity based on profile category and personality
  const baseTemperatures = {
    developer: 0.3,      // More deterministic for code
    student: 0.5,        // Balanced for learning
    business: 0.4,       // Slightly conservative for business
    creative: 0.8,       // Higher creativity for creative tasks
    personal: 0.6,       // Warmer for personal conversations
    general: 0.5         // Balanced default
  };

  let temperature = (baseTemperatures as any)[profile.category] || 0.5;

  // Adjust based on response style
  if (profile.personality?.responseStyle) {
    switch (profile.personality.responseStyle) {
      case 'creative':
        temperature += 0.2;
        break;
      case 'detailed':
        temperature -= 0.1;
        break;
      case 'concise':
        temperature -= 0.2;
        break;
    }
  }

  // Ensure temperature stays within valid range
  return Math.max(0.1, Math.min(1.0, temperature));
}

// Memory storage (in production, this would be a database)
let contextMemoriesStore: Record<string, any[]> = {};

function getContextMemories(profileId: string): any[] {
  return contextMemoriesStore[profileId] || [];
}

function addContextMemory(profileId: string, key: string, value: any, confidence: number = 0.8) {
  if (!contextMemoriesStore[profileId]) {
    contextMemoriesStore[profileId] = [];
  }
  
  const memory = {
    id: `${profileId}-${key}-${Date.now()}`,
    profileId,
    key,
    value,
    confidence,
    createdAt: new Date(),
    lastAccessedAt: new Date()
  };
  
  contextMemoriesStore[profileId].push(memory);
  
  // Keep only recent memories (max 50 per profile)
  if (contextMemoriesStore[profileId].length > 50) {
    contextMemoriesStore[profileId] = contextMemoriesStore[profileId].slice(-50);
  }
}

function analyzeUserMessage(message: string, profile: any): any[] {
  const insights: any[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Super fast keyword detection with regex
  const patterns = {
    goals: /(will|möchte|plane|ziel|vorhaben|schaffen|erreichen|trainieren für|lernen|verbessern|entwickeln)/,
    achievements: /(geschafft|erreicht|erfolgreich|bestanden|gewonnen|abgeschlossen|fertiggestellt)/,
    challenges: /(problem|schwierigkeit|herausforderung|kämpfe|struggle|schwer|nicht gut|versagt|fehler)/,
    preferences: /(mag|liebe|bevorzuge|gefällt|am liebsten|favorit)/
  };
  
  // Quick check for each pattern
  Object.entries(patterns).forEach(([type, pattern]) => {
    const match = lowerMessage.match(pattern);
    if (match) {
      // Extract just the relevant part around the match
      const matchIndex = lowerMessage.indexOf(match[0]);
      const start = Math.max(0, matchIndex - 20);
      const end = Math.min(message.length, matchIndex + 50);
      const context = message.substring(start, end).trim();
      
      insights.push({
        type,
        key: type,
        value: context,
        confidence: type === 'achievements' ? 0.9 : 0.7
      });
    }
  });
  
  return insights;
}

function updateContextFromConversation(profileId: string, userMessage: string, aiResponse: string, insights: any[]) {
  // Store new insights
  insights.forEach(insight => {
    addContextMemory(profileId, insight.key, insight.value, insight.confidence);
  });
  
  // Update last interaction time
  addContextMemory(profileId, 'last_interaction', {
    timestamp: new Date(),
    userMessage: userMessage.substring(0, 100), // Store snippet for context
    aiResponse: aiResponse.substring(0, 100)
  }, 1.0);
}