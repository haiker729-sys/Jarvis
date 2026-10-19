import React from 'react';
import { Bell, ShieldAlert, Sparkles, CheckCircle, Info } from 'lucide-react';
import { AppTheme } from '../types';

interface UpdatesViewProps {
  theme: AppTheme;
}

interface FeatureNotice {
  feature: string;
  title: string;
  details: string;
  kind?: 'FEATURE' | 'DIAGNOSTIC';
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({ theme }) => {
  const features: FeatureNotice[] = [
    {
      feature: 'Agent tasks',
      title: 'Verified actions and recovery',
      details:
        'JARVIS observes current context, checks action results, tracks execution progress, and halts safely when input or screen state is ambiguous.',
    },
    {
      feature: 'Floating avatar HUD',
      title: 'Always-on or working-only display',
      details:
        'Active status indicator, compact task progress tracking, and dock-edge customization available in settings.',
    },
    {
      feature: 'Task progress HUD',
      title: 'Four-step compact status engine',
      details:
        'The task HUD tracks goals, recent execution steps, live running indicators, completed checks, and a high-tech progress line.',
    },
    {
      feature: 'Silent execution',
      title: 'Quiet task automation',
      details:
        'When enabled, task narration is muted while ordinary conversation remains clearly audible.',
    },
    {
      feature: 'WhatsApp Automation',
      title: 'Saved contact lookup & dispatch',
      details:
        'Contact aliases and phone lookups are fully supported. Reports missing parameters cleanly without guessing.',
    },
    {
      feature: 'Phone calls',
      title: 'Permission-aware direct calling',
      details:
        'Standard cellular calls and WhatsApp voice/video calls are disambiguated before initiating execution.',
    },
    {
      feature: 'Google Flow / AI Studio',
      title: 'Browser input diagnostics',
      details:
        'Visual grounding engine inspects active DOM and editor fields; screen sharing provides fresh real-time frames for UI targeting.',
      kind: 'DIAGNOSTIC',
    },
    {
      feature: 'Instagram Automation',
      title: 'Bulk action safety limiters',
      details:
        'Bulk actions track progress and require end-of-list verification to avoid incomplete executions.',
      kind: 'DIAGNOSTIC',
    },
    {
      feature: 'Spotify & YouTube',
      title: 'Song search and playback verification',
      details:
        'Searches inspect candidate results and verify playback readiness before reporting success.',
    },
    {
      feature: 'System Authorizations',
      title: 'Per-feature access status matrix',
      details:
        'System Authorizations inspect microphone, location, speech recognition, audio streams, and persistent memory.',
    },
    {
      feature: 'AI Persona & Dialects',
      title: 'Operator profile preview & multilingual engine',
      details:
        'Select between Jarvis Pro, Naira Companion, Girlfriend/Boyfriend modes, TechGPT X, and preview voice synthesis in real-time.',
    },
    {
      feature: 'Appearance & Theme',
      title: 'Sunset theme by default',
      details:
        'Fresh environments start in the liquid sunset theme; dark obsidian, liquid ruby, and pearl light themes remain instantly switchable.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-28">
      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/10">
        <Bell className="w-5 h-5 text-rose-400" />
        <div>
          <h2 className="text-base font-bold tracking-tight">System Changelog & Diagnostics</h2>
          <p className="text-[11px] text-slate-400">Firmware Build 1.8.7 • Architecture Matrix</p>
        </div>
      </div>

      {/* Feature cards */}
      <div className="space-y-3">
        {features.map((item, index) => {
          const isDiagnostic = item.kind === 'DIAGNOSTIC';
          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                isDiagnostic
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : theme === 'sunset'
                  ? 'bg-orange-950/20 border-orange-500/20'
                  : theme === 'red'
                  ? 'bg-rose-950/20 border-rose-500/20'
                  : theme === 'light'
                  ? 'bg-white/80 border-slate-200 shadow-sm'
                  : 'bg-slate-900/60 border-cyan-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[11px] font-bold tracking-wider uppercase ${
                    isDiagnostic ? 'text-amber-400' : 'text-cyan-400'
                  }`}
                >
                  {item.feature}
                </span>

                {isDiagnostic ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    DIAGNOSTIC
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    VERIFIED
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-100 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.details}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
