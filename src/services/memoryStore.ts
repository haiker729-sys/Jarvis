import { MemoryCategory, MemoryEntity } from '../types';

const STORAGE_KEY = 'jarvis_long_term_memories';

const DEFAULT_MEMORIES: MemoryEntity[] = [
  {
    id: 'mem-1',
    category: 'Personal',
    key: 'Developer Identity',
    value: 'Meraj Sir (Lead Architect & Developer)',
    rawText: 'Developer is Meraj Sir',
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: 'mem-2',
    category: 'Preferences',
    key: 'Favorite Theme',
    value: 'Sunset Liquid Glass & Deep Obsidian',
    rawText: 'Prefers Sunset Liquid Glass theme with high contrast',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'mem-3',
    category: 'Routines',
    key: 'Morning Briefing',
    value: 'Wake up at 07:00 AM, weather review and task schedule',
    rawText: 'Morning routine begins at 7:00 AM with system check',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'mem-4',
    category: 'Contacts',
    key: 'Emergency Contact',
    value: 'TechGPT HQ (+1 555-JARVIS)',
    rawText: 'Direct line to system operations center',
    timestamp: Date.now() - 3600000 * 5,
  },
];

export function getStoredMemories(): MemoryEntity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEMORIES));
      return DEFAULT_MEMORIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load memories:', err);
    return DEFAULT_MEMORIES;
  }
}

export function saveMemoryEntity(
  category: MemoryCategory,
  key: string,
  value: string,
  rawText: string
): MemoryEntity {
  const memories = getStoredMemories();
  const newMemory: MemoryEntity = {
    id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    category,
    key: key.trim(),
    value: value.trim(),
    rawText: rawText.trim(),
    timestamp: Date.now(),
  };

  const updated = [newMemory, ...memories];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newMemory;
}

export function updateMemoryEntity(
  id: string,
  category: MemoryCategory,
  key: string,
  value: string
): MemoryEntity[] {
  const memories = getStoredMemories();
  const updated = memories.map((m) =>
    m.id === id ? { ...m, category, key, value, timestamp: Date.now() } : m
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteMemoryEntity(id: string): MemoryEntity[] {
  const memories = getStoredMemories();
  const updated = memories.filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllMemories(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function extractAndSaveSemanticMemory(rawText: string): { memory: MemoryEntity; feedback: string } {
  const clean = rawText
    .replace(/^(hey jarvis|jarvis|please)?\s*(remember that|remember to|remember|yaad rakhna ki|yaad rakhna)\s*/i, '')
    .trim();

  const lower = clean.toLowerCase();
  let category: MemoryCategory = 'Notes';
  let key = clean.slice(0, 36);

  if (
    lower.includes('favorite') ||
    lower.includes('prefer') ||
    lower.includes('like') ||
    lower.includes('song') ||
    lower.includes('music') ||
    lower.includes('app') ||
    lower.includes('pasand')
  ) {
    category = 'Preferences';
    key = clean.includes('song') ? 'Favorite Song' : clean.includes('app') ? 'Favorite App' : 'Preference';
  } else if (
    lower.includes('routine') ||
    lower.includes('gym') ||
    lower.includes('work') ||
    lower.includes('wake up') ||
    lower.includes('sleep') ||
    lower.includes('at ') ||
    lower.includes('pm') ||
    lower.includes('am')
  ) {
    category = 'Routines';
    key = 'Daily Routine';
  } else if (
    lower.includes('name') ||
    lower.includes('birthday') ||
    lower.includes('live in') ||
    lower.includes('age') ||
    lower.includes('i am') ||
    lower.includes('my ')
  ) {
    category = 'Personal';
    key = lower.includes('birthday') ? 'Birthday' : lower.includes('age') ? 'Age' : 'Personal Fact';
  } else if (
    lower.includes('call') ||
    lower.includes('contact') ||
    lower.includes('phone') ||
    lower.includes('number') ||
    lower.includes('friend') ||
    lower.includes('brother') ||
    lower.includes('mom') ||
    lower.includes('dad')
  ) {
    category = 'Contacts';
    key = 'Contact Relation';
  }

  const memory = saveMemoryEntity(category, key, clean, rawText);
  return {
    memory,
    feedback: `Acknowledged, Sir. I have committed this to my long-term memory under ${category}: "${key}".`,
  };
}
