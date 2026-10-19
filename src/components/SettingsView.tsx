import React, { useState } from 'react';
import {
  User,
  Sliders,
  Sparkles,
  Volume2,
  Key,
  Shield,
  Palette,
  Mic,
  Eye,
  RefreshCw,
  Check,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { AppPreferences, AppTheme, PersonaType } from '../types';
import {
  SUPPORTED_MODELS,
  SUPPORTED_VOICES,
  SUPPORTED_PERSONAS,
  SUPPORTED_LANGUAGES,
} from '../services/preferencesStore';

interface SettingsViewProps {
  preferences: AppPreferences;
  onUpdatePreferences: (updated: Partial<AppPreferences>) => void;
  onOpenVoiceEnrollment: () => void;
  onClearHistory: () => void;
  onResetPreferences: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onOpenVoiceEnrollment,
  onClearHistory,
  onResetPreferences,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(preferences.apiKey || '');
  const [showKeySaved, setShowKeySaved] = useState(false);

  const isDark = preferences.theme === 'dark' || preferences.theme === 'red' || preferences.theme === 'sunset';

  const handleSaveKey = () => {
    onUpdatePreferences({ apiKey: apiKeyInput.trim() });
    setShowKeySaved(true);
    setTimeout(() => setShowKeySaved(false), 2000);
  };

  const cardStyle = `p-4 sm:p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
    preferences.theme === 'sunset'
      ? 'bg-orange-950/20 border-orange-500/20 text-orange-50'
      : preferences.theme === 'red'
      ? 'bg-rose-950/20 border-rose-500/20 text-rose-50'
      : preferences.theme === 'light'
      ? 'bg-white/85 border-slate-200 text-slate-800 shadow-sm'
      : 'bg-slate-900/60 border-cyan-500/20 text-cyan-50'
  }`;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold tracking-tight">System Parameters</h2>
          <p className="text-xs text-slate-400">Jarvis OS • Architecture v1.8.7</p>
        </div>
        <button
          onClick={onResetPreferences}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          title="Restore factory default configurations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Operator Identity & Persona */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Operator Profile & AI Persona</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Operator Call-Sign (User Name)</label>
            <input
              type="text"
              value={preferences.userName}
              onChange={(e) => onUpdatePreferences({ userName: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Assistant Persona</label>
            <select
              value={preferences.persona}
              onChange={(e) => onUpdatePreferences({ persona: e.target.value as PersonaType })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {SUPPORTED_PERSONAS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Primary Conversation Dialect</label>
            <select
              value={preferences.language}
              onChange={(e) => onUpdatePreferences({ language: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Theme & Visual Style */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <Palette className="w-4 h-4 text-orange-400" />
          <span>Interface Appearance & Theme</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'sunset', name: 'Liquid Sunset', color: 'bg-gradient-to-tr from-orange-600 to-rose-600', badge: 'Default' },
            { id: 'dark', name: 'Liquid Obsidian', color: 'bg-gradient-to-tr from-cyan-600 to-blue-700', badge: 'Cyber' },
            { id: 'red', name: 'Liquid Ruby', color: 'bg-gradient-to-tr from-rose-700 to-red-600', badge: 'Stark' },
            { id: 'light', name: 'Liquid Pearl', color: 'bg-gradient-to-tr from-slate-100 to-blue-200 text-slate-800', badge: 'Clean' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => onUpdatePreferences({ theme: th.id as AppTheme })}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                preferences.theme === th.id
                  ? 'border-white ring-2 ring-white/30 font-bold'
                  : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`w-full h-8 rounded-lg mb-2 ${th.color} shadow-sm`} />
              <div className="text-[11px] leading-tight">{th.name}</div>
              <span className="text-[9px] text-slate-400 font-mono">{th.badge}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Orb Visualizer Calibration */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Orb Core Visualizer Dynamics</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Rotation Velocity</span>
              <span className="font-mono">{preferences.orbSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={preferences.orbSpeed}
              onChange={(e) => onUpdatePreferences({ orbSpeed: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Volumetric Glow Intensity</span>
              <span className="font-mono">{Math.round(preferences.orbGlow * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.05"
              value={preferences.orbGlow}
              onChange={(e) => onUpdatePreferences({ orbGlow: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* 4. AI Voice & Gemini Model */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Speech Synthesis & AI Engine</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Neural Voice Synthesis</label>
            <select
              value={preferences.voice}
              onChange={(e) => onUpdatePreferences({ voice: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {SUPPORTED_VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Gemini Intelligence Model</label>
            <select
              value={preferences.aiModel}
              onChange={(e) => onUpdatePreferences({ aiModel: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border outline-none ${
                isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-200">Owner Voice Matching</span>
              <p className="text-[10px] text-slate-400">Restricts voice execution to enrolled voice biometric</p>
            </div>
            <button
              onClick={onOpenVoiceEnrollment}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors font-medium"
            >
              Enroll Voice
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="font-medium text-slate-200">Silent Execution Mode</span>
              <p className="text-[10px] text-slate-400">Perform background automations quietly without narration</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.silentExecutionMode}
              onChange={(e) => onUpdatePreferences({ silentExecutionMode: e.target.checked })}
              className="w-4 h-4 rounded accent-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* 5. Gemini API Key Configuration */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <Key className="w-4 h-4 text-purple-400" />
          <span>Gemini API Key (Optional)</span>
        </div>

        <p className="text-xs text-slate-400 mb-2">
          By default, Jarvis uses the integrated intelligent engine. You may optionally connect your direct Gemini API key for live multimodal processing.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none font-mono ${
              isDark ? 'bg-black/30 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
          <button
            onClick={handleSaveKey}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {showKeySaved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{showKeySaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </section>

      {/* 6. System Permissions & Privacy Shield */}
      <section className={cardStyle}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Privacy Shield & Hardware Authorizations</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { name: 'Microphone & Speech Engine', desc: 'Real-time duplex voice recognition', status: 'Active' },
            { name: 'Atmospheric Location', desc: 'Open-Meteo live barometric weather telemetry', status: 'Active' },
            { name: 'Display Screen Share', desc: 'Visual task grounding and screen capture HUD', status: 'Ready' },
            { name: 'Persistent Memory SQLite Store', desc: 'Local encrypted knowledge base storage', status: 'Active' },
          ].map((perm, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
              <div>
                <p className="font-medium text-slate-200">{perm.name}</p>
                <p className="text-[10px] text-slate-400">{perm.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {perm.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
