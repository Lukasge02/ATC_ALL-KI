import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  settings: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  usage: {
    tokensUsed: number;
    requestsToday: number;
    lastReset: string;
  };
  createdAt: string;
}

export interface AIProfile {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: 'developer' | 'student' | 'business' | 'creative' | 'personal';
  personality: {
    tone: 'professional' | 'casual' | 'friendly' | 'expert';
    expertise: string[];
    interests: string[];
    responseStyle: 'concise' | 'detailed' | 'creative';
  };
  usage: {
    totalChats: number;
    totalTokens: number;
    lastUsed: string;
  };
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  profiles: AIProfile[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  
  // Profile actions
  setProfiles: (profiles: AIProfile[]) => void;
  addProfile: (profile: AIProfile) => void;
  updateProfile: (id: string, profile: Partial<AIProfile>) => void;
  removeProfile: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profiles: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.login(email, password);
          
          set({
            user: response.user,
            profiles: response.profiles || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login fehlgeschlagen',
            isAuthenticated: false,
            user: null,
            profiles: [],
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.register(email, password, name);
          
          // After registration, automatically log in
          await get().login(email, password);
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registrierung fehlgeschlagen',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
        } finally {
          set({
            user: null,
            profiles: [],
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      refreshUser: async () => {
        try {
          const token = apiClient.getToken();
          if (!token) {
            set({ isAuthenticated: false, user: null, profiles: [], isLoading: false });
            return;
          }

          set({ isLoading: true });
          const response = await apiClient.getCurrentUser();
          
          set({
            user: response.user,
            profiles: response.profiles || [],
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Check if we still have user data in storage
          const state = get();
          if (state.user && state.isAuthenticated) {
            // Keep existing data if we have it
            set({ isLoading: false });
          } else {
            // Only logout if we don't have any user data
            set({ isLoading: false, isAuthenticated: false, user: null, profiles: [] });
          }
        }
      },

      // Profile actions
      setProfiles: (profiles: AIProfile[]) => {
        set({ profiles });
      },

      addProfile: (profile: AIProfile) => {
        set((state) => ({
          profiles: [...state.profiles, profile]
        }));
      },

      updateProfile: (id: string, profileUpdate: Partial<AIProfile>) => {
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id ? { ...profile, ...profileUpdate } : profile
          )
        }));
      },

      removeProfile: (id: string) => {
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== id)
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profiles: state.profiles,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);