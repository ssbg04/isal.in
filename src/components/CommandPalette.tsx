import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  FileImage,
  FileText,
  Code2,
  ArrowRightLeft,
  Link,
  Hash,
  Palette,
  BookOpen,
  Table,
  Fingerprint,
  Ruler,
  CornerDownLeft,
  Sparkles,
  Clipboard,
  Scale,
  Maximize2,
  Box,
  Thermometer,
  Gauge,
  Clock,
  Binary,
  Coins,
  Home,
  Zap,
  Heart,
  GraduationCap,
  Music,
  Video,
} from 'lucide-react';
import type { ToolType } from '../services/conversionService';

export interface ToolMeta {
  id: ToolType;
  title: string;
  category: 'media' | 'developer' | 'security' | 'units' | 'calculators';
  shortDesc: string;
  badge: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolMeta[];
  onSelectTool: (toolId: ToolType, initialInput?: string) => void;
}

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
  'image-convert': <FileImage className="w-4 h-4 text-amber-500" />,
  'images-to-pdf': <FileText className="w-4 h-4 text-rose-500" />,
  'audio-convert': <Music className="w-4 h-4 text-amber-500" />,
  'video-convert': <Video className="w-4 h-4 text-rose-500" />,
  'json-yaml': <Code2 className="w-4 h-4 text-sky-500" />,
  'base64': <ArrowRightLeft className="w-4 h-4 text-emerald-500" />,
  'url-encode': <Link className="w-4 h-4 text-blue-500" />,
  'uuid': <Hash className="w-4 h-4 text-purple-500" />,
  'color-convert': <Palette className="w-4 h-4 text-pink-500" />,
  'markdown-html': <BookOpen className="w-4 h-4 text-indigo-500" />,
  'csv-json': <Table className="w-4 h-4 text-emerald-500" />,
  'hash-calc': <Fingerprint className="w-4 h-4 text-teal-500" />,
  'unit-convert': <Ruler className="w-4 h-4 text-cyan-500" />,
  'length-convert': <Ruler className="w-4 h-4 text-sky-500" />,
  'mass-convert': <Scale className="w-4 h-4 text-amber-500" />,
  'area-convert': <Maximize2 className="w-4 h-4 text-emerald-500" />,
  'volume-convert': <Box className="w-4 h-4 text-blue-500" />,
  'temperature-convert': <Thermometer className="w-4 h-4 text-rose-500" />,
  'speed-convert': <Gauge className="w-4 h-4 text-purple-500" />,
  'time-convert': <Clock className="w-4 h-4 text-cyan-500" />,
  'number-system': <Binary className="w-4 h-4 text-teal-500" />,
  'income-tax-ph': <Coins className="w-4 h-4 text-emerald-500" />,
  'mortgage-calc': <Home className="w-4 h-4 text-sky-500" />,
  'electricity-calc': <Zap className="w-4 h-4 text-amber-500" />,
  'bmi-calc': <Heart className="w-4 h-4 text-rose-500" />,
  'gwa-calc': <GraduationCap className="w-4 h-4 text-indigo-500" />,
};

