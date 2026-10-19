import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export type ConversionLifecycleState = 'ready' | 'converting' | 'completed' | 'error';

interface ConversionStateIndicatorProps {
  state: ConversionLifecycleState;
  hasFile: boolean;
  fileName?: string;
  progressPercent?: number;
  errorMessage?: string;
  errorRemedy?: string;
  supportedFormats: string;
  maxFileSizeMB: number;
  onReset?: () => void;
  outputFormatName?: string;
}

export const ConversionStateIndicator: React.FC<ConversionStateIndicatorProps> = ({
  state,
  hasFile,
  fileName,
  progressPercent,
  errorMessage,
  errorRemedy,
  supportedFormats,
  maxFileSizeMB,
  onReset,
  outputFormatName,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Upfront Security & Format Badges (Before & During Conversion) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Processed on your device</span>
          </div>
          <span className="text-neutral-400 hidden sm:inline">•</span>
          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 hidden sm:inline font-medium">
            Zero server uploads
          </span>
        </div>

        <div className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
          <span>Max <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{maxFileSizeMB}MB</strong>/file</span>
          <span className="text-neutral-400">•</span>
          <span className="font-mono text-[10px] text-neutral-700 dark:text-neutral-300 font-semibold uppercase truncate max-w-[220px]">
            {supportedFormats}
          </span>
        </div>
      </div>

      {/* Explicit 3-Stage Lifecycle Stepper */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* Step 1: Input / File */}
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
            hasFile
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
              : 'glass-panel border-neutral-200 dark:border-white/5 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          {hasFile ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-neutral-400 dark:border-neutral-500 flex items-center justify-center text-[10px] shrink-0 font-mono">
              1
            </div>
          )}
          <span className="truncate">
            {hasFile && fileName ? fileName : '1. Upload File'}
          </span>
        </div>

        {/* Step 2: Configure & Convert */}
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
            state === 'converting'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
              : state === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
              : hasFile
              ? 'bg-amber-500/10 border-amber-500/25 text-neutral-900 dark:text-white font-medium'
              : 'glass-panel border-neutral-200 dark:border-white/5 text-neutral-400 opacity-60'
          }`}
        >
          {state === 'converting' ? (
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
          ) : state === 'completed' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-neutral-400 dark:border-neutral-500 flex items-center justify-center text-[10px] shrink-0 font-mono">
              2
            </div>
          )}
          <span className="truncate">
            {state === 'converting'
              ? `Converting ${progressPercent ? `${progressPercent}%` : ''}`
              : outputFormatName
              ? `2. Set ${outputFormatName}`
              : '2. Options'}
          </span>
        </div>

        {/* Step 3: Result & Download */}
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
            state === 'completed'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
              : 'glass-panel border-neutral-200 dark:border-white/5 text-neutral-400 opacity-60'
          }`}
        >
          {state === 'completed' ? (
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-neutral-400 dark:border-neutral-500 flex items-center justify-center text-[10px] shrink-0 font-mono">
              3
            </div>
          )}
          <span className="truncate">
            {state === 'completed' ? '3. Complete!' : '3. Download'}
          </span>
        </div>
      </div>

      {/* Progress Bar When Converting */}
      {state === 'converting' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing locally via browser engine...
            </span>
            <span className="font-mono">{progressPercent || 75}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-amber-500/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${progressPercent || 75}%` }}
            />
          </div>
        </div>
      )}

      {/* Detailed Actionable Error Display */}
      {state === 'error' && errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs sm:text-sm space-y-1.5"
        >
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Conversion could not be completed</span>
          </div>
          <p className="text-neutral-800 dark:text-neutral-200 pl-6 leading-relaxed">
            {errorMessage}
          </p>
          {errorRemedy && (
            <p className="text-neutral-700 dark:text-neutral-300 pl-6 text-xs font-medium">
              <strong>What to do next:</strong> {errorRemedy}
            </p>
          )}
          {onReset && (
            <div className="pt-2 pl-6">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-900 dark:text-rose-200 font-semibold transition cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try another file</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
