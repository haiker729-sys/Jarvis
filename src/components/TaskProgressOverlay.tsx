import React from 'react';
import { Sparkles, CheckCircle2, Loader2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AgentTaskState } from '../types';

interface TaskProgressOverlayProps {
  task: AgentTaskState;
  onCancelTask: () => void;
}

export const TaskProgressOverlay: React.FC<TaskProgressOverlayProps> = ({
  task,
  onCancelTask,
}) => {
  if (!task.isActive) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-3xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              AGENT HUD • {task.actionType}
            </span>
          </div>

          <button
            onClick={onCancelTask}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Cancel Agent Task"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Goal */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="line-clamp-1">{task.goal}</span>
          </h4>
        </div>

        {/* 4-Step Progress Matrix */}
        <div className="space-y-2 mb-3">
          {task.steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                step.status === 'running'
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200'
                  : step.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] font-mono">
                    {idx + 1}
                  </span>
                )}
                <span className="font-medium">{step.title}</span>
              </div>

              {step.details && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {step.details}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Subdued dark progress line */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{
              width: `${((task.currentStepIndex + 1) / task.steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
