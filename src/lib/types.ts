// Widget System Types
export type WidgetSize = "1x1" | "2x1" | "2x2" | "3x1" | "3x2";
export type WidgetType = "quick-chat" | "calendar" | "analytics" | "notes" | "habits" | "focus-timer";

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  config: Record<string, any>;
  data?: any;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI Profile Types
export interface AIProfile {
  id: string;
  name: string;
  description: string;
  category: ProfileCategory;
  avatar?: string;
  personality: PersonalityTraits;
  expertise: string[];
  settings: ProfileSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  systemPrompt?: string;
  usage?: {
    totalChats: number;
    totalTokens: number;
    lastUsed: Date | null;
  };
}

export type ProfileCategory = 
  | "developer" 
  | "student" 
  | "business" 
  | "creative" 
  | "personal" 
  | "general";

export interface PersonalityTraits {
  formality: number; // 1-10
  creativity: number; // 1-10
  empathy: number; // 1-10
  humor: number; // 1-10
  verbosity: number; // 1-10
}

export interface ProfileSettings {
  language: string;
  responseLength: "short" | "medium" | "long";
  includeExamples: boolean;
  askClarifyingQuestions: boolean;
  rememberConversations: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  profileId?: string;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  responseTime?: number;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface Conversation {
  id: string;
  title: string;
  profileId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  tags: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  mobile: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  shareUsageData: boolean;
  enableAnalytics: boolean;
  dataRetention: number; // days
}

export type SubscriptionTier = "free" | "pro" | "enterprise";

// Dashboard Types
export interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  gridCols: number;
  isDefault: boolean;
  userId: string;
}

// Analytics Types
export interface UsageStats {
  totalMessages: number;
  activeProfiles: number;
  averageSessionTime: number;
  favoriteFeatures: string[];
  dailyUsage: DailyUsage[];
}

export interface DailyUsage {
  date: string;
  messages: number;
  sessions: number;
  duration: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "radio";
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface ValidationRule {
  type: "required" | "email" | "minLength" | "maxLength" | "pattern";
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Habit Tracking Types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  frequency: HabitFrequency;
  streak: number;
  completions: HabitCompletion[];
  createdAt: Date;
  isActive: boolean;
}

export interface HabitFrequency {
  type: "daily" | "weekly" | "custom";
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  target?: number; // times per period
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: Date;
  note?: string;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  isAllDay: boolean;
  color?: string;
  source: "google" | "outlook" | "manual";
}

// Focus Timer Types
export interface FocusSession {
  id: string;
  duration: number; // minutes
  type: "work" | "break" | "long-break";
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  notes?: string;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Theme Types
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
  borderRadius: number;
  fontFamily: string;
}