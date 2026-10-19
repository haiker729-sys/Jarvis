import { AppPreferences, AppTheme, PersonaType } from '../types';

const PREFS_KEY = 'jarvis_app_preferences';

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'sunset', // Default theme from the Android app!
  userName: 'Meraj Sir',
  persona: 'Jarvis Pro',
  voice: 'Puck',
  language: 'Auto',
  aiModel: 'models/gemini-2.5-flash',
  apiKey: '',
  customEndpoint: '',
  isOwnerVoiceEnabled: true,
  ownerVoiceThreshold: 0.70,
  ownerVoiceSampleCount: 3,
  silentExecutionMode: false,
  taskOverlayEnabled: true,
  taskOverlayAvatar: 'Jarvis Arc',
  orbSpeed: 1.0,
  orbGlow: 0.85,
  orbScale: 1.0,
  orbHue: 35, // Warm Sunset hue
};

export const SUPPORTED_MODELS = [
  { id: 'models/gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
  { id: 'models/gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Reasoning)' },
  { id: 'models/gemini-3.1-flash-live-preview', name: 'Gemini 3.1 Flash Live (Realtime)' },
  { id: 'models/gemini-3.8-live', name: 'Gemini 3.8 Live Ultra' },
];

export const SUPPORTED_VOICES = [
  { id: 'Puck', name: 'Puck (British / Butler / Crisp)' },
  { id: 'Charon', name: 'Charon (Deep / Authoritative)' },
  { id: 'Aoede', name: 'Aoede (Warm / Melodic)' },
  { id: 'Fenrir', name: 'Fenrir (Fast / Energetic)' },
  { id: 'Kore', name: 'Kore (Calm / Expressive)' },
  { id: 'Leda', name: 'Leda (Sophisticated / Soft)' },
  { id: 'Orus', name: 'Orus (Resonant / Bold)' },
  { id: 'Zephyr', name: 'Zephyr (Gentle / Fluid)' },
];

export const SUPPORTED_PERSONAS: { id: PersonaType; name: string; description: string }[] = [
  { id: 'Jarvis Pro', name: 'Jarvis Pro', description: 'Analytical, formal British assistant inspired by Stark AI.' },
  { id: 'Naira', name: 'Naira Companion', description: 'Warm, empathetic, Hindi/English multilingual AI friend.' },
  { id: 'Girlfriend Mode', name: 'Girlfriend Mode', description: 'Playful, caring, deeply attentive companion tone.' },
  { id: 'Boyfriend Mode', name: 'Boyfriend Mode', description: 'Supportive, reassuring, confident companion tone.' },
  { id: 'TechGPT X Mode', name: 'TechGPT X Mode', description: 'Ultra-fast developer, hacker & tech specialist.' },
  { id: 'Companion Mode', name: 'Companion Mode', description: 'Casual, friendly conversational partner.' },
  { id: 'Focus Mode', name: 'Focus Mode', description: 'Concise, zero-distraction task and productivity driver.' },
  { id: 'Professional Mode', name: 'Professional Mode', description: 'Executive, polished corporate strategist.' },
];

export const SUPPORTED_LANGUAGES = [
  'Auto (Detect Language)',
  'English (US/UK/IN)',
  'Hindi (हिन्दी)',
  'Hinglish (Hindi in Latin script)',
  'Urdu (اردو)',
  'Bengali (বাংলা)',
  'Marathi (मराठी)',
  'Telugu (తెలుగు)',
  'Tamil (தமிழ்)',
  'Gujarati (ગુજરાતી)',
  'Bhojpuri (भोजपुरी)',
  'Punjabi (ਪੰਜਾਬੀ)',
];

export function getPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: Partial<AppPreferences>): AppPreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  return updated;
}
