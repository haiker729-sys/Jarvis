export type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface ChatTurn {
  id: string;
  userTranscript: string;
  jarvisResponse: string;
  timestamp: number;
  status?: 'success' | 'executing' | 'error';
  commandExecuted?: string;
  actionDetails?: string;
}

export type MemoryCategory = 'Personal' | 'Preferences' | 'Contacts' | 'Routines' | 'Notes';

export interface MemoryEntity {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  rawText: string;
  timestamp: number;
}

export type AppTheme = 'sunset' | 'dark' | 'red' | 'light';

export type PersonaType =
  | 'Jarvis Pro'
  | 'Naira'
  | 'Girlfriend Mode'
  | 'Boyfriend Mode'
  | 'TechGPT X Mode'
  | 'Companion Mode'
  | 'Focus Mode'
  | 'Professional Mode';

export interface AppPreferences {
  theme: AppTheme;
  customThemeColor?: string;
  userName: string;
  persona: PersonaType;
  voice: string;
  language: string;
  aiModel: string;
  apiKey: string;
  customEndpoint: string;
  isOwnerVoiceEnabled: boolean;
  ownerVoiceThreshold: number;
  ownerVoiceSampleCount: number;
  silentExecutionMode: boolean;
  taskOverlayEnabled: boolean;
  taskOverlayAvatar: string;
  orbSpeed: number;
  orbGlow: number;
  orbScale: number;
  orbHue: number;
}

export interface AgentTaskStep {
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
}

export interface AgentTaskState {
  isActive: boolean;
  goal: string;
  actionType: string;
  currentStepIndex: number;
  steps: AgentTaskStep[];
  logs: string[];
}
