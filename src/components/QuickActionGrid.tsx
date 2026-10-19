import React from 'react';
import { ScreenShare, Database, Globe, Zap } from 'lucide-react';
import { AppTheme } from '../types';

interface QuickActionGridProps {
  theme: AppTheme;
  isScreenSharing: boolean;
  activeLanguage: string;
  onToggleScreenShare: () => void;
  onOpenMemories: () => void;
  onOpenLanguage: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  theme,
  isScreenSharing,
  activeLanguage,
  onToggleScreenShare,
  onOpenMemories,
  onOpenLanguage,
}) => {
  const isDark = theme === 'dark' || theme === 'red' || theme === 'sunset';

  const cardBaseStyle = `flex-1 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 active:scale-95 border backdrop-blur-md ${
    theme === 'sunset'
      ? 'bg-orange-950/25 border-orange-500/20 hover:border-orange-500/40 text-orange-200'
      : theme === 'red'
      ? 'bg-rose-950/25 border-rose-500/20 hover:border-rose-500/40 text-rose-200'
      : theme === 'light'
      ? 'bg-white/85 border-slate-200 hover:border-blue-300 text-slate-700 shadow-sm'
      : 'bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-200'
  }`;

  return (
    <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3">
      {/* 1. Screen Share */}
      <button
        onClick={onToggleScreenShare}
        className={`${cardBaseStyle} ${
          isScreenSharing ? 'ring-2 ring-emerald-500 bg-emerald-950/40' : ''
        }`}
        title="Share Screen with Jarvis Vision"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
            isScreenSharing
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-slate-300'
          }`}
        >
          <ScreenShare className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold tracking-tight leading-tight">
          {isScreenSharing ? 'Sharing' : 'Vision'}
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5">
          {isScreenSharing ? 'Active Live' : 'Screen HUD'}
        </span>
      </button>

      {/* 2. Saved Memories */}
      <button
        onClick={onOpenMemories}
        className={cardBaseStyle}
        title="Open Long-Term Memory Core"
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 text-slate-300">
          <Database className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold tracking-tight leading-tight">
          Memories
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5">
          Knowledge Base
        </span>
      </button>

      {/* 3. Conversation Language */}
      <button
        onClick={onOpenLanguage}
        className={cardBaseStyle}
        title="Change Speech & Persona Language"
      >
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-1.5 text-slate-300">
          <Globe className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold tracking-tight leading-tight">
          Language
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[80px]">
          {activeLanguage.split(' ')[0]}
        </span>
      </button>
    </div>
  );
};
