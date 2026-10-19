import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  X,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  ChevronRight,
  FileCode,
  FileImage,
} from 'lucide-react';
import type { ToolType } from '../services/conversionService';

export interface HistoryItem {
  id: string;
  timestamp: number;
  toolId: ToolType;
  toolTitle: string;
  badge: string;
  summary: string;
  details?: string;
  inputContent?: string;
  outputContent?: string;
}

export interface PresetWorkflow {
  id: string;
  title: string;
  toolId: ToolType;
  description: string;
  badge: string;
  iconType: 'media' | 'code' | 'utility';
  apply: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface HistoryPresetsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onRestoreHistory: (item: HistoryItem) => void;
  presets: PresetWorkflow[];
}

export const HistoryPresetsDrawer: React.FC<HistoryPresetsDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteHistoryItem,
  onRestoreHistory,
  presets,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'presets'>('history');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Activity history and preset workflows drawer"
        className="relative w-full max-w-md bg-white dark:bg-[#0c0e14] border-l border-neutral-200/80 dark:border-white/10 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200"
      >
        {/* Top Specular Glow Edge */}
        <div className="h-0.5 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              {activeTab === 'history' ? <Clock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                {activeTab === 'history' ? 'Local Activity History' : 'Quick Presets & Recipes'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {activeTab === 'history'
                  ? `${history.length} transformation${history.length === 1 ? '' : 's'} cached in browser`
                  : '1-click optimized workflows'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close activity history drawer"
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Activity drawer tabs" className="px-4 pt-3 pb-2 border-b border-neutral-200/60 dark:border-white/5 flex gap-2">
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {history.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-bold ml-1">
                {history.length}
              </span>
            )}
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'presets'}
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Presets</span>
          </button>
        </div>

        {/* Tab Content: History List */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-neutral-400">
                <Clock className="w-8 h-8 opacity-40 mb-1" />
                <p className="font-semibold text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  No transformations yet
                </p>
                <p className="text-[11px] leading-relaxed max-w-xs">
                  Your conversions (images, JSON, hashes, codes) will automatically appear here for 1-click restore.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-amber-500/30 transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white text-xs">
                        {item.toolTitle}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono truncate bg-white/60 dark:bg-neutral-950/60 p-2 rounded-xl border border-neutral-200/60 dark:border-white/5">
                    {item.summary}
                  </p>

                  {item.details && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {item.details}
                    </p>
                  )}

                  {/* Item Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/40 dark:border-white/5 text-xs">
                    <button
                      onClick={() => {
                        onRestoreHistory(item);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore to Editor</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {item.outputContent && (
                        <button
                          onClick={() => handleCopy(item.id, item.outputContent)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
                          title="Copy output result"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1 rounded-lg text-neutral-400 hover:text-red-500 transition cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Quick Presets */}
        {activeTab === 'presets' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Sliders className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="text-[11px] leading-relaxed">
                Click any recipe to instantly configure tools with battle-tested production settings.
              </p>
            </div>

            <div className="space-y-2.5">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    preset.apply();
                    onClose();
                  }}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200/80 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-amber-500/40 hover:bg-amber-500/5 transition text-left cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5 text-neutral-700 dark:text-neutral-300 group-hover:text-amber-500 transition-colors">
                      {preset.iconType === 'media' ? (
                        <FileImage className="w-4 h-4" />
                      ) : (
                        <FileCode className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {preset.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-neutral-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Private (Local Cache)</span>
          </div>

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] font-semibold text-neutral-400 hover:text-red-500 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPresetsDrawer;
