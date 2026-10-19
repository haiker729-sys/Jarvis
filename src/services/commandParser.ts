export type ParsedAction =
  | { type: 'PLAY_YOUTUBE'; query: string }
  | { type: 'SEARCH_YOUTUBE'; query: string }
  | { type: 'WHATSAPP_MESSAGE'; contact: string; message: string }
  | { type: 'WHATSAPP_CALL'; contact: string; video: boolean }
  | { type: 'PHONE_CALL'; contactOrNumber: string }
  | { type: 'FLASH'; enabled: boolean }
  | { type: 'VOLUME'; level?: number; delta?: number }
  | { type: 'BRIGHTNESS'; level?: number; delta?: number }
  | { type: 'REMEMBER'; text: string }
  | { type: 'FORGET'; query: string }
  | { type: 'WHAT_DO_YOU_REMEMBER' }
  | { type: 'SEARCH_WEB'; query: string }
  | { type: 'OPEN_APP'; appName: string }
  | { type: 'SUBSCRIBE_CHANNEL' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'MEDIA_CONTROL'; action: 'pause' | 'resume' | 'next' | 'prev' }
  | { type: 'CONFIRM'; confirmed: boolean };

export interface CommandParseResult {
  action: ParsedAction | null;
  confidence: number;
  matchedPattern: string;
}

