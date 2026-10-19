import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Hash,
  Binary,
  Code,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { parseNumberSystem } from '../../services/unitConversionService';

export const NumberSystemConverter: React.FC = () => {
  const [activeBase, setActiveBase] = useState<'10' | '2' | '16' | '8'>('10');
  const [inputValue, setInputValue] = useState<string>('255');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(() => {
    return parseNumberSystem(inputValue, activeBase);
  }, [inputValue, activeBase]);

  const handleCopy = (text: string, key: string) => {
    if (!text || text.startsWith('N/A') || text.startsWith('Non-printable')) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFieldChange = (val: string, base: '10' | '2' | '16' | '8') => {
    setActiveBase(base);
    setInputValue(val);
  };

  // Group binary string into 4-bit nibbles for readability
  const formattedBinary = useMemo(() => {
    if (!result.binary || !result.isValid) return result.binary;
    const isNegative = result.binary.startsWith('-');
    const digits = isNegative ? result.binary.slice(1) : result.binary;
    const padded = digits.padStart(Math.ceil(digits.length / 4) * 4 || 4, '0');
    const grouped = padded.match(/.{1,4}/g)?.join(' ') || digits;
    return (isNegative ? '-' : '') + grouped;
  }, [result.binary, result.isValid]);

  return (
    <div className="space-y-6">
      {/* Header and Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Binary className="w-4 h-4 text-sky-400" />
            <span>Multi-Base Radix & Number System Engine</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time bidirectional conversion across Decimal, Binary, Hexadecimal, Octal, ASCII & Roman numerals.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500">Presets:</span>
          {[
            { label: '42', val: '42', base: '10' as const },
            { label: '255 (0xFF)', val: '255', base: '10' as const },
            { label: '1024 (1K)', val: '1024', base: '10' as const },
            { label: '65535 (16-bit)', val: '65535', base: '10' as const },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleFieldChange(item.val, item.base)}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Validation alert if invalid */}
      {!result.isValid && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error || 'Invalid number format for selected base'}</span>
        </div>
      )}

      {/* Primary Bases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decimal */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeBase === '10'
              ? 'bg-neutral-900/90 border-sky-500/50 shadow-md shadow-sky-500/5'
              : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-sky-400" />
              <span>Decimal (Base 10)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                0-9
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.decimal, 'dec')}
                className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Copy decimal"
              >
                {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={activeBase === '10' ? inputValue : result.decimal}
            onChange={(e) => handleFieldChange(e.target.value, '10')}
            placeholder="e.g. 255"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Binary */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeBase === '2'
              ? 'bg-neutral-900/90 border-sky-500/50 shadow-md shadow-sky-500/5'
              : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Binary className="w-3.5 h-3.5 text-emerald-400" />
              <span>Binary (Base 2)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                0, 1
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.binary, 'bin')}
                className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Copy binary"
              >
                {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={activeBase === '2' ? inputValue : result.binary}
            onChange={(e) => handleFieldChange(e.target.value, '2')}
            placeholder="e.g. 11111111"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-base focus:outline-none focus:border-sky-500"
          />
          {result.binary && (
            <div className="text-[11px] font-mono text-neutral-500 mt-1 truncate">
              Nibbles: <span className="text-neutral-300">{formattedBinary}</span> ({result.bitLength} bits)
            </div>
          )}
        </div>

        {/* Hexadecimal */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeBase === '16'
              ? 'bg-neutral-900/90 border-sky-500/50 shadow-md shadow-sky-500/5'
              : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>Hexadecimal (Base 16)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                0-9, A-F
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.hexadecimal, 'hex')}
                className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Copy hex"
              >
                {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={activeBase === '16' ? inputValue : result.hexadecimal}
            onChange={(e) => handleFieldChange(e.target.value, '16')}
            placeholder="e.g. FF"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono text-base focus:outline-none focus:border-sky-500"
          />
          {result.hexadecimal && (
            <div className="text-[11px] font-mono text-neutral-500 mt-1 truncate">
              Prefix notation: <span className="text-neutral-300">0x{result.hexadecimal}</span>
            </div>
          )}
        </div>

        {/* Octal */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            activeBase === '8'
              ? 'bg-neutral-900/90 border-sky-500/50 shadow-md shadow-sky-500/5'
              : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Octal (Base 8)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                0-7
              </span>
              <button
                type="button"
                onClick={() => handleCopy(result.octal, 'oct')}
                className="p-1 rounded text-neutral-400 hover:text-neutral-100 transition-colors"
                title="Copy octal"
              >
                {copiedKey === 'oct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={activeBase === '8' ? inputValue : result.octal}
            onChange={(e) => handleFieldChange(e.target.value, '8')}
            placeholder="e.g. 377"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-purple-400 font-mono text-base focus:outline-none focus:border-sky-500"
          />
          {result.octal && (
            <div className="text-[11px] font-mono text-neutral-500 mt-1 truncate">
              Prefix notation: <span className="text-neutral-300">0o{result.octal}</span>
            </div>
          )}
        </div>
      </div>

      {/* Auxiliary Systems: ASCII & Roman Numerals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ASCII Character */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              ASCII Representation
            </div>
            <div className="text-base font-mono font-medium text-neutral-100 mt-1">
              {result.ascii || '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(result.ascii, 'ascii')}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            {copiedKey === 'ascii' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Roman Numeral */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Roman Numeral</span>
            </div>
            <div className="text-base font-mono font-bold text-amber-300 mt-1">
              {result.roman || '—'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(result.roman, 'roman')}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            {copiedKey === 'roman' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
