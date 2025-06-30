import { create } from 'zustand';
import apiClient from '@/lib/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  metadata?: {
    model?: string;
    finishReason?: string;
    responseTime?: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  profile: {
    id: string;
    name: string;
    avatar: string;
    category: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    role: 'user' | 'assistant';
  } | null;
  messageCount: number;
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedConversation extends Conversation {
  messages: ChatMessage[];
  metadata: {
    totalTokens: number;
    model: string;
    avgResponseTime: number;
  };
}

interface ChatState {
  // State
  conversations: Conversation[];
  currentConversation: DetailedConversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  fetchConversations: (profileId?: string) => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  sendMessage: (profileId: string, message: string, conversationId?: string) => Promise<any>;
  deleteConversation: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentConversation: () => void;
  setCurrentConversation: (conversation: DetailedConversation | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isSending: false,
  error: null,

  // Actions
  fetchConversations: async (profileId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.getConversations(profileId);
      
      set({
        conversations: response.conversations || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
      });
    }
  },

  fetchConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiClient.getConversation(id);
      
      set({
        currentConversation: response.conversation,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch conversation',
      });
    }
  },

  sendMessage: async (profileId: string, message: string, conversationId?: string) => {
    try {
      set({ isSending: true, error: null });
      
      const response = await apiClient.sendMessage(profileId, message, conversationId);
      
      // If this is a new conversation, add it to the list
      if (!conversationId) {
        await get().fetchConversations();
      }
      
      // If we have a current conversation, refresh it to get the new message
      if (get().currentConversation) {
        await get().fetchConversation(response.response.conversationId);
      }
      
      set({ isSending: false });
      
      return response;
    } catch (error) {
      set({
        isSending: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
      throw error;
    }
  },

  deleteConversation: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await apiClient.deleteConversation(id);
      
      // Remove from conversations list
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete conversation',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null });
  },

  setCurrentConversation: (conversation: DetailedConversation | null) => {
    set({ currentConversation: conversation });
  },
}));