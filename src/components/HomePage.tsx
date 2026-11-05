import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  FileImage,
  FileText,
  Music,
  Video,
  ArrowRightLeft,
  Link,
  Hash,
  Palette,
  BookOpen,
  Table,
  Fingerprint,
  Ruler,
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
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
  ArrowRight,
  Shield,
  Cpu,
  WifiOff,
  Flame,
  Copy,
  Check,
  Upload,
  Sun,
} from 'lucide-react';
import type { ToolType } from '../services/conversionService';
import { parseNaturalLanguageConversion } from '../services/naturalLanguageService';
import { AdSlot } from './AdSlot';

export type Category = 'media' | 'developer' | 'security' | 'units' | 'calculators';

export interface ToolMeta {
  id: ToolType;
  title: string;
  category: Category;
  shortDesc: string;
  badge: string;
}

export interface PopularPreset {
  label: string;
  toolId: ToolType;
  description: string;
  targetFormat?: string;
  mode?: string;
}

const POPULAR_PRESETS: PopularPreset[] = [
  { label: 'PNG to WebP', toolId: 'image-convert', description: 'Convert & compress to WebP', targetFormat: 'image/webp' },
  { label: 'Images to PDF', toolId: 'images-to-pdf', description: 'Compile pictures into single PDF' },
  { label: 'JSON to YAML', toolId: 'json-yaml', description: 'Bi-directional serialization', mode: 'json-to-yaml' },
  { label: 'CSV to JSON', toolId: 'csv-json', description: 'Spreadsheets into JSON array' },
  { label: 'Base64 Encode', toolId: 'base64', description: 'Encode files or text strings' },
  { label: 'UUID Generator', toolId: 'uuid', description: 'Generate random v4 tokens' },
  { label: 'PH Income Tax', toolId: 'income-tax-ph', description: '2023+ TRAIN law salary take-home' },
  { label: 'SHA-256 Hash', toolId: 'hash-calc', description: 'File & text checksums' },
];

const QUICK_MATH_EXAMPLES = ['100 km to miles', '24px to rem', '70 kg to lbs', '500 MB to GB'];

const CATEGORY_NAMES: Record<Category, string> = {
  media: 'Image & Media',
  developer: 'Text & Data',
  security: 'Security & Encodings',
  units: 'Units & Measurements',
  calculators: 'Calculators & Finance',
};

const CATEGORY_ICON_STYLES: Record<Category, string> = {
  media: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40',
  developer: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 group-hover:bg-sky-500/20 group-hover:border-sky-500/40',
  security: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40',
  units: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 group-hover:bg-violet-500/20 group-hover:border-violet-500/40',
  calculators: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20 group-hover:border-rose-500/40',
};

const TOOL_FORMAT_PILLS: Record<ToolType, string> = {
  'image-convert': 'WEBP • AVIF • PNG • JPG',
  'images-to-pdf': 'JPG / PNG → PDF',
  'audio-convert': 'MP3 • WAV • OGG • TRIM',
  'video-convert': 'MP4 • WEBM • SCALE',
  'json-yaml': 'JSON ⇄ YAML',
  'base64': 'TEXT / FILE ⇄ B64',
  'url-encode': 'URI • QUERY PARAMS',
  'uuid': 'RFC 4122 v4 • BATCH',
  'color-convert': 'HEX • RGB • HSL • CMYK',
  'markdown-html': 'MD ⇄ HTML PREVIEW',
  'csv-json': 'CSV / TSV ⇄ JSON GRID',
  'hash-calc': 'SHA-256 • SHA-512 • MD5',
  'unit-convert': 'PX ⇄ REM • BYTES • EPOCH',
  'length-convert': 'M • KM • FT • IN • MI',
  'mass-convert': 'KG • G • LBS • OZ',
  'area-convert': 'SQM • HA • ACRE • SQFT',
  'volume-convert': 'L • ML • GAL • CUPS',
  'temperature-convert': '°C • °F • KELVIN',
  'speed-convert': 'KM/H • MPH • KNOTS',
  'time-convert': 'SEC • MIN • HR • DAYS',
  'number-system': 'BIN • HEX • DEC • ROMAN',
  'income-tax-ph': 'TRAIN 2023+ • SSS • BIR',
  'mortgage-calc': 'PAG-IBIG • BANK AMORT',
  'electricity-calc': 'MERALCO • SUB-METER kWh',
  'bmi-calc': 'WHO & ASIAN CUTOFFS',
  'gwa-calc': '1.00–5.00 • LATIN HONORS',
};