export function parseJarvisCommand(
  rawInput: string,
  isAwaitingConfirmation: boolean = false
): CommandParseResult {
  const clean = rawInput
    .replace(/^(hey jarvis|hi jarvis|hello jarvis|ok jarvis|jarvis|service)[,\s]*/i, '')
    .replace(/[.,!?:;"'\s]+$/, '')
    .trim()
    .toLowerCase();

  if (!clean) {
    return { action: null, confidence: 0, matchedPattern: '' };
  }

  // 1. Confirmations & Cancellations
  if (isAwaitingConfirmation) {
    if (/^(yes|yeah|yup|send|send it|confirm|do it|sure|okay|go ahead|please send|haan|haanji|kardo|theek hai)/i.test(clean)) {
      return { action: { type: 'CONFIRM', confirmed: true }, confidence: 1.0, matchedPattern: 'CONFIRM' };
    }
    if (/^(no|nope|cancel|don't|dont|never mind|stop|abort|nahi|mat karo|ruko)/i.test(clean)) {
      return { action: { type: 'CONFIRM', confirmed: false }, confidence: 1.0, matchedPattern: 'CANCEL' };
    }
  }

  // 2. Flashlight / Torch
  if (
    /(turn on|open|enable|switch on|jalao|chalu karo).*(flash\s*light|torch|flash)/i.test(clean) ||
    /(flash\s*light|torch|flash).*(on|chalu|jalao)/i.test(clean)
  ) {
    return { action: { type: 'FLASH', enabled: true }, confidence: 0.98, matchedPattern: 'FLASH_ON' };
  }
  if (
    /(turn off|close|disable|switch off|band karo|bujhao).*(flash\s*light|torch|flash)/i.test(clean) ||
    /(flash\s*light|torch|flash).*(off|band|bujhao)/i.test(clean)
  ) {
    return { action: { type: 'FLASH', enabled: false }, confidence: 0.98, matchedPattern: 'FLASH_OFF' };
  }

  // 3. YouTube Play & Search
  const ytPlayMatch = clean.match(/^(?:please\s+|can you\s+)?(?:play|chalao|bajao)\s+(.+?)(?:\s+(?:on|in)\s+youtube)?$/i);
  if (ytPlayMatch && ytPlayMatch[1]) {
    let query = ytPlayMatch[1].replace(/^(?:the\s+song|song|video|music)\s+/i, '').trim();
    if (query) {
      return { action: { type: 'PLAY_YOUTUBE', query }, confidence: 0.95, matchedPattern: 'YOUTUBE_PLAY' };
    }
  }

  const ytSearchMatch = clean.match(/^(?:search|look for|find)\s+(.+?)\s+(?:on|in)\s+youtube$/i);
  if (ytSearchMatch && ytSearchMatch[1]) {
    return { action: { type: 'SEARCH_YOUTUBE', query: ytSearchMatch[1] }, confidence: 0.95, matchedPattern: 'YOUTUBE_SEARCH' };
  }

  // 4. YouTube Subscribe & Fullscreen
  if (/^(?:subscribe|hit subscribe|subscribe to (?:this|the) channel|subscribe kardo)$/i.test(clean)) {
    return { action: { type: 'SUBSCRIBE_CHANNEL' }, confidence: 0.97, matchedPattern: 'YOUTUBE_SUBSCRIBE' };
  }
  if (/^(?:make it |go )?full\s*screen|maximize player|fullscreen kardo$/i.test(clean)) {
    return { action: { type: 'TOGGLE_FULLSCREEN' }, confidence: 0.97, matchedPattern: 'YOUTUBE_FULLSCREEN' };
  }

  // 5. WhatsApp Message
  const waMsgMatch = clean.match(/(?:send\s+whatsapp\s+message\s+to|send\s+message\s+to|whatsapp|message)\s+([a-zA-Z0-9\s]+?)\s+(?:saying|that|ko bolo|likho)\s+(.+)/i);
  if (waMsgMatch && waMsgMatch[1] && waMsgMatch[2]) {
    return {
      action: {
        type: 'WHATSAPP_MESSAGE',
        contact: waMsgMatch[1].trim(),
        message: waMsgMatch[2].trim(),
      },
      confidence: 0.96,
      matchedPattern: 'WHATSAPP_MSG',
    };
  }

  // 6. WhatsApp Call
  const waCallMatch = clean.match(/(?:whatsapp\s+(?:video\s+)?call|call\s+on\s+whatsapp)\s+(?:to\s+)?([a-zA-Z0-9\s]+)/i);
  if (waCallMatch && waCallMatch[1]) {
    const isVideo = clean.includes('video');
    return {
      action: {
        type: 'WHATSAPP_CALL',
        contact: waCallMatch[1].trim(),
        video: isVideo,
      },
      confidence: 0.95,
      matchedPattern: 'WHATSAPP_CALL',
    };
  }

  // 7. Phone Call
  const phoneCallMatch = clean.match(/^(?:call|dial|phone|make a call to|call lagao)\s+(.+)/i);
  if (phoneCallMatch && phoneCallMatch[1] && !clean.includes('whatsapp')) {
    return {
      action: { type: 'PHONE_CALL', contactOrNumber: phoneCallMatch[1].trim() },
      confidence: 0.94,
      matchedPattern: 'PHONE_CALL',
    };
  }

  // 8. Memory: Remember / Forget / What do you remember
  if (
    clean.startsWith('remember that') ||
    clean.startsWith('remember to') ||
    clean.startsWith('remember ') ||
    clean.startsWith('yaad rakhna ki') ||
    clean.startsWith('yaad rakhna')
  ) {
    const memText = clean.replace(/^(remember that|remember to|remember|yaad rakhna ki|yaad rakhna)\s*/i, '').trim();
    if (memText) {
      return { action: { type: 'REMEMBER', text: memText }, confidence: 0.98, matchedPattern: 'REMEMBER' };
    }
  }

  if (
    clean.includes('what do you remember') ||
    clean.includes('kya yaad hai') ||
    clean.includes('show memories') ||
    clean.includes('list memories')
  ) {
    return { action: { type: 'WHAT_DO_YOU_REMEMBER' }, confidence: 0.96, matchedPattern: 'RECALL_ALL' };
  }

  if (clean.startsWith('forget ') || clean.startsWith('delete memory ') || clean.startsWith('bhool jao ')) {
    const query = clean.replace(/^(forget|delete memory|bhool jao)\s*/i, '').trim();
    return { action: { type: 'FORGET', query }, confidence: 0.95, matchedPattern: 'FORGET' };
  }

  // 9. Brightness & Volume
  const volumeMatch = clean.match(/(?:set\s+)?volume\s+(?:to\s+)?(\d{1,3})/i);
  if (volumeMatch && volumeMatch[1]) {
    return { action: { type: 'VOLUME', level: parseInt(volumeMatch[1], 10) }, confidence: 0.95, matchedPattern: 'VOLUME_SET' };
  }
  if (clean.includes('volume up') || clean.includes('increase volume') || clean.includes('awaz badhao')) {
    return { action: { type: 'VOLUME', delta: 15 }, confidence: 0.95, matchedPattern: 'VOLUME_UP' };
  }
  if (clean.includes('volume down') || clean.includes('decrease volume') || clean.includes('awaz kam karo')) {
    return { action: { type: 'VOLUME', delta: -15 }, confidence: 0.95, matchedPattern: 'VOLUME_DOWN' };
  }

  const brightMatch = clean.match(/(?:set\s+)?brightness\s+(?:to\s+)?(\d{1,3})/i);
  if (brightMatch && brightMatch[1]) {
    return { action: { type: 'BRIGHTNESS', level: parseInt(brightMatch[1], 10) }, confidence: 0.95, matchedPattern: 'BRIGHTNESS_SET' };
  }

  // 10. Open Apps
  const appMatch = clean.match(/^(?:open|launch|kholo)\s+([a-zA-Z0-9\s]+)$/i);
  if (appMatch && appMatch[1] && !['youtube', 'camera', 'settings', 'chat', 'weather'].includes(appMatch[1].trim())) {
    return { action: { type: 'OPEN_APP', appName: appMatch[1].trim() }, confidence: 0.92, matchedPattern: 'OPEN_APP' };
  }

  // 11. Web Search
  const searchMatch = clean.match(/^(?:search|google|search for|khojo)\s+(.+)/i);
  if (searchMatch && searchMatch[1] && !clean.includes('youtube')) {
    return { action: { type: 'SEARCH_WEB', query: searchMatch[1].trim() }, confidence: 0.92, matchedPattern: 'WEB_SEARCH' };
  }

  // 12. Media Controls
  if (/^(pause|pause music|pause video|stop music|ruko|rok do)$/i.test(clean)) {
    return { action: { type: 'MEDIA_CONTROL', action: 'pause' }, confidence: 0.95, matchedPattern: 'MEDIA_PAUSE' };
  }
  if (/^(resume|play music|continue|chalu karo)$/i.test(clean)) {
    return { action: { type: 'MEDIA_CONTROL', action: 'resume' }, confidence: 0.95, matchedPattern: 'MEDIA_RESUME' };
  }
  if (/^(next|next song|next video|agla gana)$/i.test(clean)) {
    return { action: { type: 'MEDIA_CONTROL', action: 'next' }, confidence: 0.95, matchedPattern: 'MEDIA_NEXT' };
  }
  if (/^(previous|previous song|pichhla gana)$/i.test(clean)) {
    return { action: { type: 'MEDIA_CONTROL', action: 'prev' }, confidence: 0.95, matchedPattern: 'MEDIA_PREV' };
  }

  return { action: null, confidence: 0, matchedPattern: '' };
}
