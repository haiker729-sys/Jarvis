import React, { useState, useRef, useEffect } from 'react';
import { X, ScreenShare, Sparkles, Eye, ShieldCheck, Video, StopCircle } from 'lucide-react';
import { AppTheme } from '../types';

interface ScreenShareModalProps {
  isOpen: boolean;
  theme: AppTheme;
  isSharing: boolean;
  onClose: () => void;
  onStartShare: () => Promise<boolean>;
  onStopShare: () => void;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isOpen,
  theme,
  isSharing,
  onClose,
  onStartShare,
  onStopShare,
}) => {
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (!isOpen || !isSharing) return;
    const interval = setInterval(() => {
      setActiveFrame((f) => (f + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, [isOpen, isSharing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#080D18] border border-cyan-500/30 text-white p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Visual Grounding Engine</h3>
              <p className="text-xs text-slate-400">Multimodal Screen Perception & OCR HUD</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Simulation / Feed */}
        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-cyan-500/40 overflow-hidden flex items-center justify-center">
          {/* Futuristic scanning grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00beff10_1px,transparent_1px),linear-gradient(to_bottom,#00beff10_1px,transparent_1px)] bg-[size:16px_16px]" />

          {isSharing ? (
            <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between">
              {/* Target Bounding Box */}
              <div className="self-center my-auto p-4 rounded-xl border border-dashed border-cyan-400/80 bg-cyan-500/10 flex flex-col items-center gap-1.5 animate-pulse">
                <span className="text-[10px] font-mono font-bold text-cyan-300">
                  [GROUNDING_TARGET_ACQUIRED: CONFIDENCE 99.4%]
                </span>
                <span className="text-xs text-slate-200">
                  Frame #{activeFrame} • 1920x1080 @ 30fps
                </span>
              </div>

              {/* Status footer inside HUD */}
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
                <span>FPS: 30.0</span>
                <span>LATENCY: 8ms</span>
                <span>STATUS: LIVE STREAMING</span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-2">
              <ScreenShare className="w-10 h-10 text-slate-600 mb-1" />
              <p className="text-sm font-semibold text-slate-300">
                Visual Perception Standby
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Activate screen sharing to allow Jarvis to observe active windows, analyze diagrams, inspect errors, or automate browser flows.
              </p>
            </div>
          )}
        </div>

        {/* Action Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-xs text-slate-400">
            {isSharing ? 'Live transmission active' : 'Screen capture ready'}
          </div>

          <div className="flex items-center gap-2">
            {isSharing ? (
              <button
                onClick={onStopShare}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop Vision</span>
              </button>
            ) : (
              <button
                onClick={onStartShare}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Initialize Vision Feed</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