const PH_SPOTLIGHT_IDS: ToolType[] = [
  'income-tax-ph',
  'gwa-calc',
  'electricity-calc',
  'mortgage-calc',
];

const TOOL_ICONS: Record<ToolType, React.ComponentType<{ className?: string }>> = {
  'image-convert': FileImage,
  'images-to-pdf': FileText,
  'audio-convert': Music,
  'video-convert': Video,
  'json-yaml': ArrowRightLeft,
  'base64': Binary,
  'url-encode': Link,
  'uuid': Hash,
  'color-convert': Palette,
  'markdown-html': BookOpen,
  'csv-json': Table,
  'hash-calc': Fingerprint,
  'unit-convert': Ruler,
  'length-convert': Ruler,
  'mass-convert': Scale,
  'area-convert': Maximize2,
  'volume-convert': Box,
  'temperature-convert': Thermometer,
  'speed-convert': Gauge,
  'time-convert': Clock,
  'number-system': Binary,
  'income-tax-ph': Coins,
  'mortgage-calc': Home,
  'electricity-calc': Zap,
  'bmi-calc': Heart,
  'gwa-calc': GraduationCap,
};

const TOOL_TAGS: Record<ToolType, string[]> = {
  'image-convert': ['webp', 'png', 'jpg', 'jpeg', 'avif', 'bmp', 'ico', 'favicon', 'compress', 'resize', 'scale', 'dimension'],
  'images-to-pdf': ['pdf', 'document', 'compile', 'merge', 'photos to pdf', 'images to pdf'],
  'audio-convert': ['mp3', 'wav', 'ogg', 'webm', 'sound', 'music', 'volume', 'extract audio', 'trim'],
  'video-convert': ['mp4', 'webm', 'video', 'transcode', 'movie', 'compress video', 'mute', 'fps', 'snapshot'],
  'json-yaml': ['json', 'yaml', 'yml', 'json to yaml', 'yaml to json', 'serialize', 'beautify'],
  'base64': ['b64', 'base64', 'encode', 'decode', 'binary', 'ascii', 'data url'],
  'url-encode': ['url', 'uri', 'percent', 'query string', 'params', 'encode', 'decode'],
  'uuid': ['uuid', 'v4', 'guid', 'unique id', 'token', 'random'],
  'color-convert': ['hex', 'rgb', 'hsl', 'cmyk', 'color picker', 'palette'],
  'markdown-html': ['md', 'markdown', 'html', 'wysiwyg', 'render', 'preview'],
  'csv-json': ['csv', 'tsv', 'json', 'table', 'spreadsheet', 'excel to json', 'csv to json'],
  'hash-calc': ['hash', 'sha256', 'sha512', 'md5', 'checksum', 'digest', 'integrity'],
  'unit-convert': ['px', 'rem', 'css', 'bytes', 'mb', 'gb', 'epoch', 'timestamp', 'unix'],
  'length-convert': ['meter', 'kilometer', 'centimeter', 'inches', 'feet', 'yard', 'miles'],
  'mass-convert': ['kg', 'grams', 'lbs', 'pounds', 'ounces', 'stone', 'tons', 'weight'],
  'area-convert': ['sqm', 'square meter', 'hectare', 'acre', 'sqft', 'square feet', 'land'],
  'volume-convert': ['liters', 'ml', 'gallons', 'cups', 'fluid ounce', 'tablespoon'],
  'temperature-convert': ['celsius', 'fahrenheit', 'kelvin', 'temp'],
  'speed-convert': ['kmh', 'mph', 'knots', 'mach', 'speed', 'velocity'],
  'time-convert': ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
  'number-system': ['binary', 'hex', 'octal', 'decimal', 'roman numerals', 'radix', 'base'],
  'income-tax-ph': ['tax', 'salary', 'bir', 'train law', 'sss', 'philhealth', 'pagibig', 'take home', 'philippines'],
  'mortgage-calc': ['housing loan', 'pagibig loan', 'amortization', 'mortgage', 'monthly pay', 'bank loan'],
  'electricity-calc': ['meralco', 'submeter', 'kwh', 'electric bill', 'tenant bill', 'appliance cost'],
  'bmi-calc': ['bmi', 'body mass index', 'weight', 'health', 'asian bmi', 'ideal weight'],
  'gwa-calc': ['gwa', 'gpa', 'grades', 'college', 'latin honors', 'units', 'philippine college'],
};

