import React from 'react';
import { MessageSquare, Settings, Sparkles, AlertCircle, X } from 'lucide-react';
import { AppTheme, PersonaType } from '../types';

interface HeaderProps {
  userName: string;
  persona: PersonaType;
  theme: AppTheme;
  liveError?: string | null;
  onClearError?: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onPersonaClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  persona,
  theme,
  liveError,
  onClearError,
  onOpenChat,
  onOpenSettings,
  onPersonaClick,
}) => {
  const isDark = theme === 'dark' || theme === 'red' || theme === 'sunset';
  const isNaira = persona === 'Naira';

  return (
    <header className="relative w-full px-4 sm:px-6 pt-4 pb-2 z-20 flex flex-col gap-2">
      {/* Top Bar row */}
      <div className="flex items-center justify-between">
        {/* Left: Chat Quick Nav Button */}
        <button
          onClick={onOpenChat}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 border ${
            isDark
              ? 'bg-slate-900/60 border-slate-700/60 text-slate-200 hover:bg-slate-800/80 shadow-lg shadow-black/20'
              : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white shadow-sm'
          } backdrop-blur-md`}
          title="Open Conversation"
          aria-label="Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Center: Assistant Branding & Greeting */}
        <div
          onClick={onPersonaClick}
          className="flex flex-col items-center cursor-pointer group text-center px-2"
        >
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-base uppercase">
            <span
              className={`transition-colors duration-200 ${
                theme === 'sunset'
                  ? 'text-orange-500 group-hover:text-orange-400'
                  : theme === 'red'
                  ? 'text-rose-500 group-hover:text-rose-400'
                  : theme === 'light'
                  ? 'text-blue-600 group-hover:text-blue-500'
                  : 'text-cyan-400 group-hover:text-cyan-300'
              }`}
            >
              {isNaira ? 'NAIRA' : 'JARVIS'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-white/10 text-xs text-slate-400 border border-white/10">
              v1.8.7
            </span>
          </div>
          <p
            className={`text-xs font-medium tracking-tight mt-0.5 transition-colors ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Welcome, {userName || 'Sir'}
          </p>
        </div>

        {/* Right: Settings Quick Nav Button */}
        <button
          onClick={onOpenSettings}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 border ${
            isDark
              ? 'bg-slate-900/60 border-slate-700/60 text-slate-200 hover:bg-slate-800/80 shadow-lg shadow-black/20'
              : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white shadow-sm'
          } backdrop-blur-md`}
          title="Settings & System Config"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Optional Alert/Error Toast Bar */}
      {liveError && (
        <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span className="line-clamp-1">{liveError}</span>
          </div>
          <button
            onClick={onClearError}
            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