const TOOL_ALIASES: Record<ToolType, string[]> = {
  'image-convert': ['webp', 'png', 'jpg', 'jpeg', 'avif', 'bmp', 'ico', 'favicon', 'gif', 'resize', 'dimensions', 'compress', 'scale'],
  'images-to-pdf': ['pdf', 'doc', 'compile', 'merge', 'pages', 'document', 'booklet'],
  'audio-convert': ['audio', 'music', 'sound', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'volume', 'trim', 'extract audio'],
  'video-convert': ['video', 'movie', 'clip', 'mp4', 'webm', 'mov', 'mkv', 'transcode', 'compress', 'snapshot', 'frame'],
  'json-yaml': ['json', 'yaml', 'yml', 'format', 'beautify', 'minify', 'syntax', 'serialize'],
  'base64': ['b64', 'base64', 'encode', 'decode', 'binary', 'ascii', 'data url'],
  'url-encode': ['url', 'uri', 'percent', 'query string', 'escape', 'unescape', 'params'],
  'uuid': ['uuid', 'v4', 'guid', 'identifier', 'random', 'token', 'rfc4122'],
  'color-convert': ['color', 'hex', 'rgb', 'hsl', 'cmyk', 'picker', 'swatch', 'palette'],
  'markdown-html': ['markdown', 'md', 'html', 'preview', 'rich text', 'markup'],
  'csv-json': ['csv', 'tsv', 'tab', 'excel', 'table', 'spreadsheet', 'array'],
  'hash-calc': ['hash', 'sha256', 'sha512', 'md5', 'checksum', 'integrity', 'crypto'],
  'unit-convert': ['unit', 'rem', 'px', 'css', 'byte', 'mb', 'gb', 'tb', 'epoch', 'timestamp', 'time'],
  'length-convert': ['length', 'distance', 'meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'feet', 'yard', 'mile', 'nautical'],
  'mass-convert': ['mass', 'weight', 'kilogram', 'gram', 'pound', 'lb', 'ounce', 'oz', 'ton', 'stone'],
  'area-convert': ['area', 'sqm', 'square meter', 'hectare', 'acre', 'sqft', 'square foot', 'land'],
  'volume-convert': ['volume', 'capacity', 'liter', 'milliliter', 'gallon', 'cup', 'fluid ounce', 'tablespoon', 'teaspoon', 'cubic'],
  'temperature-convert': ['temperature', 'temp', 'celsius', 'fahrenheit', 'kelvin', 'rankine', 'weather'],
  'speed-convert': ['speed', 'velocity', 'kmh', 'mph', 'knot', 'mach', 'fast'],
  'time-convert': ['time', 'duration', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
  'number-system': ['number', 'binary', 'hex', 'hexadecimal', 'octal', 'decimal', 'radix', 'base', 'ascii', 'roman', 'nibble'],
  'income-tax-ph': ['tax', 'income tax', 'philippines', 'train law', 'salary', 'payslip', 'sss', 'philhealth', 'pagibig', 'withholding', 'take home pay', 'bir'],
  'mortgage-calc': ['mortgage', 'loan', 'housing', 'amortization', 'pagibig', 'bank loan', 'interest', 'real estate', 'monthly payment'],
  'electricity-calc': ['electricity', 'submeter', 'meralco', 'electric bill', 'kwh', 'appliance', 'aircon', 'tenant', 'splitter', 'wattage'],
  'bmi-calc': ['bmi', 'body mass index', 'health', 'weight', 'height', 'obese', 'underweight', 'overweight', 'fitness'],
  'gwa-calc': ['gwa', 'gpa', 'grade', 'philippines', 'college', 'university', 'latin honors', 'summa cum laude', 'magna', 'cum laude', 'deans list', 'ched', 'up'],
};

interface ClipboardDetection {
  targetTool: ToolType;
  label: string;
  snippet: string;
  rawText: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [clipboardData, setClipboardData] = useState<ClipboardDetection | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus search input and detect clipboard on open
  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 20);

      // Inspect clipboard for smart auto-routing
      if (navigator.clipboard?.readText) {
        navigator.clipboard
          .readText()
          .then((text) => {
            const trimmed = text.trim();
            if (!trimmed || trimmed.length > 50000) {
              setClipboardData(null);
              return;
            }

            // Check JSON
            if (
              (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
              (trimmed.startsWith('[') && trimmed.endsWith(']'))
            ) {
              try {
                JSON.parse(trimmed);
                setClipboardData({
                  targetTool: 'json-yaml',
                  label: 'JSON detected in clipboard',
                  snippet: trimmed.slice(0, 48) + (trimmed.length > 48 ? '...' : ''),
                  rawText: trimmed,
                });
                return;
              } catch {
                // Not valid JSON
              }
            }

            // Check URL
            if (/^https?:\/\//i.test(trimmed)) {
              setClipboardData({
                targetTool: 'url-encode',
                label: 'URL detected in clipboard',
                snippet: trimmed.slice(0, 48) + (trimmed.length > 48 ? '...' : ''),
                rawText: trimmed,
              });
              return;
            }

            // Check Hex / RGB Color
            if (/^#([0-9a-fA-F]{3,8})$/i.test(trimmed) || /^rgba?\(.+?\)$/i.test(trimmed)) {
              setClipboardData({
                targetTool: 'color-convert',
                label: 'Color code detected in clipboard',
                snippet: trimmed,
                rawText: trimmed,
              });
              return;
            }

            // Check Base64
            if (/^[A-Za-z0-9+/=]{24,}$/.test(trimmed) && !trimmed.includes(' ')) {
              setClipboardData({
                targetTool: 'base64',
                label: 'Base64 string detected in clipboard',
                snippet: trimmed.slice(0, 40) + '...',
                rawText: trimmed,
              });
              return;
            }

            setClipboardData(null);
          })
          .catch(() => {
            setClipboardData(null);
          });
      }

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  // Filter tools based on query & aliases
  const filteredTools = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase().trim();

    return tools.filter((tool) => {
      const matchTitle = tool.title.toLowerCase().includes(q);
      const matchDesc = tool.shortDesc.toLowerCase().includes(q);
      const matchBadge = tool.badge.toLowerCase().includes(q);
      const aliases = TOOL_ALIASES[tool.id] || [];
      const matchAlias = aliases.some((a) => a.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchBadge || matchAlias;
    });
  }, [query, tools]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredTools.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(filteredTools.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          onSelectTool(filteredTools[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onClose, onSelectTool]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Backdrop overlay dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Palette Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette and quick tool switcher"
        className="w-full max-w-xl bg-white/95 dark:bg-[#0c0e14]/95 border border-neutral-200/90 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-card flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150 relative"
      >
        {/* Glowing top line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-neutral-200/80 dark:border-white/10">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={filteredTools[selectedIndex] ? `cmd-item-${filteredTools[selectedIndex].id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools or features... (e.g. JSON, WebP, base64, hash, rem)"
            className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Smart Clipboard Quick Banner */}
        {clipboardData && !query && (
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {clipboardData.label}:
                </span>{' '}
                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                  {clipboardData.snippet}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectTool(clipboardData.targetTool, clipboardData.rawText);
                onClose();
              }}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] transition cursor-pointer shadow-xs"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste & Open</span>
            </button>
          </div>
        )}

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          id="command-palette-results"
          role="listbox"
          aria-label="Tool search results"
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1"
        >
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 space-y-1">
              <p className="font-medium text-neutral-600 dark:text-neutral-300">No matching tools found</p>
              <p>Try searching for keywords like "resize", "yaml", "base64", or "epoch"</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={tool.id}
                  id={`cmd-item-${tool.id}`}
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected ? 'true' : 'false'}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 shadow-xs'
                      : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-white dark:bg-neutral-900 border-amber-500/40 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200/80 dark:border-white/5'
                      }`}
                    >
                      {TOOL_ICONS[tool.id]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                          {tool.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/70 dark:border-white/5 uppercase">
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {tool.shortDesc}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 shrink-0 pl-2">
                      <span>Open</span>
                      <CornerDownLeft className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200/70 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono">
                ↑↓
              </kbd>{' '}
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono">
                ↵
              </kbd>{' '}
              select
            </span>
          </div>
          <span className="text-[10px] font-mono">Multi-Converter Fast Nav</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