interface HomePageProps {
  tools: ToolMeta[];
  onSelectTool: (toolId: ToolType, preset?: { targetFormat?: string; mode?: string }) => void;
  onDropFiles?: (files: File[]) => void;
  onOpenPrivacy: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  tools,
  onSelectTool,
  onDropFiles,
  onOpenPrivacy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickConversion = useMemo(() => parseNaturalLanguageConversion(searchQuery), [searchQuery]);

  const phTools = useMemo(
    () => PH_SPOTLIGHT_IDS.map((id) => tools.find((t) => t.id === id)).filter((t): t is ToolMeta => Boolean(t)),
    [tools]
  );

  const handleCopyQuick = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  const handleCardLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    toolId: ToolType,
    preset?: { targetFormat?: string; mode?: string }
  ) => {
    // Allow Ctrl/Cmd/Shift/Middle click to open in a new tab naturally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelectTool(toolId, preset);
  };

  const handleDropZoneFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList);
    if (onDropFiles) {
      onDropFiles(arr);
      return;
    }
    const first = arr[0];
    const name = first.name.toLowerCase();
    if (first.type.startsWith('image/')) onSelectTool('image-convert');
    else if (first.type.startsWith('audio/')) onSelectTool('audio-convert');
    else if (first.type.startsWith('video/')) onSelectTool('video-convert');
    else if (name.endsWith('.csv') || name.endsWith('.tsv')) onSelectTool('csv-json');
    else if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml')) onSelectTool('json-yaml');
    else if (name.endsWith('.md') || name.endsWith('.html')) onSelectTool('markdown-html');
    else onSelectTool('hash-calc');
  };

  // Global '/' keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter tools based on search query and category
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Query filter
      if (!q) return true;

      const titleMatch = tool.title.toLowerCase().includes(q);
      const descMatch = tool.shortDesc.toLowerCase().includes(q);
      const badgeMatch = tool.badge.toLowerCase().includes(q);
      const tags = TOOL_TAGS[tool.id] || [];
      const tagsMatch = tags.some((tag) => tag.includes(q) || q.includes(tag));

      return titleMatch || descMatch || badgeMatch || tagsMatch;
    });
  }, [tools, searchQuery, selectedCategory]);

  // Keep highlightedIndex in sync when search results change
  useEffect(() => {
    if (searchQuery.trim() && filteredTools.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [searchQuery, filteredTools.length]);

  // Scroll active result into view in the dropdown
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownListRef.current) {
      const activeEl = dropdownListRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Keyboard navigation for search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchQuery) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredTools.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredTools.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredTools.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools.length > 0) {
        const target = highlightedIndex >= 0 ? filteredTools[highlightedIndex] : filteredTools[0];
        if (target) {
          onSelectTool(target.id);
          setSearchQuery('');
          setHighlightedIndex(-1);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSearchQuery('');
      setHighlightedIndex(-1);
      searchInputRef.current?.blur();
    }
  };

  // Categories list with counts
  const categories: { id: Category | 'all'; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Tools', count: tools.length },
      { id: 'media', label: 'Image & Media', count: tools.filter((t) => t.category === 'media').length },
      { id: 'developer', label: 'Text & Data', count: tools.filter((t) => t.category === 'developer').length },
      { id: 'security', label: 'Security & Encodings', count: tools.filter((t) => t.category === 'security').length },
      { id: 'units', label: 'Units & Measurements', count: tools.filter((t) => t.category === 'units').length },
      { id: 'calculators', label: 'Calculators & Finance', count: tools.filter((t) => t.category === 'calculators').length },
    ];
  }, [tools]);

  return (
    <div
      className="w-full flex flex-col items-center"
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDraggingOver) setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDraggingOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        handleDropZoneFiles(e.dataTransfer.files);
      }}
    >
      {/* Full-window drag overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-6 pointer-events-none">
          <div className="max-w-md w-full rounded-3xl border-2 border-dashed border-amber-400 bg-amber-500/10 p-10 text-center space-y-3 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-lg font-extrabold text-white">Drop file to open the right converter</div>
            <p className="text-xs text-neutral-300">
              Images, audio, video, CSV, JSON, YAML, or Markdown — processed 100% locally in your browser.
            </p>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION: Streamlined Search + Instant Math + Quick File Drop */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-8 sm:pb-10 text-center flex flex-col items-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border mb-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-bold tracking-wide text-amber-700 dark:text-amber-400">ISALIN ANG LAHAT</span>
          <span className="w-1 h-1 rounded-full bg-amber-500/40" />
          <span className="text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            100% Local Browser Processing
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.1]">
          Convert files and data{' '}
          <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent">
            privately in your browser.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 max-w-2xl leading-relaxed">
          Images, audio, video, developer formats, unit measurements, and Philippine everyday calculators — <strong>zero server uploads</strong>.
        </p>

        {/* Primary Action: Universal Tool & Instant Conversion Search Box */}
        <div className="mt-6 sm:mt-8 w-full max-w-2xl relative">
          <div className="relative group shadow-xl shadow-black/5 dark:shadow-black/30 rounded-2xl">
            <Search className="w-5 h-5 text-neutral-500 dark:text-neutral-400 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              ref={searchInputRef}
              type="search"
              role="combobox"
              aria-expanded={Boolean(searchQuery)}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls="home-search-results"
              aria-activedescendant={
                highlightedIndex >= 0 && filteredTools[highlightedIndex]
                  ? `home-search-option-${filteredTools[highlightedIndex].id}`
                  : undefined
              }
              aria-label="Universal tool and instant conversion search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder='Search tools or type a conversion (e.g. "100 km to miles", "24px to rem", "webp")'
              className="w-full h-14 sm:h-15 pl-12 pr-28 rounded-2xl bg-background border-2 border-neutral-300/90 dark:border-white/15 focus:border-amber-500 dark:focus:border-amber-400 text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedIndex(-1);
                  }}
                  aria-label="Clear search input"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Pick a file (image, video, audio, CSV, JSON) to auto-open its converter"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Drop file</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    <kbd className="font-semibold text-neutral-800 dark:text-neutral-200">/</kbd>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                aria-label="Quick file picker for automatic tool selection"
                onChange={(e) => handleDropZoneFiles(e.target.files)}
              />
            </div>
          </div>

          {/* Instant Math / Conversion Hint Chips */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="font-medium">Try instant math:</span>
            {QUICK_MATH_EXAMPLES.map((expr) => (
              <button
                key={expr}
                type="button"
                onClick={() => {
                  setSearchQuery(expr);
                  searchInputRef.current?.focus();
                }}
                className="font-mono px-2 py-0.5 rounded-md bg-neutral-100/90 dark:bg-neutral-800/70 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-300 text-neutral-700 dark:text-neutral-300 border border-neutral-200/70 dark:border-white/5 transition cursor-pointer"
              >
                {expr}
              </button>
            ))}
          </div>

          {/* Instant Search Results Dropdown Preview (When Typing) */}
          {searchQuery && (
            <div
              ref={dropdownListRef}
              id="home-search-results"
              role="listbox"
              aria-label="Matching conversion tools"
              className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl glass-card border border-neutral-200 dark:border-white/10 z-30 shadow-2xl max-h-80 overflow-y-auto text-left"
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 pb-1.5 mb-1">
                <span>Matching Tools ({filteredTools.length})</span>
                <span className="text-[10px] font-normal lowercase flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                  <span>Use ↑↓ to navigate</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">• ↵ to open</span>
                </span>
              </div>

              {/* Natural Language Quick Calculation Card */}
              {quickConversion && (
                <div className="p-3 mb-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-sky-500/10 to-amber-500/10 border border-amber-500/30 text-xs shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Instant Conversion ({quickConversion.categoryName})</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold border border-amber-500/30">
                      ⚡ 0ms Engine
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-neutral-950 dark:text-white tabular-nums my-1 select-all">
                    {quickConversion.formattedOutput}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyQuick(quickConversion.outputValue)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-[11px] transition hover:opacity-90 active:scale-95 cursor-pointer shadow-2xs"
                    >
                      {copiedQuick ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedQuick ? 'Copied!' : 'Copy Result'}</span>
                    </button>
                    <a
                      href={`/${quickConversion.toolId}`}
                      onClick={(e) => {
                        handleCardLinkClick(e, quickConversion.toolId);
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-panel border border-neutral-300 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-[11px] transition cursor-pointer"
                    >
                      <span>Open Tool</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              {filteredTools.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-600 dark:text-neutral-300">
                  No direct tools found matching "{searchQuery}".
                  <div className="mt-1 text-neutral-500 dark:text-neutral-400">Try searching for <em>webp</em>, <em>pdf</em>, <em>csv</em>, <em>yaml</em>, or <em>tax</em>.</div>
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {filteredTools.map((t, idx) => {
                    const Icon = TOOL_ICONS[t.id] || FileImage;
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <a
                        key={t.id}
                        href={`/${t.id}`}
                        id={`home-search-option-${t.id}`}
                        role="option"
                        aria-selected={isHighlighted}
                        data-index={idx}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={(e) => {
                          handleCardLinkClick(e, t.id);
                          setSearchQuery('');
                          setHighlightedIndex(-1);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition cursor-pointer text-left focus-visible:outline-none ${
                          isHighlighted
                            ? 'bg-amber-500/15 dark:bg-amber-500/20 ring-1 ring-amber-500/50'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${CATEGORY_ICON_STYLES[t.category]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                              {t.title}
                            </div>
                            <div className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                              {t.shortDesc}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {t.badge}
                          </span>
                          <ArrowRight className={`w-3.5 h-3.5 transition ${isHighlighted ? 'text-amber-600 dark:text-amber-400 translate-x-0.5' : 'text-neutral-400'}`} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Quick Conversion Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Popular:
          </span>
          {POPULAR_PRESETS.map((preset) => (
            <a
              key={preset.label}
              href={`/${preset.toolId}`}
              onClick={(e) =>
                handleCardLinkClick(e, preset.toolId, {
                  targetFormat: preset.targetFormat,
                  mode: preset.mode,
                })
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-panel border border-neutral-300/80 dark:border-white/10 hover:border-amber-500/60 hover:text-amber-700 dark:hover:text-amber-300 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer text-xs font-medium focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title={preset.description}
            >
              <span>{preset.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* 2. PARA SA PINOY SPOTLIGHT: Differentiated Everyday PH Calculators */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-6" aria-label="Featured Philippine Calculators">
        <div className="rounded-2xl p-4 sm:p-5 glass-card border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-rose-500/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Sun className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Para sa Pinoy — Everyday Philippine Calculators
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                PH Built-in
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Updated for TRAIN Law, SSS/PhilHealth/Pag-IBIG, Meralco sub-meters & college GWA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {phTools.map((tool) => {
              const Icon = TOOL_ICONS[tool.id] || Coins;
              return (
                <a
                  key={tool.id}
                  href={`/${tool.id}`}
                  onClick={(e) => handleCardLinkClick(e, tool.id)}
                  className="group p-3.5 rounded-xl bg-background/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-white/10 hover:border-amber-500/60 transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-3 text-left shadcn-focus"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tool.title}
                      </h3>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {tool.shortDesc}
                    </p>
                    <span className="inline-block mt-1.5 text-[9px] font-mono font-semibold text-amber-700 dark:text-amber-400/90">
                      {TOOL_FORMAT_PILLS[tool.id]}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. EXPLORE TOOLS SECTION: Category Tabs & Color-Coded Semantic Cards */}
      <section id="explore-tools" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Complete Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white">
              All {tools.length} browser tools
            </h2>
          </div>

          {/* Quick Result Counter */}
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Showing <strong className="text-neutral-950 dark:text-white">{filteredTools.length}</strong> {filteredTools.length === 1 ? 'utility' : 'utilities'}
            {selectedCategory !== 'all' && <span> in {CATEGORY_NAMES[selectedCategory]}</span>}
          </div>
        </div>

        {/* Category Filter Pills (Wraps cleanly on mobile so no categories are hidden off-screen) */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 shadow-sm shadow-amber-500/20 font-bold'
                    : 'glass-panel border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-white/20'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-neutral-800 text-white dark:bg-amber-600/30 dark:text-neutral-950 font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Semantic <a> Tool Cards Grid with Category Tints & Concrete Format Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const Icon = TOOL_ICONS[tool.id] || FileImage;
            const isPopular = POPULAR_PRESETS.some((p) => p.toolId === tool.id);
            const iconStyle = CATEGORY_ICON_STYLES[tool.category];

            return (
              <a
                key={tool.id}
                href={`/${tool.id}`}
                onClick={(e) => handleCardLinkClick(e, tool.id)}
                className="group relative p-4 rounded-xl glass-card hover:border-amber-500/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left flex flex-col justify-between cursor-pointer min-h-[148px] shadcn-focus"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 ${iconStyle}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {tool.title}
                        </h3>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono font-medium block truncate">
                          {CATEGORY_NAMES[tool.category]}
                        </span>
                      </div>
                    </div>
                    {isPopular && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 mt-0.5">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Concise Description */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {tool.shortDesc}
                  </p>
                </div>

                {/* Card Footer: Concrete Format Specs & Action Chevron */}
                <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-white/5 truncate">
                    {TOOL_FORMAT_PILLS[tool.id] || tool.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-16 text-center rounded-3xl glass-card border border-neutral-200 dark:border-neutral-800">
            <Search className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              No matching tools found
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              We couldn't find any tool matching "{searchQuery}". Try clearing your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. SPONSOR BANNER (Placed below tool catalog so primary content comes first) */}
      <section className="w-full max-w-4xl px-4 py-2" aria-label="Sponsor Banner">
        <AdSlot placement="header" />
      </section>

      {/* 5. VALUE PILLARS: What is Isalin? Privacy & Architecture */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white">
            Designed for privacy, built for speed
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2">
            Traditional online converters upload your personal documents to remote servers. Isalin takes a fundamentally different approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              100% Processed on Your Device
            </h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Every operation executes locally inside your browser sandbox via WebAssembly and Canvas APIs. Your files, photos, and secrets are never sent across the internet.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Instant Processing & No Queue
            </h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              No waiting in server queues, no file upload bandwidth bottlenecks, and zero artificial conversion countdown timers. Fast, direct, hardware-accelerated processing.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <WifiOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Offline Capable PWA
            </h3>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Install Isalin as a desktop or mobile application. Once loaded, all converters and utilities remain completely functional without an active internet connection.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-md px-1"
          >
            <span>Learn more about our client-side architecture & security practices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
