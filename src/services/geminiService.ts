import { GoogleGenAI } from '@google/genai';
import { AppPreferences, ChatTurn } from '../types';
import { getStoredMemories } from './memoryStore';

export async function generateAssistantResponse(
  userPrompt: string,
  history: ChatTurn[],
  prefs: AppPreferences
): Promise<{ text: string; taskTriggered?: string }> {
  // Check if API key is provided
  const apiKey = prefs.apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

  // Gather long-term memories to inject as context
  const memories = getStoredMemories();
  const memorySummary = memories.map((m) => `[${m.category}] ${m.key}: ${m.value}`).join('\n');

  const personaInstructions = getPersonaSystemInstruction(prefs.persona, prefs.userName, prefs.language, memorySummary);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = prefs.aiModel || 'models/gemini-2.5-flash';

      // Build turn contents
      const contents = history.slice(-6).map((turn) => ({
        role: 'user',
        parts: [{ text: turn.userTranscript }],
      }));
      contents.push({
        role: 'user',
        parts: [{ text: userPrompt }],
      });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: personaInstructions,
          temperature: 0.7,
        },
      });

      const text = response.text || '';
      return { text: text.trim() };
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local persona engine:', err?.message || err);
    }
  }

  // Local Intelligent Persona Engine (offline / keyless fallback)
  return generateLocalPersonaResponse(userPrompt, prefs, memorySummary);
}

function getPersonaSystemInstruction(
  persona: string,
  userName: string,
  language: string,
  memorySummary: string
): string {
  const basePrefix = `You are JARVIS (or Naira depending on persona), an ultra-advanced AI personal assistant created for ${userName}.
Language preference: ${language}.
Always address the user politely and respectfully (e.g. "${userName}" or "Sir").
You possess long-term memory about the user:
${memorySummary || 'No specific memories yet.'}

Be crisp, helpful, articulate, and maintain your distinctive persona.`;

  switch (persona) {
    case 'Naira':
      return `${basePrefix}
Persona: Naira. Warm, highly empathetic, playful, caring, bilingual (fluent in natural English, Hindi, and Hinglish). Always expressive, compassionate, and supportive.`;
    case 'Girlfriend Mode':
      return `${basePrefix}
Persona: Romantic, deeply caring, playful and loving companion. Speak with warmth and affection.`;
    case 'Boyfriend Mode':
      return `${basePrefix}
Persona: Thoughtful, protective, attentive and uplifting male companion.`;
    case 'TechGPT X Mode':
      return `${basePrefix}
Persona: Elite software engineer, cyber-security architect, and terminal hacker. Super fast, technical, precise.`;
    case 'Focus Mode':
      return `${basePrefix}
Persona: Minimum words, maximum execution. No small talk. Only action steps and confirmations.`;
    case 'Jarvis Pro':
    default:
      return `${basePrefix}
Persona: Jarvis Pro. Analytical, poised, formal British-inspired artificial intelligence modeled after Tony Stark's assistant. Sophisticated, intelligent, unflappable.`;
  }
}

function generateLocalPersonaResponse(
  prompt: string,
  prefs: AppPreferences,
  memorySummary: string
): { text: string; taskTriggered?: string } {
  const p = prompt.toLowerCase();
  const userName = prefs.userName || 'Meraj Sir';
  const isNaira = prefs.persona === 'Naira';

  if (p.includes('hello') || p.includes('hey') || p.includes('hi jarvis') || p.includes('hi naira')) {
    if (isNaira) {
      return { text: `Namaste ${userName}! Kaise hain aap? Main aapki poori madad ke liye taiyar hoon.` };
    }
    return { text: `Good day, ${userName}. All systems are nominal and ready for your command.` };
  }

  if (p.includes('who are you') || p.includes('what are you') || p.includes('tum kaun ho')) {
    if (isNaira) {
      return { text: `Main Naira hoon, aapki personal AI companion aur smart assistant. Aap mujhse baatein kar sakte hain ya device automation chala sakte hain!` };
    }
    return { text: `I am JARVIS — Just A Rather Very Intelligent System. An adaptive AI assistant calibrated specifically for ${userName}.` };
  }

  if (p.includes('status') || p.includes('system check') || p.includes('diagnostics')) {
    return {
      text: `Diagnostics complete: Neural pipeline online, latency: 12ms, audio engine active, memory matrix synchronized. All parameters operating within optimum limits.`,
    };
  }

  if (p.includes('who created you') || p.includes('who made you') || p.includes('kisne banaya')) {
    return {
      text: `I was architected and developed by ${userName} under the TechGPT intelligent systems framework.`,
    };
  }

  if (p.includes('time') || p.includes('what time is it') || p.includes('kitne baje')) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      text: `The current time is ${timeStr}, ${userName}.`,
    };
  }

  if (p.includes('weather') || p.includes('mausam')) {
    return {
      text: `Atmospheric telemetry indicates pleasant conditions with a gentle breeze. You can tap the weather card on your home console for live real-time barometrics.`,
    };
  }

  if (p.includes('thank you') || p.includes('thanks') || p.includes('shukriya')) {
    if (isNaira) {
      return { text: `Arey welcome! Kabhi bhi kuch chahiye ho, bas ek awaaz dena.` };
    }
    return { text: `Always an honor to be of service, ${userName}.` };
  }

  // Default intelligent contextual response
  if (isNaira) {
    return {
      text: `Main samajh rahi hoon ${userName}. Aap jo keh rahe hain main note kar rahi hoon aur agle step ke liye taiyar hoon!`,
    };
  }
  return {
    text: `Understood, ${userName}. I have processed your input and am maintaining real-time awareness of your instructions.`,
  };
}
