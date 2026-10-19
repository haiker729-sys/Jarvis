import React from 'react';
import { Home, MessageSquare, Mic, MicOff, Settings, Bell } from 'lucide-react';
import { AppTheme, ConversationState } from '../types';

interface BottomDockProps {
  currentTab: number; // 0: Home, 1: Chat, 2: Settings, 3: Updates
  conversationState: ConversationState;
  theme: AppTheme;
  isMicMuted: boolean;
  hasUpdatesBadge?: boolean;
  onSelectTab: (tabIndex: number) => void;
  onMicClick: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentTab,
  conversationState,
  theme,
  isMicMuted,
  hasUpdatesBadge = true,
  onSelectTab,
  onMicClick,
}) => {
  const isListening = conversationState === 'listening';
  const isSpeaking = conversationState === 'speaking';
  const isThinking = conversationState === 'thinking';

  // Determine active theme colors for the dock
  const getDockThemeStyles = () => {
    switch (theme) {
      case 'sunset':
        return {
          dockBg: 'bg-[#180E1A]/85 border-orange-500/25',
          activeTab: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
          inactiveTab: 'text-orange-200/50 hover:text-orange-200',
          heroMic: 'bg-gradient-to-tr from-orange-600 via-rose-500 to-amber-500 shadow-orange-500/50',
          archStroke: 'rgba(255, 106, 61, 0.45)',
        };
      case 'red':
        return {
          dockBg: 'bg-[#14060A]/85 border-rose-500/25',
          activeTab: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
          inactiveTab: 'text-rose-200/50 hover:text-rose-200',
          heroMic: 'bg-gradient-to-tr from-rose-600 via-red-500 to-pink-500 shadow-rose-500/50',
          archStroke: 'rgba(255, 70, 90, 0.45)',
        };
      case 'light':
        return {
          dockBg: 'bg-white/90 border-slate-200/80 shadow-slate-300/50',
          activeTab: 'bg-blue-50 text-blue-600 border border-blue-200',
          inactiveTab: 'text-slate-400 hover:text-slate-700',
          heroMic: 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-500/40',
          archStroke: 'rgba(37, 99, 235, 0.35)',
        };
      case 'dark':
      default:
        return {
          dockBg: 'bg-[#0A1020]/85 border-cyan-500/25',
          activeTab: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
          inactiveTab: 'text-slate-400 hover:text-slate-200',
          heroMic: 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-cyan-500/50',
          archStroke: 'rgba(0, 190, 255, 0.45)',
        };
    }
  };

  const styles = getDockThemeStyles();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-3 pb-3 pt-1 pointer-events-none">
      {/* Outer Dock wrapper */}
      <div className="relative pointer-events-auto">
        {/* Curved arch line over the center mic (port of CurvedDockLineView.kt) */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-6 flex items-center justify-center pointer-events-none overflow-hidden">
          <svg viewBox="0 0 120 30" className="w-full h-full">
            <path
              d="M 5 28 Q 60 -8 115 28"
              fill="none"
              stroke={styles.archStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Liquid Glass Capsule Dock */}
        <nav
          className={`h-16 rounded-3xl flex items-center justify-between px-2 sm:px-3 border backdrop-blur-2xl shadow-2xl transition-all duration-300 ${styles.dockBg}`}
        >
          {/* Tab 0: Home */}
          <button
            onClick={() => onSelectTab(0)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 0 ? styles.activeTab : styles.inactiveTab
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Tab 1: Chat */}
          <button
            onClick={() => onSelectTab(1)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 1 ? styles.activeTab : styles.inactiveTab
            }`}
            title="Chat Conversation"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">Chat</span>
          </button>

          {/* Tab Mic: Center Hero Button */}
          <div className="flex-1 flex items-center justify-center -translate-y-3.5">
            <button
              onClick={onMicClick}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-90 shadow-xl ${
                styles.heroMic
              } ${isListening ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-black animate-pulse' : ''}`}
              title={isListening ? 'Listening... Tap to stop' : 'Tap to speak to Jarvis'}
            >
              {/* Outer pulsing ping when live */}
              {isListening && (
                <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-30" />
              )}
              {isMicMuted ? (
                <MicOff className="w-6 h-6 text-red-200" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Tab 2: Settings */}
          <button
            onClick={() => onSelectTab(2)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
              currentTab === 2 ? styles.activeTab : styles.inactiveTab
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">Settings</span>
          </button>

          {/* Tab 3: Updates */}
          <button
            onClick={() => onSelectTab(3)}
            className={`flex-1 py-1.5 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 relative ${
              currentTab === 3 ? styles.activeTab : styles.inactiveTab
            }`}
            title="System Updates & Diagnostics"
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              {hasUpdatesBadge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">Updates</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
