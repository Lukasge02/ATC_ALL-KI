import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ContextMemory {
  id: string;
  profileId: string;
  key: string; // e.g. 'goals', 'preferences', 'expertise', 'style'
  value: any;
  source: 'chat' | 'profile' | 'user-input' | 'interview';
  confidence: number; // 0-1, how confident we are in this information
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
}

export interface ProfileContext {
  profileId: string;
  memories: ContextMemory[];
  lastUpdated: Date;
  conversationCount: number;
  totalInteractions: number;
}

interface ContextState {
  // State
  contexts: Record<string, ProfileContext>; // profileId -> context
  isLoading: boolean;
  error: string | null;

  // Actions
  addMemory: (profileId: string, key: string, value: any, source: 'chat' | 'profile' | 'user-input' | 'interview', confidence?: number) => void;
  updateMemory: (profileId: string, memoryId: string, updates: Partial<ContextMemory>) => void;
  removeMemory: (profileId: string, memoryId: string) => void;
  getMemory: (profileId: string, key: string) => ContextMemory | null;
  getMemories: (profileId: string) => ContextMemory[];
  getContextSummary: (profileId: string) => string;
  clearContext: (profileId: string) => void;
  analyzeMessage: (profileId: string, message: string, isUserMessage: boolean) => ContextMemory[];
  transferMemoriesToProfile: (sourceProfileId: string, targetProfileId: string) => void;
  
  // Learning functions
  extractGoalsFromMessage: (message: string) => string[];
  extractPreferencesFromMessage: (message: string) => Record<string, any>;
  extractExpertiseFromMessage: (message: string) => string[];
  updateContextFromConversation: (profileId: string, userMessage: string, aiResponse: string) => void;
}

