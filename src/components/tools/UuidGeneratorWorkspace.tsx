import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { generateUUIDs } from '../../services/conversionService';

interface UuidGeneratorWorkspaceProps {
  onHistoryAdd?: (summary: string, output: string) => void;
}

export const UuidGeneratorWorkspace: React.FC<UuidGeneratorWorkspaceProps> = ({ onHistoryAdd }) => {
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    const list = generateUUIDs(uuidCount);
    const text = list.join('\n');
    setGeneratedUuids(text);
    onHistoryAdd?.(`Generated ${uuidCount} random UUIDs`, text);
  };

  const copyToClipboard = () => {
    if (!generatedUuids) return;
    navigator.clipboard.writeText(generatedUuids);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between p-3 rounded-2xl glass-panel">
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="uuid-count-select" className="text-neutral-600 dark:text-neutral-400 font-semibold">
            Generate Count:
          </label>
          <select
            id="uuid-count-select"
            value={uuidCount}
            onChange={(e) => setUuidCount(parseInt(e.target.value, 10))}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <option value={1}>1 UUID</option>
            <option value={5}>5 UUIDs</option>
            <option value={10}>10 UUIDs</option>
            <option value={20}>20 UUIDs</option>
            <option value={50}>50 UUIDs</option>
          </select>
        </div>
        <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">RFC 4122 v4 Compliant</span>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl transition shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        <span>Generate UUIDs</span>
        <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/15 text-neutral-900">
          Click or Enter
        </kbd>
      </button>

      {generatedUuids && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Generated Identifiers ({uuidCount})
            </span>
            <button
              type="button"
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Copy all generated UUIDs to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
          <textarea
            rows={Math.min(uuidCount + 2, 12)}
            readOnly
            value={generatedUuids}
            aria-label="Generated UUID list"
            className="w-full bg-neutral-100/70 dark:bg-[#0c0e14]/90 border border-neutral-200/70 dark:border-white/5 rounded-2xl p-4 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y leading-relaxed focus-visible:ring-2 focus-visible:ring-amber-500"
          />
        </div>
      )}
    </div>
  );
};
