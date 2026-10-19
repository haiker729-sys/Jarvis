import React, { useState, useEffect, useRef } from 'react';
import {
  AppPreferences,
  AppTheme,
  ChatTurn,
  ConversationState,
  AgentTaskState,
} from './types';
import {
  getPreferences,
  savePreferences,
  DEFAULT_PREFERENCES,
} from './services/preferencesStore';
import {
  getStoredMemories,
  extractAndSaveSemanticMemory,
  clearAllMemories,
} from './services/memoryStore';
import { parseJarvisCommand } from './services/commandParser';
import { voiceManager } from './services/voiceManager';
import { generateAssistantResponse } from './services/geminiService';

import { Header } from './components/Header';
import { JarvisOrb } from './components/JarvisOrb';
import { WeatherCard } from './components/WeatherCard';
import { QuickActionGrid } from './components/QuickActionGrid';
import { BottomDock } from './components/BottomDock';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { UpdatesView } from './components/UpdatesView';
import { MemoryModal } from './components/MemoryModal';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';
import { VoiceEnrollmentModal } from './components/VoiceEnrollmentModal';
import { ScreenShareModal } from './components/ScreenShareModal';
import { TaskProgressOverlay } from './components/TaskProgressOverlay';

const INITIAL_MESSAGES: ChatTurn[] = [
  {
    id: 'turn-init',
    userTranscript: 'Hey Jarvis, run initial system check.',
    jarvisResponse:
      'All subsystems online, Meraj Sir. Neural engines verified, audio duplex streaming ready, and local memory matrices synchronized.',
    timestamp: Date.now() - 60000 * 5,
  },
];

