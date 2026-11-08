import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, UploadCloud, ShieldCheck, Check, Copy, AlertCircle } from 'lucide-react';
import { computeAllHashes, type HashResult } from '../../services/conversionService';

interface HashCalculatorWorkspaceProps {
  onHistoryAdd?: (summary: string) => void;
}

export const HashCalculatorWorkspace: React.FC<HashCalculatorWorkspaceProps> = ({ onHistoryAdd }) => {
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState<string>('Hello, Isalin Multi-Converter!');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [verifyInput, setVerifyInput] = useState<string>('');
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute hashes for text input
  useEffect(() => {
    if (sourceType === 'text') {
      const timer = setTimeout(() => {
        computeAllHashes(textInput)
          .then((res) => {
            setHashResult(res);
            onHistoryAdd?.(`Hash (text): ${textInput.slice(0, 30)}`);
          })
          .catch(() => {});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [textInput, sourceType, onHistoryAdd]);

  const handleFileSelect = async (f: File) => {
    setFileInput(f);
    setIsHashing(true);
    try {
      const buffer = await f.arrayBuffer();
      const res = await computeAllHashes(buffer);
      setHashResult(res);
      onHistoryAdd?.(`Hash (file): ${f.name}`);
    } catch {
      // Ignore hash calculation error
    } finally {
      setIsHashing(false);
    }
  };

  const copyHash = (val: string, algoKey: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedAlgo(algoKey);
    setTimeout(() => setCopiedAlgo(null), 2000);
  };

  return (
    <div className="mt-5 space-y-4">
      {/* Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
        <div className="inline-flex rounded-xl p-0.5 text-xs bg-neutral-100/60 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setSourceType('text')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              sourceType === 'text'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Text String
          </button>
          <button
            type="button"
            onClick={() => setSourceType('file')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              sourceType === 'file'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            File Binary
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>UPPERCASE</span>
          </label>
          {sourceType === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileSelect(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Choose File</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {sourceType === 'text' ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <label htmlFor="hash-input-text" className="font-mono uppercase tracking-wider text-[10px]">
              Input Text String (UTF-8)
            </label>
            <span className="font-mono text-[10px]">{textInput.length} chars</span>
          </div>
          <textarea
            id="hash-input-text"
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type or paste text to compute hashes in real-time..."
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition resize-y"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Select file to compute checksum"
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 rounded-2xl p-6 text-center cursor-pointer transition bg-white/40 dark:bg-neutral-900/30 flex flex-col items-center justify-center min-h-[140px] focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
        >
          <Fingerprint className="w-8 h-8 text-neutral-400 mb-2" />
          {fileInput ? (
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{fileInput.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {(fileInput.size / (1024 * 1024)).toFixed(2)} MB • {fileInput.type || 'Binary Document'}
              </p>
              {isHashing && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 animate-pulse">
                  Computing cryptographic digests locally in sandbox...
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Click to select or drag and drop any file to compute its checksum
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                Executables, disk images, archives, docs (100% in-browser, zero server uploads)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Verification Bar */}
      <div className="space-y-1.5 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="hash-verify-input" className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verify Against Expected Checksum
          </label>
          {verifyInput.trim() && (
            <span className="text-[11px] font-mono">
              {(() => {
                if (!hashResult) return null;
                const cleanTarget = verifyInput.trim().toLowerCase();
                const matches = (Object.keys(hashResult) as (keyof HashResult)[]).filter(
                  (k) => hashResult[k].toLowerCase() === cleanTarget
                );
                if (matches.length > 0) {
                  return (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Match Verified: {matches.map((m) => m.toUpperCase()).join(', ')}
                    </span>
                  );
                }
                return (
                  <span className="text-rose-500 dark:text-rose-400 font-medium inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No hash match detected
                  </span>
                );
              })()}
            </span>
          )}
        </div>
        <input
          id="hash-verify-input"
          type="text"
          value={verifyInput}
          onChange={(e) => setVerifyInput(e.target.value)}
          placeholder="Paste expected checksum here to verify integrity (e.g. from software release author)..."
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
        />
      </div>

      {/* Hashes Output Grid */}
      <div className="space-y-3">
        {[
          { key: 'sha256' as const, label: 'SHA-256', badge: 'Standard / Recommended' },
          { key: 'sha512' as const, label: 'SHA-512', badge: 'High Security' },
          { key: 'sha384' as const, label: 'SHA-384', badge: 'Intermediate' },
          { key: 'sha1' as const, label: 'SHA-1', badge: 'Legacy / Git' },
          { key: 'md5' as const, label: 'MD5', badge: 'Legacy Checksum' },
        ].map((algo) => {
          const rawVal = hashResult ? hashResult[algo.key] : '';
          const displayVal = uppercase ? rawVal.toUpperCase() : rawVal;
          const isMatched =
            verifyInput.trim() && rawVal && rawVal.toLowerCase() === verifyInput.trim().toLowerCase();

          return (
            <div
              key={algo.key}
              className={`p-3.5 rounded-xl border transition-all ${
                isMatched
                  ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : 'border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                    {algo.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-sans px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                    {algo.badge}
                  </span>
                  {isMatched && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15">
                      Verified Match
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!displayVal}
                  onClick={() => copyHash(displayVal, algo.key)}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium disabled:opacity-40 cursor-pointer"
                  aria-label={`Copy ${algo.label} checksum`}
                >
                  {copiedAlgo === algo.key ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-mono text-xs break-all text-neutral-700 dark:text-neutral-300 select-all">
                {displayVal || <span className="text-neutral-400 dark:text-neutral-600">Waiting for input...</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
