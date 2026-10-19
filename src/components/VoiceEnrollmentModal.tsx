import React, { useState } from 'react';
import { X, Mic, Check, Volume2, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { AppTheme } from '../types';

interface VoiceEnrollmentModalProps {
  isOpen: boolean;
  theme: AppTheme;
  isEnabled: boolean;
  threshold: number;
  sampleCount: number;
  onClose: () => void;
  onSaveProfile: (enabled: boolean, threshold: number, samples: number) => void;
}

export const VoiceEnrollmentModal: React.FC<VoiceEnrollmentModalProps> = ({
  isOpen,
  theme,
  isEnabled,
  threshold,
  sampleCount,
  onClose,
  onSaveProfile,
}) => {
  const [enabled, setEnabled] = useState(isEnabled);
  const [thresh, setThresh] = useState(threshold);
  const [samples, setSamples] = useState(sampleCount);
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [sampleStep, setSampleStep] = useState(1);

  if (!isOpen) return null;

  const handleRecordSample = () => {
    setIsRecordingSample(true);
    setTimeout(() => {
      setIsRecordingSample(false);
      setSamples((prev) => Math.min(3, prev + 1));
      if (sampleStep < 3) setSampleStep((s) => s + 1);
    }, 1800);
  };

  const handleClear = () => {
    setSamples(0);
    setSampleStep(1);
    setEnabled(false);
  };

  const handleSave = () => {
    onSaveProfile(enabled, thresh, samples);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#090E18] border border-cyan-500/30 text-white p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Owner Voice Biometrics</h3>
              <p className="text-xs text-slate-400">Speaker Recognition Calibration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enable toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
          <div>
            <span className="text-sm font-semibold">Enable Owner Verification</span>
            <p className="text-[11px] text-slate-400">Block unauthorized voices from running tasks</p>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Sample training status */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-cyan-200">Voice Vector Samples:</span>
            <span className="font-mono text-cyan-400 font-bold">{samples}/3 Samples</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`h-1.5 rounded-full ${
                  num <= samples ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-300">
            {samples < 3
              ? `Sample phrase: "Hey Jarvis, authorize command protocol."`
              : 'Master voice acoustic template successfully calibrated.'}
          </p>

          <button
            onClick={handleRecordSample}
            disabled={isRecordingSample || samples >= 3}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              samples >= 3
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            }`}
          >
            <Mic className={`w-4 h-4 ${isRecordingSample ? 'animate-pulse text-red-500' : ''}`} />
            <span>
              {isRecordingSample
                ? 'Capturing acoustic profile...'
                : samples >= 3
                ? 'Profile Complete'
                : `Capture Sample ${samples + 1}`}
            </span>
          </button>
        </div>

        {/* Matching Sensitivity Slider */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Cosine Similarity Threshold</span>
            <span className="font-mono text-cyan-400 font-bold">{(thresh * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.55"
            max="0.90"
            step="0.05"
            value={thresh}
            onChange={(e) => setThresh(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <p className="text-[10px] text-slate-500">
            Recommended: 70%. Higher values require exact vocal match.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