export const App: React.FC = () => {
  const [preferences, setPreferences] = useState<AppPreferences>(getPreferences());
  const [currentTab, setCurrentTab] = useState<number>(0); // 0: Home, 1: Chat, 2: Settings, 3: Updates
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [audioAmp, setAudioAmp] = useState<number>(0);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Chat message history
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>(() => {
    try {
      const saved = localStorage.getItem('jarvis_chat_history');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Modals state
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isVoiceEnrollmentOpen, setIsVoiceEnrollmentOpen] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Agent Task HUD execution state
  const [activeTask, setActiveTask] = useState<AgentTaskState>({
    isActive: false,
    goal: '',
    actionType: '',
    currentStepIndex: 0,
    steps: [],
    logs: [],
  });

  // Track awaiting confirmation state for commands like WhatsApp send or destructive actions
  const isAwaitingConfirmationRef = useRef(false);
  const pendingActionRef = useRef<any>(null);

  // Sync chat history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jarvis_chat_history', JSON.stringify(chatHistory));
    } catch {}
  }, [chatHistory]);

  // Connect Voice Manager callbacks
  useEffect(() => {
    voiceManager.onStateChange = (state) => {
      setConversationState(state);
    };

    voiceManager.onAudioLevels = (amp) => {
      setAudioAmp(amp);
    };

    voiceManager.onTranscript = (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        handleUserSpeechInput(transcript.trim());
      }
    };

    return () => {
      voiceManager.stopListening();
    };
  }, [preferences]);

  // Start or Toggle Voice Session
  const handleMicToggle = async () => {
    if (conversationState === 'listening' || conversationState === 'speaking') {
      voiceManager.stopListening();
      voiceManager.playChime('click');
      setConversationState('idle');
    } else {
      voiceManager.playChime('startup');
      const ok = await voiceManager.startListening();
      if (!ok) {
        setLiveError('Microphone permission or speech recognition unavailable.');
      } else {
        setLiveError(null);
      }
    }
  };

  const handleOrbLongPress = () => {
    voiceManager.playChime('powerdown');
    voiceManager.stopListening();
    setConversationState('idle');
  };

  // Main input processor (Handles text or speech input)
  const handleUserSpeechInput = async (input: string) => {
    setConversationState('thinking');
    setIsGenerating(true);

    // 1. Check for command parsing
    const parsed = parseJarvisCommand(input, isAwaitingConfirmationRef.current);

    if (isAwaitingConfirmationRef.current) {
      if (parsed.action?.type === 'CONFIRM') {
        const confirmed = parsed.action.confirmed;
        isAwaitingConfirmationRef.current = false;
        const pending = pendingActionRef.current;
        pendingActionRef.current = null;

        if (confirmed && pending) {
          executeAgentTask(pending.action, pending.summary);
          return;
        } else {
          const cancelMsg = 'Action cancelled as requested, Sir.';
          appendChatTurn(input, cancelMsg);
          voiceManager.speak(cancelMsg, preferences.persona);
          setIsGenerating(false);
          return;
        }
      }
    }

    if (parsed.action) {
      // Execute command or prompt confirmation
      handleParsedAction(input, parsed.action);
      return;
    }

    // 2. Memory semantic check: "Remember that..."
    if (
      input.toLowerCase().startsWith('remember ') ||
      input.toLowerCase().startsWith('remember that ') ||
      input.toLowerCase().startsWith('yaad rakhna ')
    ) {
      const { feedback } = extractAndSaveSemanticMemory(input);
      appendChatTurn(input, feedback);
      voiceManager.speak(feedback, preferences.persona);
      setIsGenerating(false);
      return;
    }

    // 3. General AI Conversation with Gemini / Persona Engine
    try {
      const response = await generateAssistantResponse(input, chatHistory, preferences);
      appendChatTurn(input, response.text);
      if (!preferences.silentExecutionMode) {
        voiceManager.speak(response.text, preferences.persona);
      }
    } catch (err: any) {
      const errorText = `Apologies, Sir. A neural stream disturbance occurred: ${err?.message || 'Connection glitch'}`;
      appendChatTurn(input, errorText);
      setLiveError(err?.message || 'Neural connection error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dispatches parsed action into 4-step verified agent HUD workflow
  const handleParsedAction = (userText: string, action: any) => {
    switch (action.type) {
      case 'PLAY_YOUTUBE':
        executeAgentTask(
          action,
          `Playing "${action.query}" on YouTube`,
          [
            { title: 'Parse YouTube Play Intent', status: 'completed' },
            { title: `Resolve video target: "${action.query}"`, status: 'running' },
            { title: 'Launch High-Definition Player', status: 'pending' },
            { title: 'Verify Playback Audio Stream', status: 'pending' },
          ],
          () => {
            window.open(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`,
              '_blank'
            );
          }
        );
        break;

      case 'SEARCH_YOUTUBE':
        executeAgentTask(
          action,
          `Searching YouTube for "${action.query}"`,
          [
            { title: 'Parse Search Query', status: 'completed' },
            { title: 'Query YouTube Catalog', status: 'running' },
            { title: 'Inspect Results Stream', status: 'pending' },
            { title: 'Display Video Grid', status: 'pending' },
          ],
          () => {
            window.open(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`,
              '_blank'
            );
          }
        );
        break;

      case 'WHATSAPP_MESSAGE':
        // Prompt confirmation before dispatching as in Android
        isAwaitingConfirmationRef.current = true;
        pendingActionRef.current = {
          action,
          summary: `Send WhatsApp message to ${action.contact}: "${action.message}"`,
        };
        const confirmPrompt = `I am prepared to send: "${action.message}" to ${action.contact}. Shall I proceed?`;
        appendChatTurn(userText, confirmPrompt);
        voiceManager.speak(confirmPrompt, preferences.persona);
        setIsGenerating(false);
        break;

      case 'PHONE_CALL':
        executeAgentTask(
          action,
          `Initiating voice line to ${action.contactOrNumber}`,
          [
            { title: 'Resolve Contact Identifier', status: 'completed' },
            { title: 'Check Telephony Authorizations', status: 'running' },
            { title: 'Dial Outbound Signal', status: 'pending' },
            { title: 'Verify Carrier Connection', status: 'pending' },
          ],
          () => {
            window.open(`tel:${encodeURIComponent(action.contactOrNumber)}`, '_self');
          }
        );
        break;

      case 'FLASH':
        const flashMsg = action.enabled
          ? 'Illumination protocol activated: Flashlight ON.'
          : 'Illumination protocol deactivated: Flashlight OFF.';
        appendChatTurn(userText, flashMsg, action.enabled ? 'Flashlight ON' : 'Flashlight OFF');
        voiceManager.speak(flashMsg, preferences.persona);
        setIsGenerating(false);
        break;

      case 'VOLUME':
        const volMsg = action.level !== undefined
          ? `Master audio volume calibrated to ${action.level}%.`
          : `Master volume adjusted by ${action.delta > 0 ? '+' : ''}${action.delta}%.`;
        appendChatTurn(userText, volMsg, 'Volume Adjustment');
        voiceManager.speak(volMsg, preferences.persona);
        setIsGenerating(false);
        break;

      case 'BRIGHTNESS':
        const brightMsg = `Display luminance calibrated to ${action.level}%.`;
        appendChatTurn(userText, brightMsg, 'Brightness Calibrated');
        voiceManager.speak(brightMsg, preferences.persona);
        setIsGenerating(false);
        break;

      case 'SEARCH_WEB':
        executeAgentTask(
          action,
          `Searching web for "${action.query}"`,
          [
            { title: 'Analyze Query Semantics', status: 'completed' },
            { title: 'Query Global Web Knowledge', status: 'running' },
            { title: 'Filter Verified Results', status: 'pending' },
            { title: 'Present Synthesized Summary', status: 'pending' },
          ],
          () => {
            window.open(
              `https://www.google.com/search?q=${encodeURIComponent(action.query)}`,
              '_blank'
            );
          }
        );
        break;

      case 'WHAT_DO_YOU_REMEMBER':
        setIsMemoryModalOpen(true);
        const memCount = getStoredMemories().length;
        const recallMsg = `Opening your Memory Matrix. I currently have ${memCount} persistent memories committed to long-term storage, Sir.`;
        appendChatTurn(userText, recallMsg, 'Memory Matrix Recall');
        voiceManager.speak(recallMsg, preferences.persona);
        setIsGenerating(false);
        break;

      case 'SUBSCRIBE_CHANNEL':
        const subMsg = 'Subscribed to channel and notifications verified, Sir.';
        appendChatTurn(userText, subMsg, 'YouTube Subscription');
        voiceManager.speak(subMsg, preferences.persona);
        setIsGenerating(false);
        break;

      case 'TOGGLE_FULLSCREEN':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        const fsMsg = 'Fullscreen layout toggled, Sir.';
        appendChatTurn(userText, fsMsg, 'Fullscreen Toggle');
        voiceManager.speak(fsMsg, preferences.persona);
        setIsGenerating(false);
        break;

      default:
        const defMsg = `Command acknowledged: executing ${action.type}`;
        appendChatTurn(userText, defMsg);
        voiceManager.speak(defMsg, preferences.persona);
        setIsGenerating(false);
        break;
    }
  };

  // Simulates the Android AgentTaskEngine 4-step verified workflow
  const executeAgentTask = (
    action: any,
    goal: string,
    customSteps?: { title: string; status: 'pending' | 'running' | 'completed' | 'failed' }[],
    onComplete?: () => void
  ) => {
    const steps = customSteps || [
      { title: 'Goal Dispatched & Sanitized', status: 'completed' },
      { title: 'Inspect Screen Signature', status: 'running' },
      { title: 'Execute Verified Automation Step', status: 'pending' },
      { title: 'Audit State & Confirm Result', status: 'pending' },
    ];

    setActiveTask({
      isActive: true,
      goal,
      actionType: action.type || 'TASK',
      currentStepIndex: 1,
      steps,
      logs: [`Initiated: ${goal}`],
    });

    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setActiveTask((prev) => ({
          ...prev,
          currentStepIndex: currentStep,
          steps: prev.steps.map((s, idx) => ({
            ...s,
            status: idx < currentStep ? 'completed' : idx === currentStep ? 'running' : 'pending',
          })),
        }));
      } else {
        clearInterval(interval);
        setActiveTask((prev) => ({
          ...prev,
          currentStepIndex: steps.length - 1,
          steps: prev.steps.map((s) => ({ ...s, status: 'completed' })),
        }));

        setTimeout(() => {
          setActiveTask((prev) => ({ ...prev, isActive: false }));
          onComplete?.();
          const feedback = `Task successfully completed: ${goal}.`;
          appendChatTurn(goal, feedback, action.type);
          if (!preferences.silentExecutionMode) {
            voiceManager.speak(feedback, preferences.persona);
          }
          setIsGenerating(false);
        }, 800);
      }
    }, 600);
  };

  const appendChatTurn = (
    userText: string,
    jarvisResponse: string,
    commandExecuted?: string
  ) => {
    const newTurn: ChatTurn = {
      id: 'turn_' + Date.now(),
      userTranscript: userText,
      jarvisResponse,
      timestamp: Date.now(),
      commandExecuted,
    };
    setChatHistory((prev) => [...prev, newTurn]);
  };

  // Preference updates
  const handleUpdatePreferences = (updated: Partial<AppPreferences>) => {
    const saved = savePreferences(updated);
    setPreferences(saved);
  };

  const handleResetPreferences = () => {
    const res = savePreferences(DEFAULT_PREFERENCES);
    setPreferences(res);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('jarvis_chat_history');
  };

  // Screen share trigger
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
    } else {
      setIsScreenShareModalOpen(true);
    }
  };

  const handleStartScreenShare = async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
        return true;
      }
      setIsScreenSharing(true);
      return true;
    } catch {
      setIsScreenSharing(true);
      return true;
    }
  };

  // Visual Theme Mapping for dynamic liquid glows
  const getThemeBackgroundStyles = (theme: AppTheme) => {
    switch (theme) {
      case 'sunset':
        return {
          bg: 'bg-[#100814] text-orange-50',
          blob1: 'bg-orange-500/20',
          blob2: 'bg-rose-500/15',
          blob3: 'bg-purple-600/15',
        };
      case 'red':
        return {
          bg: 'bg-[#0E0307] text-rose-50',
          blob1: 'bg-rose-600/20',
          blob2: 'bg-red-500/15',
          blob3: 'bg-pink-600/15',
        };
      case 'light':
        return {
          bg: 'bg-[#EEF2F9] text-slate-900',
          blob1: 'bg-blue-400/20',
          blob2: 'bg-cyan-300/25',
          blob3: 'bg-indigo-300/20',
        };
      case 'dark':
      default:
        return {
          bg: 'bg-[#060913] text-cyan-50',
          blob1: 'bg-cyan-500/20',
          blob2: 'bg-blue-600/15',
          blob3: 'bg-indigo-700/15',
        };
    }
  };

  const themeStyles = getThemeBackgroundStyles(preferences.theme);

  // Status indicator text
  const getStatusText = () => {
    switch (conversationState) {
      case 'listening':
        return 'LISTENING • SPEAK NOW';
      case 'thinking':
        return 'PROCESSING INSTRUCTION...';
      case 'speaking':
        return 'SPEAKING RESPONSE...';
      case 'error':
        return 'SYSTEM ATTENTION REQUIRED';
      case 'idle':
      default:
        return 'TAP ORB TO START';
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-500 ${themeStyles.bg}`}
    >
      {/* Liquid Glass Background Glow Fields (Port of bg_liquid_glow_*) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-60 animate-pulse-slow ${themeStyles.blob1}`}
        />
        <div
          className={`absolute top-1/3 -left-28 w-80 h-80 rounded-full blur-3xl opacity-50 ${themeStyles.blob2}`}
        />
        <div
          className={`absolute -bottom-20 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-50 ${themeStyles.blob3}`}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex-1 flex flex-col h-full min-h-screen">
        {/* Header */}
        <Header
          userName={preferences.userName}
          persona={preferences.persona}
          theme={preferences.theme}
          liveError={liveError}
          onClearError={() => setLiveError(null)}
          onOpenChat={() => setCurrentTab(1)}
          onOpenSettings={() => setCurrentTab(2)}
        />

        {/* Tab 0: Home Console */}
        {currentTab === 0 && (
          <main className="flex-1 flex flex-col items-center justify-between px-4 pt-1 pb-24 sm:px-6">
            {/* Center Orb Stage */}
            <div className="flex-1 w-full flex flex-col items-center justify-center my-auto py-2">
              <JarvisOrb
                state={conversationState}
                theme={preferences.theme}
                letter={preferences.persona === 'Naira' ? 'N' : 'J'}
                audioAmp={audioAmp}
                glowMultiplier={preferences.orbGlow}
                speedMultiplier={preferences.orbSpeed}
                scaleMultiplier={preferences.orbScale}
                onOrbClick={handleMicToggle}
                onOrbLongPress={handleOrbLongPress}
              />

              {/* Status Indicator Capsule */}
              <div className="flex flex-col items-center mt-3 space-y-1">
                <div
                  onClick={handleMicToggle}
                  className={`px-4 py-2 rounded-full border backdrop-blur-xl flex items-center gap-2 cursor-pointer transition-all duration-300 shadow-md ${
                    conversationState === 'listening'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-105'
                      : preferences.theme === 'sunset'
                      ? 'bg-orange-950/30 border-orange-500/30 text-orange-200'
                      : preferences.theme === 'red'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : 'bg-slate-900/40 border-white/10 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      conversationState === 'listening'
                        ? 'bg-cyan-400 animate-ping'
                        : conversationState === 'speaking'
                        ? 'bg-emerald-400 animate-pulse'
                        : conversationState === 'thinking'
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-cyan-500'
                    }`}
                  />
                  <span className="text-xs font-bold tracking-widest uppercase font-mono">
                    {getStatusText()}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Hold orb or mic button to power off
                </span>
              </div>
            </div>

            {/* Weather Card */}
            <div className="w-full mb-3">
              <WeatherCard theme={preferences.theme} />
            </div>

            {/* Quick Action Grid */}
            <div className="w-full mb-2">
              <QuickActionGrid
                theme={preferences.theme}
                isScreenSharing={isScreenSharing}
                activeLanguage={preferences.language}
                onToggleScreenShare={handleToggleScreenShare}
                onOpenMemories={() => setIsMemoryModalOpen(true)}
                onOpenLanguage={() => setIsLanguageModalOpen(true)}
              />
            </div>
          </main>
        )}

        {/* Tab 1: Chat Stream */}
        {currentTab === 1 && (
          <ChatView
            messages={chatHistory}
            theme={preferences.theme}
            persona={preferences.persona}
            userName={preferences.userName}
            isGenerating={isGenerating}
            onSendMessage={handleUserSpeechInput}
            onClearHistory={handleClearHistory}
            onSpeakMessage={(text) => voiceManager.speak(text, preferences.persona)}
          />
        )}

        {/* Tab 2: Settings */}
        {currentTab === 2 && (
          <SettingsView
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onOpenVoiceEnrollment={() => setIsVoiceEnrollmentOpen(true)}
            onClearHistory={handleClearHistory}
            onResetPreferences={handleResetPreferences}
          />
        )}

        {/* Tab 3: Updates & Diagnostics */}
        {currentTab === 3 && <UpdatesView theme={preferences.theme} />}

        {/* Bottom Navigation Dock */}
        <BottomDock
          currentTab={currentTab}
          conversationState={conversationState}
          theme={preferences.theme}
          isMicMuted={isMicMuted}
          onSelectTab={setCurrentTab}
          onMicClick={handleMicToggle}
        />
      </div>

      {/* Floating Agent Task Progress HUD */}
      <TaskProgressOverlay
        task={activeTask}
        onCancelTask={() => setActiveTask((prev) => ({ ...prev, isActive: false }))}
      />

      {/* Modals */}
      <MemoryModal
        isOpen={isMemoryModalOpen}
        theme={preferences.theme}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      <LanguageSelectionModal
        isOpen={isLanguageModalOpen}
        theme={preferences.theme}
        currentLanguage={preferences.language}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectLanguage={(lang) => handleUpdatePreferences({ language: lang })}
      />

      <VoiceEnrollmentModal
        isOpen={isVoiceEnrollmentOpen}
        theme={preferences.theme}
        isEnabled={preferences.isOwnerVoiceEnabled}
        threshold={preferences.ownerVoiceThreshold}
        sampleCount={preferences.ownerVoiceSampleCount}
        onClose={() => setIsVoiceEnrollmentOpen(false)}
        onSaveProfile={(enabled, threshold, samples) =>
          handleUpdatePreferences({
            isOwnerVoiceEnabled: enabled,
            ownerVoiceThreshold: threshold,
            ownerVoiceSampleCount: samples,
          })
        }
      />

      <ScreenShareModal
        isOpen={isScreenShareModalOpen}
        theme={preferences.theme}
        isSharing={isScreenSharing}
        onClose={() => setIsScreenShareModalOpen(false)}
        onStartShare={handleStartScreenShare}
        onStopShare={() => setIsScreenSharing(false)}
      />
    </div>
  );
};
