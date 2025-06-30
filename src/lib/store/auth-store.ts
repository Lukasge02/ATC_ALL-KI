import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
  id: string;
  name: string;
  category: string;
  avatar: string;
  createdAt: Date;
  personality: {
    tone: string;
    responseStyle: string;
    expertise: string[];
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  // User
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Profiles
  profiles: Profile[];
  
  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      profiles: [],

      // Actions
      setUser: (user) => 
        set({ 
          currentUser: user, 
          isAuthenticated: !!user 
        }),

      logout: () => 
        set({ 
          currentUser: null, 
          isAuthenticated: false,
          profiles: []
        }),

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile]
        })),

      updateProfile: (id, updates) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id ? { ...profile, ...updates } : profile
          )
        })),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== id)
        }))
    }),
    {
      name: 'auth-storage', // unique name for localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        profiles: state.profiles
      })
    }
  )
);