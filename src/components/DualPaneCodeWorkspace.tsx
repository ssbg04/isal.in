import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  Trash2,
  Clipboard,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface DualPaneCodeWorkspaceProps {
  inputTitle: string;
  outputTitle: string;
  inputValue: string;
  outputValue: string;
  onInputChange: (val: string) => void;
  onTransform: () => void;
  onSwap?: () => void;
  onLoadSample?: () => void;
  autoTransform: boolean;
  onAutoTransformChange: (enabled: boolean) => void;
  transformButtonText?: string;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
  inputBadge?: string;
  outputBadge?: string;
  outputFileExtension?: string;
  isProcessing?: boolean;
}

export const DualPaneCodeWorkspace: React.FC<DualPaneCodeWorkspaceProps> = ({
  inputTitle,
  outputTitle,
  inputValue,
  outputValue,
  onInputChange,
  onTransform,
  onSwap,
  onLoadSample,
  autoTransform,
  onAutoTransformChange,
  transformButtonText = 'Transform Input',
  inputPlaceholder = 'Paste or type input here...',
  outputPlaceholder = 'Transformed output will appear here...',
  inputBadge,
  outputBadge,
  outputFileExtension = 'txt',
  isProcessing = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = useState<'input' | 'output'>('input');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Helper to format bytes
  const formatBytes = (str: string) => {
    const bytes = new Blob([str]).size;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const getLineCount = (str: string) => (str ? str.split('\n').length : 0);

  const handleCopy = () => {
    if (!outputValue) return;
    navigator.clipboard.writeText(outputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onInputChange(text);
    } catch {
      // Permission denied or not supported
    }
  };

  const handleDownload = () => {
    if (!outputValue) return;
    const blob = new Blob([outputValue], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${Date.now()}.${outputFileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar: Mobile Tab Switcher + Auto-Transform & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl glass-panel text-xs">
        {/* Mobile View Switcher (Input vs Output) */}
        <div className="flex md:hidden items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setActiveTabMobile('input')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTabMobile === 'input'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Input
          </button>
          <button
            type="button"
            onClick={() => setActiveTabMobile('output')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              activeTabMobile === 'output'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            <span>Output</span>
            {outputValue && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* Live Auto-Transform & Swap Buttons */}
        <div className="flex items-center gap-2">
          {/* Live Sync Toggle */}
          <button
            type="button"
            onClick={() => onAutoTransformChange(!autoTransform)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              autoTransform
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                : 'border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Automatically transform input while typing without pressing Convert"
          >
            <Zap className={`w-3.5 h-3.5 ${autoTransform ? 'text-amber-500 fill-amber-500/20' : 'text-neutral-400'}`} />
            <span>Live Sync {autoTransform ? 'ON' : 'OFF'}</span>
          </button>

          {/* Swap Input & Output (if supported) */}
          {onSwap && (
            <button
              type="button"
              onClick={onSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 glass-panel hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition cursor-pointer"
              title="Swap input and output content & reverse conversion direction"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swap Directions</span>
            </button>
          )}
        </div>

        {/* Expand / Minimize Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 glass-panel text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Restore height' : 'Expand editor height'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Dual Pane Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Pane: INPUT */}
        <div
          className={`rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 p-4 sm:p-5 flex flex-col space-y-3 relative overflow-hidden transition-all duration-200 ${
            activeTabMobile === 'input' ? 'block' : 'hidden md:flex'
          }`}
        >
          {/* Input Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="font-bold text-neutral-950 dark:text-white text-sm">{inputTitle}</span>
              {inputBadge && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {inputBadge}
                </span>
              )}
            </div>

            {/* Input Action Buttons */}
            <div className="flex items-center gap-1.5">
              {onLoadSample && (
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                >
                  Load Sample
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
              </button>
              {inputValue && (
                <button
                  type="button"
                  onClick={() => onInputChange('')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="flex-1 min-h-[220px]">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              rows={isExpanded ? 18 : 10}
              className="w-full h-full bg-white/60 dark:bg-[#0c0e14]/70 border border-neutral-200/70 dark:border-white/5 rounded-2xl p-4 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition resize-y shadow-inner leading-relaxed"
            />
          </div>

          {/* Input Footer Metrics */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
            <span>
              {getLineCount(inputValue)} lines • {inputValue.length} chars
            </span>
            <span>{formatBytes(inputValue)}</span>
          </div>
        </div>

        {/* Right Pane: OUTPUT */}
        <div
          className={`rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 p-4 sm:p-5 flex flex-col space-y-3 relative overflow-hidden transition-all duration-200 ${
            activeTabMobile === 'output' ? 'block' : 'hidden md:flex'
          }`}
        >
          {/* Top Specular Line for Output */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />

          {/* Output Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-neutral-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-neutral-950 dark:text-white text-sm">{outputTitle}</span>
              {outputBadge && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {outputBadge}
                </span>
              )}
            </div>

            {/* Output Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputValue}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 disabled:opacity-40 transition cursor-pointer"
                title="Copy output to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!outputValue}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition cursor-pointer"
                title="Download result as file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Output Textarea */}
          <div className="flex-1 min-h-[220px]">
            <textarea
              readOnly
              value={outputValue}
              placeholder={outputPlaceholder}
              rows={isExpanded ? 18 : 10}
              className="w-full h-full bg-neutral-100/70 dark:bg-[#0c0e14]/90 border border-neutral-200/70 dark:border-white/5 rounded-2xl p-4 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Output Footer Metrics */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
            <span>
              {getLineCount(outputValue)} lines • {outputValue.length} chars
            </span>
            <span>{formatBytes(outputValue)}</span>
          </div>
        </div>
      </div>

      {/* Manual Transform Action Trigger (Shown when Live Sync is OFF or to re-trigger) */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onTransform}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl transition shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{isProcessing ? 'Processing in Browser...' : transformButtonText}</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/15 text-neutral-900">
          Ctrl+↵
        </kbd>
      </button>
    </div>
  );
};

export default DualPaneCodeWorkspace;