export const useContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      // Initial state
      contexts: {},
      isLoading: false,
      error: null,

      // Add new memory
      addMemory: (profileId: string, key: string, value: any, source: 'chat' | 'profile' | 'user-input' | 'interview', confidence = 0.8) => {
        const now = new Date();
        const memoryId = `${profileId}-${key}-${Date.now()}`;
        
        const newMemory: ContextMemory = {
          id: memoryId,
          profileId,
          key,
          value,
          source,
          confidence,
          createdAt: now,
          updatedAt: now,
          lastAccessedAt: now,
          isActive: true
        };

        set((state) => {
          const context = state.contexts[profileId] || {
            profileId,
            memories: [],
            lastUpdated: now,
            conversationCount: 0,
            totalInteractions: 0
          };

          // Remove old memories with same key if new confidence is higher
          const filteredMemories = context.memories.filter(m => 
            !(m.key === key && m.confidence < confidence)
          );

          return {
            contexts: {
              ...state.contexts,
              [profileId]: {
                ...context,
                memories: [...filteredMemories, newMemory],
                lastUpdated: now,
                totalInteractions: context.totalInteractions + 1
              }
            }
          };
        });
      },

      // Update existing memory
      updateMemory: (profileId: string, memoryId: string, updates: Partial<ContextMemory>) => {
        set((state) => {
          const context = state.contexts[profileId];
          if (!context) return state;

          const updatedMemories = context.memories.map(memory =>
            memory.id === memoryId
              ? { ...memory, ...updates, updatedAt: new Date() }
              : memory
          );

          return {
            contexts: {
              ...state.contexts,
              [profileId]: {
                ...context,
                memories: updatedMemories,
                lastUpdated: new Date()
              }
            }
          };
        });
      },

      // Remove memory
      removeMemory: (profileId: string, memoryId: string) => {
        set((state) => {
          const context = state.contexts[profileId];
          if (!context) return state;

          return {
            contexts: {
              ...state.contexts,
              [profileId]: {
                ...context,
                memories: context.memories.filter(m => m.id !== memoryId),
                lastUpdated: new Date()
              }
            }
          };
        });
      },

      // Get specific memory
      getMemory: (profileId: string, key: string) => {
        const context = get().contexts[profileId];
        if (!context) return null;

        const memories = context.memories
          .filter(m => m.key === key && m.isActive)
          .sort((a, b) => b.confidence - a.confidence || b.updatedAt.getTime() - a.updatedAt.getTime());

        const memory = memories[0] || null;
        
        // Update last accessed time
        if (memory) {
          get().updateMemory(profileId, memory.id, { lastAccessedAt: new Date() });
        }

        return memory;
      },

      // Get all memories for profile
      getMemories: (profileId: string) => {
        const context = get().contexts[profileId];
        return context?.memories.filter(m => m.isActive) || [];
      },

      // Generate context summary
      getContextSummary: (profileId: string) => {
        const memories = get().getMemories(profileId);
        
        const goalMemories = memories.filter(m => m.key === 'goals');
        const preferenceMemories = memories.filter(m => m.key === 'preferences');
        const expertiseMemories = memories.filter(m => m.key === 'expertise');
        const styleMemories = memories.filter(m => m.key === 'communication_style');

        let summary = '';

        if (goalMemories.length > 0) {
          const goals = goalMemories.map(m => m.value).flat();
          summary += `Ziele: ${goals.join(', ')}. `;
        }

        if (preferenceMemories.length > 0) {
          const prefs = preferenceMemories.map(m => 
            typeof m.value === 'object' ? Object.entries(m.value).map(([k,v]) => `${k}: ${v}`).join(', ') : m.value
          ).join(', ');
          summary += `Präferenzen: ${prefs}. `;
        }

        if (expertiseMemories.length > 0) {
          const expertise = expertiseMemories.map(m => m.value).flat();
          summary += `Expertise-Bereiche: ${expertise.join(', ')}. `;
        }

        if (styleMemories.length > 0) {
          const styles = styleMemories.map(m => m.value).join(', ');
          summary += `Kommunikationsstil: ${styles}. `;
        }

        return summary.trim();
      },

      // Clear all context for profile
      clearContext: (profileId: string) => {
        set((state) => {
          const newContexts = { ...state.contexts };
          delete newContexts[profileId];
          return { contexts: newContexts };
        });
      },

      // Analyze message for context extraction
      analyzeMessage: (profileId: string, message: string, isUserMessage: boolean) => {
        const extractedMemories: ContextMemory[] = [];
        const addMemory = get().addMemory;

        if (isUserMessage) {
          // Extract goals
          const goals = get().extractGoalsFromMessage(message);
          if (goals.length > 0) {
            addMemory(profileId, 'goals', goals, 'chat', 0.7);
          }

          // Extract preferences
          const preferences = get().extractPreferencesFromMessage(message);
          if (Object.keys(preferences).length > 0) {
            addMemory(profileId, 'preferences', preferences, 'chat', 0.6);
          }

          // Extract expertise interests
          const expertise = get().extractExpertiseFromMessage(message);
          if (expertise.length > 0) {
            addMemory(profileId, 'expertise', expertise, 'chat', 0.6);
          }
        }

        return extractedMemories;
      },

      // Extract goals from message
      extractGoalsFromMessage: (message: string) => {
        const goals: string[] = [];
        const lowerMessage = message.toLowerCase();

        // Goal indicators
        const goalPatterns = [
          /ich möchte\s+(.+)/g,
          /ich will\s+(.+)/g,
          /mein ziel ist\s+(.+)/g,
          /ich plane\s+(.+)/g,
          /ich arbeite an\s+(.+)/g,
          /ich lerne\s+(.+)/g,
          /ich entwickle\s+(.+)/g,
          /ich baue\s+(.+)/g,
          /ich schreibe\s+(.+)/g
        ];

        goalPatterns.forEach(pattern => {
          const matches = lowerMessage.matchAll(pattern);
          for (const match of matches) {
            if (match[1] && match[1].length > 3) {
              goals.push(match[1].trim());
            }
          }
        });

        return goals;
      },

      // Extract preferences from message
      extractPreferencesFromMessage: (message: string) => {
        const preferences: Record<string, any> = {};
        const lowerMessage = message.toLowerCase();

        // Response length preferences
        if (lowerMessage.includes('kurz') || lowerMessage.includes('knapp') || lowerMessage.includes('prägnant')) {
          preferences.responseLength = 'short';
        } else if (lowerMessage.includes('ausführlich') || lowerMessage.includes('detailliert') || lowerMessage.includes('genau')) {
          preferences.responseLength = 'detailed';
        }

        // Communication style preferences
        if (lowerMessage.includes('formal') || lowerMessage.includes('professionell')) {
          preferences.communicationStyle = 'professional';
        } else if (lowerMessage.includes('locker') || lowerMessage.includes('entspannt') || lowerMessage.includes('casual')) {
          preferences.communicationStyle = 'casual';
        } else if (lowerMessage.includes('freundlich') || lowerMessage.includes('warm')) {
          preferences.communicationStyle = 'friendly';
        }

        // Examples preference
        if (lowerMessage.includes('beispiel') || lowerMessage.includes('zeig mir')) {
          preferences.includeExamples = true;
        }

        return preferences;
      },

      // Extract expertise from message
      extractExpertiseFromMessage: (message: string) => {
        const expertise: string[] = [];
        const lowerMessage = message.toLowerCase();

        // Programming languages
        const programmingLanguages = ['javascript', 'python', 'java', 'typescript', 'react', 'node.js', 'php', 'c++', 'go', 'rust'];
        const technologies = ['docker', 'kubernetes', 'aws', 'azure', 'mongodb', 'postgresql', 'redis', 'graphql'];
        const designTools = ['figma', 'photoshop', 'illustrator', 'sketch', 'canva'];
        const skills = ['marketing', 'seo', 'projektmanagement', 'leadership', 'design', 'fotografie', 'schreiben'];

        [...programmingLanguages, ...technologies, ...designTools, ...skills].forEach(skill => {
          if (lowerMessage.includes(skill)) {
            expertise.push(skill);
          }
        });

        return expertise;
      },

      // Update context from conversation
      updateContextFromConversation: (profileId: string, userMessage: string, aiResponse: string) => {
        // Analyze user message
        get().analyzeMessage(profileId, userMessage, true);
        
        // Update conversation count
        set((state) => {
          const context = state.contexts[profileId];
          if (!context) return state;

          return {
            contexts: {
              ...state.contexts,
              [profileId]: {
                ...context,
                conversationCount: context.conversationCount + 1,
                lastUpdated: new Date()
              }
            }
          };
        });
      },

      // Transfer memories from source profile to target profile
      transferMemoriesToProfile: (sourceProfileId: string, targetProfileId: string) => {
        set((state) => {
          const sourceContext = state.contexts[sourceProfileId];
          if (!sourceContext) return state;

          const now = new Date();
          const targetContext = state.contexts[targetProfileId] || {
            profileId: targetProfileId,
            memories: [],
            lastUpdated: now,
            conversationCount: 0,
            totalInteractions: 0
          };

          // Copy all memories from source to target with updated profileId
          const transferredMemories = sourceContext.memories.map(memory => ({
            ...memory,
            id: `${targetProfileId}-${memory.key}-${Date.now()}-${Math.random()}`,
            profileId: targetProfileId,
            source: 'interview' as const,
            lastAccessedAt: now,
            updatedAt: now
          }));

          return {
            contexts: {
              ...state.contexts,
              [targetProfileId]: {
                ...targetContext,
                memories: [...targetContext.memories, ...transferredMemories],
                lastUpdated: now
              }
            }
          };
        });
      }
    }),
    {
      name: 'context-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contexts: state.contexts,
      }),
    }
  )
);