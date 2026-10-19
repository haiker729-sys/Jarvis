import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/preferencesStore';
import { AppTheme } from '../types';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  theme: AppTheme;
  currentLanguage: string;
  onClose: () => void;
  onSelectLanguage: (lang: string) => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  theme,
  currentLanguage,
  onClose,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#090E18] border border-cyan-500/30 text-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold">Select Dialect</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{lang}</span>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
