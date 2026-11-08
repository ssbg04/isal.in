import React, { useState } from 'react';
import { Ruler, HardDrive, Clock, RotateCcw, Copy, Check } from 'lucide-react';
import {
  convertCssUnits,
  convertDataStorage,
  parseTimestampOrDate,
  type CssUnitResults,
  type DataUnitBreakdown,
  type TimestampResults,
} from '../../services/conversionService';

interface CssUnitsWorkspaceProps {
  onHistoryAdd?: (summary: string) => void;
}

export const CssUnitsWorkspace: React.FC<CssUnitsWorkspaceProps> = ({ onHistoryAdd }) => {
  const [subCategory, setSubCategory] = useState<'css' | 'storage' | 'time'>('css');

  // CSS Units State
  const [cssBaseSize, setCssBaseSize] = useState<number>(16);
  const [cssPx, setCssPx] = useState<number>(16);
  const [cssResults, setCssResults] = useState<CssUnitResults>(() => convertCssUnits(16, 'px', 16));

  // Storage State
  const [storageAmount, setStorageAmount] = useState<number>(1);
  const [storageUnit, setStorageUnit] = useState<
    'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'KiB' | 'MiB' | 'GiB' | 'TiB'
  >('GB');
  const [storageResults, setStorageResults] = useState<DataUnitBreakdown>(() =>
    convertDataStorage(1, 'GB')
  );

  // Time / Timestamp State
  const [timeInputVal, setTimeInputVal] = useState<string>(() =>
    String(Math.floor(Date.now() / 1000))
  );
  const [timeResults, setTimeResults] = useState<TimestampResults | null>(() =>
    parseTimestampOrDate(Math.floor(Date.now() / 1000))
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    onHistoryAdd?.(`Copied unit value: ${text}`);
  };

  return (
    <div className="mt-5 space-y-6">
      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
        <div className="inline-flex rounded-xl p-0.5 text-xs bg-neutral-100/60 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setSubCategory('css')}
            className={`px-3 py-1.5 rounded-lg font-medium transition inline-flex items-center gap-1.5 cursor-pointer ${
              subCategory === 'css'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>CSS Typography</span>
          </button>
          <button
            type="button"
            onClick={() => setSubCategory('storage')}
            className={`px-3 py-1.5 rounded-lg font-medium transition inline-flex items-center gap-1.5 cursor-pointer ${
              subCategory === 'storage'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Data Storage</span>
          </button>
          <button
            type="button"
            onClick={() => setSubCategory('time')}
            className={`px-3 py-1.5 rounded-lg font-medium transition inline-flex items-center gap-1.5 cursor-pointer ${
              subCategory === 'time'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Unix Timestamp</span>
          </button>
        </div>

        <span className="text-[11px] text-neutral-400 font-mono">
          Instant bi-directional calculation
        </span>
      </div>

      {/* Sub-tool 1: CSS Typography */}
      {subCategory === 'css' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="base-font-input" className="font-medium text-neutral-700 dark:text-neutral-300">
                Base Root Font Size (1rem):
              </label>
              <div className="inline-flex items-center gap-1">
                <input
                  id="base-font-input"
                  type="number"
                  min="1"
                  max="64"
                  value={cssBaseSize}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value) || 16);
                    setCssBaseSize(val);
                    setCssResults(convertCssUnits(cssPx, 'px', val));
                  }}
                  className="w-16 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-center outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <span className="font-mono text-neutral-400">px</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCssBaseSize(16);
                setCssResults(convertCssUnits(cssPx, 'px', 16));
              }}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
            >
              Reset to default (16px)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pixels (px) */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
              <label htmlFor="css-px-input" className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                Pixels (px)
              </label>
              <div className="relative">
                <input
                  id="css-px-input"
                  type="number"
                  step="any"
                  value={cssResults.px}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setCssPx(val);
                    setCssResults(convertCssUnits(val, 'px', cssBaseSize));
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">px</span>
              </div>
            </div>

            {/* Root EM (rem) */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
              <label htmlFor="css-rem-input" className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                Root EM (rem)
              </label>
              <div className="relative">
                <input
                  id="css-rem-input"
                  type="number"
                  step="any"
                  value={cssResults.rem}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setCssResults(convertCssUnits(val, 'rem', cssBaseSize));
                    setCssPx(val * cssBaseSize);
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">rem</span>
              </div>
            </div>

            {/* Relative EM (em) */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
              <label htmlFor="css-em-input" className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                Relative EM (em)
              </label>
              <div className="relative">
                <input
                  id="css-em-input"
                  type="number"
                  step="any"
                  value={cssResults.em}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setCssResults(convertCssUnits(val, 'em', cssBaseSize));
                    setCssPx(val * cssBaseSize);
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">em</span>
              </div>
            </div>

            {/* Points (pt) */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
              <label htmlFor="css-pt-input" className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                Points (pt)
              </label>
              <div className="relative">
                <input
                  id="css-pt-input"
                  type="number"
                  step="any"
                  value={cssResults.pt}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setCssResults(convertCssUnits(val, 'pt', cssBaseSize));
                    setCssPx((val * 96) / 72);
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">pt</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
              Quick Typography Scale Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map((pxVal) => {
                const remVal = (pxVal / cssBaseSize).toFixed(pxVal % cssBaseSize === 0 ? 0 : 3);
                const isCurrent = cssResults.px === pxVal;
                return (
                  <button
                    key={pxVal}
                    type="button"
                    onClick={() => {
                      setCssPx(pxVal);
                      setCssResults(convertCssUnits(pxVal, 'px', cssBaseSize));
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                      isCurrent
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-neutral-400 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>{pxVal}px</span>
                    <span className="text-[10px] opacity-70 ml-1">({remVal}rem)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snippet Card */}
          <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex items-center justify-between">
            <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
              <span className="text-amber-600 dark:text-amber-400">font-size:</span> {cssResults.rem}rem;{' '}
              <span className="text-neutral-400">/* {cssResults.px}px */</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`font-size: ${cssResults.rem}rem; /* ${cssResults.px}px */`, 'css-snippet')}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
            >
              {copiedKey === 'css-snippet' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'css-snippet' ? 'Copied' : 'Copy CSS'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-tool 2: Data Storage */}
      {subCategory === 'storage' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex flex-wrap items-center gap-3">
            <label htmlFor="storage-val-input" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Convert Data Value:
            </label>
            <input
              id="storage-val-input"
              type="number"
              min="0"
              step="any"
              value={storageAmount}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setStorageAmount(val);
                setStorageResults(convertDataStorage(val, storageUnit));
              }}
              className="w-36 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
            <select
              value={storageUnit}
              onChange={(e) => {
                const u = e.target.value as typeof storageUnit;
                setStorageUnit(u);
                setStorageResults(convertDataStorage(storageAmount, u));
              }}
              className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 font-mono text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <option value="B">Bytes (B)</option>
              <option value="KB">Kilobytes (KB - 1,000 B)</option>
              <option value="MB">Megabytes (MB - 1,000 KB)</option>
              <option value="GB">Gigabytes (GB - 1,000 MB)</option>
              <option value="TB">Terabytes (TB - 1,000 GB)</option>
              <option value="KiB">Kibibytes (KiB - 1,024 B)</option>
              <option value="MiB">Mebibytes (MiB - 1,024 KiB)</option>
              <option value="GiB">Gibibytes (GiB - 1,024 MiB)</option>
              <option value="TiB">Tebibytes (TiB - 1,024 GiB)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decimal SI */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Decimal Metric Units (Base 10)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">1 KB = 1,000 Bytes</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'bytes', label: 'Bytes (B)', val: storageResults.bytes },
                  { key: 'kb', label: 'Kilobytes (KB)', val: storageResults.kb },
                  { key: 'mb', label: 'Megabytes (MB)', val: storageResults.mb },
                  { key: 'gb', label: 'Gigabytes (GB)', val: storageResults.gb },
                  { key: 'tb', label: 'Terabytes (TB)', val: storageResults.tb },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs py-1">
                    <span className="text-neutral-500 font-mono">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.val.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(item.val), item.key)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                        aria-label={`Copy ${item.label}`}
                      >
                        {copiedKey === item.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Binary IEC */}
            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Binary IEC Units (Base 2)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">1 KiB = 1,024 Bytes</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'kib', label: 'Kibibytes (KiB)', val: storageResults.kib },
                  { key: 'mib', label: 'Mebibytes (MiB)', val: storageResults.mib },
                  { key: 'gib', label: 'Gibibytes (GiB)', val: storageResults.gib },
                  { key: 'tib', label: 'Tebibytes (TiB)', val: storageResults.tib },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs py-1">
                    <span className="text-neutral-500 font-mono">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.val.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(item.val), item.key)}
                        className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                        aria-label={`Copy ${item.label}`}
                      >
                        {copiedKey === item.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tool 3: Unix Timestamp */}
      {subCategory === 'time' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <label htmlFor="time-input-val" className="font-semibold text-neutral-800 dark:text-neutral-200">
                Unix Timestamp or ISO Date:
              </label>
              <button
                type="button"
                onClick={() => {
                  const nowSec = Math.floor(Date.now() / 1000);
                  setTimeInputVal(String(nowSec));
                  setTimeResults(parseTimestampOrDate(nowSec));
                }}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Set to Current Time (Now)</span>
              </button>
            </div>
            <input
              id="time-input-val"
              type="text"
              value={timeInputVal}
              onChange={(e) => {
                const val = e.target.value;
                setTimeInputVal(val);
                setTimeResults(parseTimestampOrDate(val));
              }}
              placeholder="Enter Unix seconds, milliseconds, or ISO date string (e.g. 1773919200)..."
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>

          {timeResults && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'sec', label: 'Epoch Seconds', val: String(timeResults.epochSeconds) },
                { key: 'ms', label: 'Epoch Milliseconds', val: String(timeResults.epochMs) },
                { key: 'iso', label: 'ISO 8601 (UTC)', val: timeResults.iso },
                { key: 'utc', label: 'UTC String', val: timeResults.utc },
                { key: 'local', label: 'Local Date & Time', val: timeResults.local },
                { key: 'relative', label: 'Relative Human Time', val: timeResults.relative },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-semibold block">
                      {item.label}
                    </span>
                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 break-all select-all">
                      {item.val}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.val, item.key)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0 cursor-pointer"
                    aria-label={`Copy ${item.label}`}
                  >
                    {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
