import { WidgetType, ProfileCategory, WidgetSize } from "./types";

// App Configuration
export const APP_CONFIG = {
  name: "ALL-KI",
  description: "Deine KI für den Alltag - für Alles",
  version: "1.0.0",
  url: "https://all-ki.app",
  email: "support@all-ki.app",
} as const;

// Widget Configuration
export const WIDGET_TYPES: Record<WidgetType, { label: string; icon: string; description: string }> = {
  "quick-chat": {
    label: "Quick Chat",
    icon: "MessageCircle",
    description: "Instant AI conversation widget"
  },
  "calendar": {
    label: "Calendar",
    icon: "Calendar",
    description: "Upcoming events and meetings"
  },
  "analytics": {
    label: "Analytics",
    icon: "BarChart3",
    description: "Usage statistics with charts"
  },
  "notes": {
    label: "Notes",
    icon: "FileText",
    description: "Quick capture and AI-enhanced notes"
  },
  "habits": {
    label: "Habits",
    icon: "Target",
    description: "Habit tracking with streaks"
  },
  "focus-timer": {
    label: "Focus Timer",
    icon: "Timer",
    description: "Pomodoro timer with AI insights"
  }
} as const;

export const WIDGET_SIZES: Record<WidgetSize, { width: number; height: number; label: string }> = {
  "1x1": { width: 1, height: 1, label: "Klein" },
  "2x1": { width: 2, height: 1, label: "Breit" },
  "2x2": { width: 2, height: 2, label: "Quadrat" },
  "3x1": { width: 3, height: 1, label: "Extra Breit" },
  "3x2": { width: 3, height: 2, label: "Groß" }
} as const;

// AI Profile Categories
export const PROFILE_CATEGORIES: Record<ProfileCategory, { label: string; icon: string; color: string }> = {
  "developer": {
    label: "Developer",
    icon: "Code",
    color: "text-blue-500"
  },
  "student": {
    label: "Student",
    icon: "GraduationCap",
    color: "text-green-500"
  },
  "business": {
    label: "Business",
    icon: "Briefcase",
    color: "text-purple-500"
  },
  "creative": {
    label: "Creative",
    icon: "Palette",
    color: "text-pink-500"
  },
  "personal": {
    label: "Personal",
    icon: "Heart",
    color: "text-red-500"
  },
  "general": {
    label: "General Assistant",
    icon: "Bot",
    color: "text-gray-500"
  }
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "Home"
  },
  {
    label: "Chat",
    href: "/chat",
    icon: "MessageSquare"
  },
  {
    label: "Profile",
    href: "/profiles",
    icon: "Users"
  },
  {
    label: "Einstellungen",
    href: "/settings",
    icon: "Settings"
  }
] as const;

// Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: "hsl(262, 83%, 58%)",
    secondary: "hsl(210, 40%, 98%)",
    accent: "hsl(210, 40%, 98%)",
    success: "hsl(142, 71%, 45%)",
    warning: "hsl(38, 92%, 50%)",
    error: "hsl(0, 84%, 60%)"
  },
  gradients: {
    primary: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    secondary: "linear-gradient(135deg, #64748B 0%, #475569 100%)"
  },
  animations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms"
  }
} as const;

// Grid Configuration
export const GRID_CONFIG = {
  columns: 12,
  gap: 16,
  minItemWidth: 200,
  minItemHeight: 150,
  maxColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
    wide: 6
  }
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;

// Form Validation
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  name: {
    minLength: 2,
    maxLength: 50
  }
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  retries: 3
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  theme: "all-ki-theme",
  sidebarState: "all-ki-sidebar-state",
  dashboardLayout: "all-ki-dashboard-layout",
  userPreferences: "all-ki-user-preferences",
  chatHistory: "all-ki-chat-history"
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enableDragAndDrop: true,
  enableWidgetMarketplace: true,
  enableAnalytics: true,
  enableExport: true,
  enableNotifications: true,
  enableCollaboration: false
} as const;

// Limits
export const LIMITS = {
  maxWidgetsPerDashboard: 20,
  maxProfilesPerUser: 10,
  maxConversationsPerProfile: 100,
  maxMessagesPerConversation: 1000,
  maxFileUploadSize: 10 * 1024 * 1024, // 10MB
  maxNoteLength: 10000
} as const;

// Animation Presets
export const ANIMATION_PRESETS = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
} as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: "system" as const,
  language: "de",
  timezone: "Europe/Berlin",
  gridColumns: 12,
  autoSave: true,
  notifications: {
    email: true,
    browser: true,
    mobile: false,
    weeklyDigest: true
  },
  privacy: {
    shareUsageData: false,
    enableAnalytics: true,
    dataRetention: 30
  },
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false
  }
} as const;

// Status Messages
export const STATUS_MESSAGES = {
  loading: "Wird geladen...",
  error: "Ein Fehler ist aufgetreten",
  success: "Erfolgreich gespeichert",
  noData: "Keine Daten verfügbar",
  unauthorized: "Nicht autorisiert",
  networkError: "Netzwerkfehler"
} as const;