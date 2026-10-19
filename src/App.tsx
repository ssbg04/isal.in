import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FileImage,
  FileText,
  Code2,
  ArrowRightLeft,
  Link,
  Hash,
  UploadCloud,
  Check,
  Copy,
  Download,
  AlertCircle,
  Sun,
  Moon,
  Shield,
  ChevronRight,
  RotateCcw,
  Share2,
  DownloadCloud,
  WifiOff,
  Palette,
  BookOpen,
  Search,
  X,
  Table,
  Fingerprint,
  ShieldCheck,
  Ruler,
  HardDrive,
  Clock,
  Scale,
  Maximize2,
  Box,
  Thermometer,
  Gauge,
  Binary,
  Coins,
  Home,
  Zap,
  Heart,
  GraduationCap,
  Music,
  Video,
  Mail,
  ArrowLeft,
  ChevronDown,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { HomePage } from './components/HomePage';
import { ConversionStateIndicator } from './components/ConversionStateIndicator';
import { AdSlot } from './components/AdSlot';
import { CategoryFilter } from './components/CategoryFilter';
import { PrivacyModal } from './components/PrivacyModal';
import { BrandLogo } from './components/BrandLogo';
import { ImageCompareSlider } from './components/ImageCompareSlider';
import { DualPaneCodeWorkspace } from './components/DualPaneCodeWorkspace';
import { CommandPalette } from './components/CommandPalette';
import {
  HistoryPresetsDrawer,
  type HistoryItem,
  type PresetWorkflow,
} from './components/HistoryPresetsDrawer';
import { BatchQueueManager } from './components/BatchQueueManager';
import { UnitConverterTool } from './components/tools/UnitConverterTool';
import { NumberSystemConverter } from './components/tools/NumberSystemConverter';
import { PhilippineTaxCalculator } from './components/tools/PhilippineTaxCalculator';
import { MortgageCalculator } from './components/tools/MortgageCalculator';
import { ElectricityCalculator } from './components/tools/ElectricityCalculator';
import { BmiCalculator } from './components/tools/BmiCalculator';
import { PhilippineGwaCalculator } from './components/tools/PhilippineGwaCalculator';
import { AudioConverterTool } from './components/tools/AudioConverterTool';
import { VideoConverterTool } from './components/tools/VideoConverterTool';
import type { SupportedImageFormat } from './services/imageFormatsService';
import type {
  ToolType,
  ConversionResult,
  ColorFormats,
  CsvParseResult,
  HashResult,
  CssUnitResults,
  DataUnitBreakdown,
  TimestampResults,
} from './services/conversionService';
import {
  convertImage,
  convertImagesToPdf,
  convertJsonYaml,
  processBase64,
  processUrlEncode,
  generateUUIDs,
  createZipArchive,
  parseColor,
  markdownToHtml,
  htmlToMarkdown,
  parseCsv,
  jsonToCsv,
  computeAllHashes,
  convertCssUnits,
  convertDataStorage,
  parseTimestampOrDate,
} from './services/conversionService';
import { APP_LIMITS } from './config/limits';

type Category = 'media' | 'developer' | 'security' | 'units' | 'calculators';

interface ToolMeta {
  id: ToolType;
  title: string;
  category: Category;
  shortDesc: string;
  badge: string;
}

const TOOLS: ToolMeta[] = [
  {
    id: 'image-convert',
    title: 'Image Converter & Resizer',
    category: 'media',
    shortDesc: 'WebP, PNG, JPG, AVIF, BMP, ICO with compression & dimensions',
    badge: 'Media',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF Document',
    category: 'media',
    shortDesc: 'Bundle multiple pictures into a single organized PDF',
    badge: 'Media',
  },
  {
    id: 'audio-convert',
    title: 'Audio Converter & Extractor',
    category: 'media',
    shortDesc: 'MP3, WAV, WebM, OGG with volume boost, trimming & video extraction',
    badge: 'Audio',
  },
  {
    id: 'video-convert',
    title: 'Video Converter & Transcoder',
    category: 'media',
    shortDesc: 'MP4, WebM transcoding, resolution scaling, muting & frame snapshots',
    badge: 'Video',
  },
  {
    id: 'json-yaml',
    title: 'JSON ⇄ YAML Transformer',
    category: 'developer',
    shortDesc: 'Bi-directional serialization parsing and syntax formatting',
    badge: 'Data',
  },
  {
    id: 'base64',
    title: 'Base64 Encoder / Decoder',
    category: 'security',
    shortDesc: 'Safely encode binary or text representations',
    badge: 'Encoding',
  },
  {
    id: 'url-encode',
    title: 'URL Percent Encoder',
    category: 'developer',
    shortDesc: 'Query param escaping & URI string decoding',
    badge: 'Web',
  },
  {
    id: 'uuid',
    title: 'UUID v4 Identifier Generator',
    category: 'developer',
    shortDesc: 'Cryptographically secure standard random tokens',
    badge: 'Crypto',
  },
  {
    id: 'color-convert',
    title: 'Color Format Converter',
    category: 'developer',
    shortDesc: 'Instant bidirectional HEX, RGB, HSL, and CMYK with visual color picker',
    badge: 'Design',
  },
  {
    id: 'markdown-html',
    title: 'Markdown ⇄ HTML Live Editor',
    category: 'developer',
    shortDesc: 'Live bidirectional Markdown and rendered HTML with syntax formatting',
    badge: 'Text',
  },
  {
    id: 'csv-json',
    title: 'CSV ⇄ JSON & Data Table',
    category: 'developer',
    shortDesc: 'Parse CSV/TSV spreadsheets into JSON arrays with interactive data table & delimiter choices',
    badge: 'Data',
  },
  {
    id: 'hash-calc',
    title: 'Cryptographic Hash & Checksum',
    category: 'security',
    shortDesc: 'Compute SHA-256, SHA-512, MD5, and verify file or text integrity checksums',
    badge: 'Crypto',
  },
  {
    id: 'unit-convert',
    title: 'CSS & Dev Unit Converter',
    category: 'developer',
    shortDesc: 'CSS px ⇄ rem typography, byte storage scaling, and Unix epoch timestamp decoder',
    badge: 'Utility',
  },
  // Measurement & Unit Converters
  {
    id: 'length-convert',
    title: 'Length & Distance Converter',
    category: 'units',
    shortDesc: 'Meters, kilometers, centimeters, feet, inches, yards, and nautical miles',
    badge: 'Units',
  },
  {
    id: 'mass-convert',
    title: 'Mass & Weight Converter',
    category: 'units',
    shortDesc: 'Kilograms, grams, pounds (lbs), ounces, stones, and metric tons',
    badge: 'Units',
  },
  {
    id: 'area-convert',
    title: 'Area & Land Converter',
    category: 'units',
    shortDesc: 'Square meters, hectares, acres, square feet, and square kilometers',
    badge: 'Units',
  },
  {
    id: 'volume-convert',
    title: 'Volume & Capacity Converter',
    category: 'units',
    shortDesc: 'Liters, milliliters, US/Imperial gallons, cups, tablespoons, and cubic meters',
    badge: 'Units',
  },
  {
    id: 'temperature-convert',
    title: 'Temperature Converter',
    category: 'units',
    shortDesc: 'Celsius, Fahrenheit, Kelvin, and Rankine thermal scales',
    badge: 'Physics',
  },
  {
    id: 'speed-convert',
    title: 'Speed & Velocity Converter',
    category: 'units',
    shortDesc: 'km/h, mph, m/s, knots, ft/s, and Mach speed calculations',
    badge: 'Physics',
  },
  {
    id: 'time-convert',
    title: 'Time & Duration Converter',
    category: 'units',
    shortDesc: 'Seconds, minutes, hours, days, weeks, months, and years',
    badge: 'Time',
  },
  {
    id: 'number-system',
    title: 'Numerical System & Radix',
    category: 'units',
    shortDesc: 'Decimal, Binary nibbles, Hexadecimal, Octal, ASCII, and Roman numerals',
    badge: 'Math',
  },
  // Everyday & Philippine Calculators
  {
    id: 'income-tax-ph',
    title: 'Philippine Income Tax & Salary',
    category: 'calculators',
    shortDesc: 'TRAIN Law 2023+ revised brackets, SSS, PhilHealth, Pag-IBIG & take-home pay',
    badge: 'PH Tax',
  },
  {
    id: 'mortgage-calc',
    title: 'Mortgage & Loan Calculator',
    category: 'calculators',
    shortDesc: 'Pag-IBIG & bank housing loans, monthly amortization and payment schedule',
    badge: 'Finance',
  },
  {
    id: 'electricity-calc',
    title: 'Electricity & Sub-Meter Splitter',
    category: 'calculators',
    shortDesc: 'Apartment/tenant sub-meter bill calculation, effective kWh rate, & appliance costs',
    badge: 'Utility',
  },
  {
    id: 'bmi-calc',
    title: 'BMI & Body Health Calculator',
    category: 'calculators',
    shortDesc: 'Metric & Imperial Body Mass Index with Asian/WHO thresholds and ideal weight',
    badge: 'Health',
  },
  {
    id: 'gwa-calc',
    title: 'Philippine GPA / GWA Calculator',
    category: 'calculators',
    shortDesc: 'General Weighted Average (1.00–5.00), units weighting, and Latin Honors standings',
    badge: 'PH College',
  },
];

const CATEGORIES: { id: Category; label: string; count: number }[] = [
  { id: 'media', label: 'Media & Documents', count: 4 },
  { id: 'developer', label: 'Data & Formats', count: 7 },
  { id: 'security', label: 'Encoding & Security', count: 2 },
  { id: 'units', label: 'Units & Measurements', count: 8 },
  { id: 'calculators', label: 'Calculators & PH', count: 5 },
];

const getToolCategoryColor = (_category: Category, isSelected: boolean) => {
  if (isSelected) {
    return 'bg-amber-500 text-neutral-950 font-bold shadow-sm shadow-amber-500/20';
  }
  return 'glass-panel text-neutral-700 dark:text-neutral-300 border border-neutral-300/80 dark:border-white/10 hover:border-amber-500/40 hover:text-neutral-950 dark:hover:text-white';
};

export function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Selected tool & category filter (initialized from URL hash if present)
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [activeTool, setActiveTool] = useState<ToolType>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as ToolType;
      if (TOOLS.some((t) => t.id === hash)) {
        return hash;
      }
    }
    return 'image-convert';
  });

  // Current view mode: 'home' for dedicated discovery landing, 'tool' for converter workspace
  const [viewMode, setViewMode] = useState<'home' | 'tool'>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as ToolType;
      if (TOOLS.some((t) => t.id === hash)) {
        return 'tool';
      }
    }
    return 'home';
  });

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [targetImageFormat, setTargetImageFormat] = useState<SupportedImageFormat>('image/webp');
  const [imageQuality, setImageQuality] = useState<number>(0.85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [batchResults, setBatchResults] = useState<ConversionResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorRemedy, setErrorRemedy] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState<number>(0);

  // Text, Color & Markdown utility state
  const [textInput, setTextInput] = useState<string>('');
  const [textOutput, setTextOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [markdownDirection, setMarkdownDirection] = useState<'md-to-html' | 'html-to-md'>('md-to-html');
  const [markdownTab, setMarkdownTab] = useState<'preview' | 'raw'>('preview');
  const [colorInput, setColorInput] = useState<string>('#6366F1');
  const [colorData, setColorData] = useState<ColorFormats | null>(() => parseColor('#6366F1'));
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [jsonDirection, setJsonDirection] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [autoTransform, setAutoTransform] = useState<boolean>(true);
  // CSV / TSV / Table utility state
  const [csvMode, setCsvMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const [csvDelimiter, setCsvDelimiter] = useState<string>(',');
  const [csvHasHeader, setCsvHasHeader] = useState<boolean>(true);
  const [csvIndentation, setCsvIndentation] = useState<number>(2);
  const [csvParsedResult, setCsvParsedResult] = useState<CsvParseResult | null>(null);
  const [csvOutputTab, setCsvOutputTab] = useState<'table' | 'code'>('table');
  const [tableFilter, setTableFilter] = useState<string>('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  // Hash & Checksum utility state
  const [hashSourceType, setHashSourceType] = useState<'text' | 'file'>('text');
  const [hashTextInput, setHashTextInput] = useState<string>('Hello, Multi-Converter!');
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [hashUppercase, setHashUppercase] = useState<boolean>(false);
  const [hashVerifyInput, setHashVerifyInput] = useState<string>('');
  const [hashCopiedAlgo, setHashCopiedAlgo] = useState<string | null>(null);
  const [isHashingFile, setIsHashingFile] = useState<boolean>(false);
  const hashFileInputRef = useRef<HTMLInputElement>(null);
  // Unit & Measurement utility state
  const [unitCategory, setUnitCategory] = useState<'css' | 'storage' | 'time'>('css');
  const [cssPx, setCssPx] = useState<number>(16);
  const [cssBaseSize, setCssBaseSize] = useState<number>(16);
  const [cssResults, setCssResults] = useState<CssUnitResults>(() => convertCssUnits(16, 'px', 16));
  const [storageAmount, setStorageAmount] = useState<number>(1024);
  const [storageUnit, setStorageUnit] = useState<'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'KiB' | 'MiB' | 'GiB' | 'TiB'>('MB');
  const [storageResults, setStorageResults] = useState<DataUnitBreakdown>(() => convertDataStorage(1024, 'MB'));
  const [timeInputVal, setTimeInputVal] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [timeResults, setTimeResults] = useState<TimestampResults | null>(() => parseTimestampOrDate(Math.floor(Date.now() / 1000)));
  const [unitCopiedKey, setUnitCopiedKey] = useState<string | null>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mc_history', JSON.stringify(history.slice(0, 20)));
    } catch {
      // Ignore quota errors
    }
  }, [history]);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isDraggingWindow, setIsDraggingWindow] = useState<boolean>(false);
  const [stripExif, setStripExif] = useState<boolean>(true);
  const dragCounter = useRef<number>(0);
  const activeToolButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Keep active tool in view inside the scrollable sidebar list without scrolling the window
    const btn = activeToolButtonRef.current;
    const container = btn?.parentElement;
    if (btn && container) {
      const btnTop = btn.offsetTop;
      const btnBottom = btnTop + btn.offsetHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      if (btnTop < containerTop) {
        container.scrollTo({ top: btnTop, behavior: 'smooth' });
      } else if (btnBottom > containerBottom) {
        container.scrollTo({ top: btnBottom - container.clientHeight, behavior: 'smooth' });
      }
    }
  }, [activeTool]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mc_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mc_theme', 'light');
    }
  }, [isDark]);

  const currentToolMeta = TOOLS.find((t) => t.id === activeTool)!;

  // Sync activeTool with URL hash, document title, and SEO meta tags
  useEffect(() => {
    if (viewMode === 'home') {
      document.title = 'Isal.in Multi-Converter — Convert files and data in one place | Isalin ang lahat. Convert anything.';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Free, 100% private in-browser utility suite. Convert images, documents, text, code, physical units, and Philippine financial calculators with zero server uploads.'
        );
      }
      if (typeof window !== 'undefined' && window.location.hash && window.location.hash !== '#' && window.location.hash !== '#explore-tools') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else if (currentToolMeta) {
      document.title = `${currentToolMeta.title} — Isal.in: Isalin ang lahat. Convert anything.`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `${currentToolMeta.title}: ${currentToolMeta.shortDesc}. Isalin ang lahat. Convert anything — 100% private in-browser utility suite.`
        );
      }
      if (typeof window !== 'undefined' && window.location.hash !== `#${activeTool}`) {
        window.history.replaceState(null, '', `#${activeTool}`);
      }
    }
    const favLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (favLink && !favLink.href.includes('v=6')) {
      favLink.href = '/favicon.svg?v=6';
    }
  }, [activeTool, currentToolMeta, viewMode]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      if (!rawHash || rawHash === 'home' || rawHash === 'explore-tools') {
        setViewMode('home');
        return;
      }
      const hash = rawHash as ToolType;
      if (TOOLS.some((t) => t.id === hash)) {
        setActiveTool(hash);
        setViewMode('tool');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Listen to Online/Offline connectivity and PWA install prompt
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    const handleAppInstalled = () => setInstallPrompt(null);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);



  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleShareTool = () => {
    const url = `${window.location.origin}${window.location.pathname}#${activeTool}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleToolSelect = useCallback((toolId: ToolType, isExplicitReset = false) => {
    const isSameTool = toolId === activeTool && !isExplicitReset;
    if (!isSameTool) {
      setActiveTool(toolId);
      setFiles([]);
      setResult(null);
      setBatchResults([]);
      setErrorMsg(null);
      setErrorRemedy(null);
      setConversionProgress(0);
      setOriginalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (toolId === 'markdown-html') {
        const sample = `# Multi-Converter Markdown\n\nFast, **100% private** in-browser text transformation.\n\n- Zero server uploads\n- Instant live preview\n- Clean HTML export\n\n> "Security and privacy without compromise."\n\n\`\`\`javascript\nconsole.log("Hello from browser sandbox!");\n\`\`\``;
        setTextInput(sample);
        setTextOutput(markdownToHtml(sample));
      } else if (toolId === 'csv-json') {
        const sample = `id,name,role,department,active\n101,Alex Morgan,Staff Engineer,Infrastructure,true\n102,Sophia Chen,Product Lead,Growth,true\n103,David Miller,Security Analyst,SecOps,false\n104,Elena Rostova,UX Designer,Creative,true\n105,Marcus Vance,Data Scientist,Analytics,true`;
        setTextInput(sample);
        const parsed = parseCsv(sample, ',', true);
        setCsvParsedResult(parsed);
        setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
      } else if (toolId === 'hash-calc') {
        const sample = 'Hello, Multi-Converter!';
        setHashTextInput(sample);
        computeAllHashes(sample).then(setHashResult);
      } else if (toolId === 'unit-convert') {
        const nowSec = Math.floor(Date.now() / 1000);
        setTimeInputVal(String(nowSec));
        setTimeResults(parseTimestampOrDate(nowSec));
      } else {
        setTextInput('');
        setTextOutput('');
      }
    }

    // Auto-scroll to main converter workspace on mobile & tablet layout (< 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById('tool-workspace');
        if (el) {
          const headerOffset = 76; // 64px sticky header + 12px margin
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }, 70);
    }
  }, [activeTool, csvIndentation]);

  const navigateToHome = useCallback(() => {
    setViewMode('home');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleConvertAnother = useCallback(() => {
    setFiles([]);
    setResult(null);
    setBatchResults([]);
    setErrorMsg(null);
    setErrorRemedy(null);
    setConversionProgress(0);
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
      setOriginalPreviewUrl(null);
    }
    setTimeout(() => {
      document.getElementById('file-upload-input')?.click();
    }, 80);
  }, [originalPreviewUrl]);

  const navigateToTool = useCallback(
    (toolId: ToolType, preset?: { targetFormat?: string; mode?: string }) => {
      handleToolSelect(toolId);
      setViewMode('tool');
      if (typeof window !== 'undefined') {
        window.location.hash = `#${toolId}`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (preset?.targetFormat && toolId === 'image-convert') {
        setTargetImageFormat(preset.targetFormat as SupportedImageFormat);
      }
      if (preset?.mode && toolId === 'json-yaml') {
        setJsonDirection(preset.mode as 'json-to-yaml' | 'yaml-to-json');
      }
      if (preset?.mode && toolId === 'base64') {
        setBase64Mode(preset.mode as 'encode' | 'decode');
      }
      if (preset?.mode && toolId === 'csv-json') {
        setCsvMode(preset.mode as 'csv-to-json' | 'json-to-csv');
      }
    },
    [handleToolSelect]
  );

  const handlePaletteSelectTool = useCallback(
    (toolId: ToolType, initialInput?: string) => {
      handleToolSelect(toolId);
      setViewMode('tool');
      if (typeof window !== 'undefined') {
        window.location.hash = `#${toolId}`;
      }
      if (initialInput) {
        setTextInput(initialInput);
        if (toolId === 'color-convert') {
          setColorInput(initialInput);
          setColorData(parseColor(initialInput));
        } else if (toolId === 'hash-calc') {
          setHashTextInput(initialInput);
          computeAllHashes(initialInput).then(setHashResult);
        }
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    },
    [handleToolSelect]
  );

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory((prev) => [
      {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const handleRestoreHistory = useCallback(
    (item: HistoryItem) => {
      handleToolSelect(item.toolId);
      if (item.inputContent) setTextInput(item.inputContent);
      if (item.outputContent) setTextOutput(item.outputContent);
      if (item.toolId === 'color-convert' && item.inputContent) {
        setColorInput(item.inputContent);
        setColorData(parseColor(item.inputContent));
      } else if (item.toolId === 'hash-calc' && item.inputContent) {
        setHashTextInput(item.inputContent);
        computeAllHashes(item.inputContent).then(setHashResult);
      }
      setTimeout(() => {
        document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
    [handleToolSelect]
  );

  const PRESETS: PresetWorkflow[] = useMemo(
    () => [
      {
        id: 'web-ready-webp',
        title: 'Web-Ready WebP (85% Quality)',
        toolId: 'image-convert',
        description: 'Modern web image format with smart compression for 70%+ smaller file sizes.',
        badge: 'WebP',
        iconType: 'media',
        apply: () => {
          handleToolSelect('image-convert');
          setTargetImageFormat('image/webp');
          setImageQuality(0.85);
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
      {
        id: 'crisp-png',
        title: 'Lossless High-Res PNG',
        toolId: 'image-convert',
        description: 'Pixel-perfect lossless conversion ideal for diagrams, UI icons, and logos.',
        badge: 'PNG',
        iconType: 'media',
        apply: () => {
          handleToolSelect('image-convert');
          setTargetImageFormat('image/png');
          setImageQuality(1.0);
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
      {
        id: 'json-beautify',
        title: 'JSON ⇄ YAML Config Transformer',
        toolId: 'json-yaml',
        description: 'Clean bi-directional schema conversion with syntax verification and live preview.',
        badge: 'Config',
        iconType: 'code',
        apply: () => {
          handleToolSelect('json-yaml');
          setJsonDirection('json-to-yaml');
          const sample = `{\n  "name": "production-api",\n  "version": "1.0.0",\n  "server": {\n    "host": "0.0.0.0",\n    "port": 8080,\n    "ssl": true\n  }\n}`;
          setTextInput(sample);
          convertJsonYaml(sample, 'json-to-yaml').then(setTextOutput).catch(() => {});
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
      {
        id: 'safe-base64',
        title: 'Base64 Safe String Encoding',
        toolId: 'base64',
        description: 'ASCII string to Base64 encode for secure header payloads and storage tokens.',
        badge: 'Security',
        iconType: 'code',
        apply: () => {
          handleToolSelect('base64');
          setBase64Mode('encode');
          const sample = 'Multi-Converter Client-Side Production Token';
          setTextInput(sample);
          setTextOutput(processBase64(sample, 'encode'));
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
      {
        id: 'uuid-batch-10',
        title: 'Batch 10 UUID v4 Identifiers',
        toolId: 'uuid',
        description: 'Generate 10 cryptographically random RFC 4122 v4 tokens ready to copy.',
        badge: 'Crypto',
        iconType: 'utility',
        apply: () => {
          handleToolSelect('uuid');
          setUuidCount(10);
          const uuids = generateUUIDs(10);
          setTextOutput(uuids.join('\n'));
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
      {
        id: 'css-rem-scale',
        title: 'CSS px ⇄ rem Fluid Typography',
        toolId: 'unit-convert',
        description: 'Convert pixels to rem using standard 16px root font size for responsive styling.',
        badge: 'CSS',
        iconType: 'utility',
        apply: () => {
          handleToolSelect('unit-convert');
          setUnitCategory('css');
          setCssPx(24);
          setCssBaseSize(16);
          setCssResults(convertCssUnits(24, 'px', 16));
          setTimeout(() => document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' }), 50);
        },
      },
    ],
    [handleToolSelect]
  );

  // Global ⌘K / Ctrl+K Command Palette Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateAndSetFiles(Array.from(e.target.files));
    }
  };

  const validateAndSetFiles = (incoming: File[]) => {
    setErrorMsg(null);
    setResult(null);
    setBatchResults([]);
    const limits = APP_LIMITS.free;

    if (incoming.length > limits.maxBatchCount) {
      setErrorMsg(`Batch limit exceeded: Maximum ${limits.maxBatchCount} files on the Free plan.`);
      return;
    }

    const totalBytes = incoming.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > limits.maxBatchTotalMB * 1024 * 1024) {
      setErrorMsg(`Limit exceeded: Maximum total size is ${limits.maxBatchTotalMB} MB.`);
      return;
    }

    for (const file of incoming) {
      if (file.size > limits.maxSingleFileMB * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the ${limits.maxSingleFileMB} MB limit.`);
        return;
      }
    }

    setFiles(incoming);
    setOriginalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      if (incoming.length > 0 && incoming[0].type.startsWith('image/')) {
        return URL.createObjectURL(incoming[0]);
      }
      return null;
    });
  };

  const handleRemoveFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    if (batchResults.length > 0) {
      const updatedResults = batchResults.filter((_, i) => i !== index);
      setBatchResults(updatedResults);
      if (updatedResults.length > 0) {
        setResult(updatedResults[0]);
        setSelectedResultIndex(0);
      } else {
        setResult(null);
      }
    }
    if (updated.length > 0) {
      setOriginalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(updated[0]);
      });
    } else {
      setOriginalPreviewUrl(null);
      setResult(null);
    }
  };

  const handleClearFiles = () => {
    setFiles([]);
    setBatchResults([]);
    setResult(null);
    setSelectedResultIndex(0);
    setOriginalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleAddMoreFiles = (newFiles: File[]) => {
    validateAndSetFiles([...files, ...newFiles]);
  };

  const handleReorderFiles = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const reordered = [...files];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setFiles(reordered);
    if (batchResults.length > 0) {
      const reorderedResults = [...batchResults];
      const [movedRes] = reorderedResults.splice(fromIndex, 1);
      reorderedResults.splice(toIndex, 0, movedRes);
      setBatchResults(reorderedResults);
    }
  };

  const handleSelectBatchResult = (index: number) => {
    setSelectedResultIndex(index);
    if (batchResults[index]) {
      setResult(batchResults[index]);
      if (files[index]) {
        setOriginalPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(files[index]);
        });
      }
    }
  };

  const handleLoadSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#0c0e14');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath();
      ctx.arc(400, 250, 160, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(400, 200, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Isal.in Multi-Converter', 400, 320);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px sans-serif';
      ctx.fillText('Visual Inspection Sample (PNG)', 400, 360);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'isalin_sample_banner.png', { type: 'image/png' });
          validateAndSetFiles([file]);
        }
      }, 'image/png');
    }
  };

  const handleConvert = useCallback(async () => {
    setErrorMsg(null);
    setErrorRemedy(null);
    setIsProcessing(true);
    setConversionProgress(15);
    try {
      if (activeTool === 'image-convert') {
        if (!files.length) throw new Error('Please select at least one image file to proceed.');
        const convertedItems: ConversionResult[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const progress = Math.round(20 + ((i + 1) / files.length) * 75);
          setConversionProgress(progress);
          const res = await convertImage(file, targetImageFormat, imageQuality);
          convertedItems.push(res);
        }
        setConversionProgress(100);
        setBatchResults(convertedItems);
        setResult(convertedItems[0]);
        if (convertedItems[0]) {
          const sizeKb = convertedItems[0].sizeBytes ? `${(convertedItems[0].sizeBytes / 1024).toFixed(1)} KB` : '';
          addHistoryItem({
            toolId: 'image-convert',
            toolTitle: 'Image Converter',
            badge: targetImageFormat.replace('image/', '').toUpperCase(),
            summary: `${files[0].name} → ${convertedItems[0].filename}`,
            details: sizeKb ? `${sizeKb} output size` : undefined,
          });
        }
      } else if (activeTool === 'images-to-pdf') {
        if (!files.length) throw new Error('Select at least one image to compile.');
        setConversionProgress(45);
        const res = await convertImagesToPdf(files);
        setConversionProgress(100);
        setResult(res);
        setBatchResults([res]);
        const pdfKb = res.sizeBytes ? `${(res.sizeBytes / 1024).toFixed(1)} KB` : '';
        addHistoryItem({
          toolId: 'images-to-pdf',
          toolTitle: 'Images to PDF',
          badge: 'PDF',
          summary: `${files.length} images compiled to ${res.filename}`,
          details: pdfKb ? `${pdfKb} output size` : undefined,
        });
      } else if (activeTool === 'json-yaml') {
        const out = await convertJsonYaml(textInput, jsonDirection);
        setTextOutput(out);
        addHistoryItem({
          toolId: 'json-yaml',
          toolTitle: 'JSON ⇄ YAML',
          badge: jsonDirection === 'json-to-yaml' ? 'YAML' : 'JSON',
          summary: textInput.slice(0, 60),
          inputContent: textInput,
          outputContent: out,
        });
      } else if (activeTool === 'base64') {
        const out = processBase64(textInput, base64Mode);
        setTextOutput(out);
        addHistoryItem({
          toolId: 'base64',
          toolTitle: 'Base64',
          badge: base64Mode === 'encode' ? 'ENCODE' : 'DECODE',
          summary: textInput.slice(0, 60),
          inputContent: textInput,
          outputContent: out,
        });
      } else if (activeTool === 'url-encode') {
        const out = processUrlEncode(textInput, urlMode);
        setTextOutput(out);
        addHistoryItem({
          toolId: 'url-encode',
          toolTitle: 'URL Percent Encoder',
          badge: urlMode === 'encode' ? 'ENCODE' : 'DECODE',
          summary: textInput.slice(0, 60),
          inputContent: textInput,
          outputContent: out,
        });
      } else if (activeTool === 'uuid') {
        const uuids = generateUUIDs(uuidCount);
        setTextOutput(uuids.join('\n'));
        addHistoryItem({
          toolId: 'uuid',
          toolTitle: 'UUID v4 Generator',
          badge: `${uuidCount} UUIDs`,
          summary: `Generated ${uuidCount} random UUIDs`,
          outputContent: uuids.join('\n'),
        });
      } else if (activeTool === 'markdown-html') {
        if (markdownDirection === 'md-to-html') {
          const out = markdownToHtml(textInput);
          setTextOutput(out);
          addHistoryItem({
            toolId: 'markdown-html',
            toolTitle: 'Markdown ⇄ HTML',
            badge: 'HTML',
            summary: textInput.slice(0, 60),
            inputContent: textInput,
            outputContent: out,
          });
        } else {
          const out = htmlToMarkdown(textInput);
          setTextOutput(out);
          addHistoryItem({
            toolId: 'markdown-html',
            toolTitle: 'Markdown ⇄ HTML',
            badge: 'MD',
            summary: textInput.slice(0, 60),
            inputContent: textInput,
            outputContent: out,
          });
        }
      } else if (activeTool === 'csv-json') {
        if (!textInput.trim()) throw new Error('Please provide CSV or JSON data to convert.');
        if (csvMode === 'csv-to-json') {
          const parsed = parseCsv(textInput, csvDelimiter, csvHasHeader);
          if (parsed.error) throw new Error(parsed.error);
          setCsvParsedResult(parsed);
          const out = JSON.stringify(parsed.rows, null, csvIndentation);
          setTextOutput(out);
          addHistoryItem({
            toolId: 'csv-json',
            toolTitle: 'CSV ⇄ JSON',
            badge: 'JSON',
            summary: textInput.slice(0, 60),
            inputContent: textInput,
            outputContent: out,
          });
        } else {
          const res = jsonToCsv(textInput, csvDelimiter);
          if (res.error) throw new Error(res.error);
          setTextOutput(res.csv);
          const parsed = parseCsv(res.csv, csvDelimiter, true);
          setCsvParsedResult(parsed);
          addHistoryItem({
            toolId: 'csv-json',
            toolTitle: 'CSV ⇄ JSON',
            badge: 'CSV',
            summary: textInput.slice(0, 60),
            inputContent: textInput,
            outputContent: res.csv,
          });
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'An error occurred during conversion.';
      setErrorMsg(msg);
      if (msg.includes('size') || msg.includes('Limit')) {
        setErrorRemedy('Please select a file smaller than 25MB or compress it before converting.');
      } else if (msg.includes('format') || msg.includes('type')) {
        setErrorRemedy('Make sure your file is a supported image (PNG, JPG, WebP, AVIF, BMP, GIF, ICO).');
      } else {
        setErrorRemedy('Check that the file is not corrupted, or try testing with our sample image.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    activeTool,
    files,
    targetImageFormat,
    imageQuality,
    textInput,
    jsonDirection,
    base64Mode,
    urlMode,
    uuidCount,
    markdownDirection,
    csvMode,
    csvDelimiter,
    csvHasHeader,
    csvIndentation,
    addHistoryItem,
  ]);

  // Real-time live transformation for Code & Data utilities
  useEffect(() => {
    if (!autoTransform) return;
    if (!['json-yaml', 'base64', 'url-encode'].includes(activeTool)) return;

    const timer = setTimeout(async () => {
      if (!textInput.trim()) {
        setTextOutput('');
        return;
      }
      try {
        if (activeTool === 'json-yaml') {
          const out = await convertJsonYaml(textInput, jsonDirection);
          setTextOutput(out);
          setErrorMsg(null);
        } else if (activeTool === 'base64') {
          const out = processBase64(textInput, base64Mode);
          setTextOutput(out);
          setErrorMsg(null);
        } else if (activeTool === 'url-encode') {
          const out = processUrlEncode(textInput, urlMode);
          setTextOutput(out);
          setErrorMsg(null);
        }
      } catch {
        // Suppress syntax error while user is in the middle of typing
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [textInput, activeTool, jsonDirection, base64Mode, urlMode, autoTransform]);

  const handleSwapJsonYaml = () => {
    const nextDir = jsonDirection === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml';
    setJsonDirection(nextDir);
    if (textOutput) {
      const prevOut = textOutput;
      setTextInput(prevOut);
      setTextOutput(textInput);
    }
  };

  const handleSwapBase64 = () => {
    const nextMode = base64Mode === 'encode' ? 'decode' : 'encode';
    setBase64Mode(nextMode);
    if (textOutput) {
      const prevOut = textOutput;
      setTextInput(prevOut);
      setTextOutput(textInput);
    }
  };

  const handleSwapUrl = () => {
    const nextMode = urlMode === 'encode' ? 'decode' : 'encode';
    setUrlMode(nextMode);
    if (textOutput) {
      const prevOut = textOutput;
      setTextInput(prevOut);
      setTextOutput(textInput);
    }
  };

  const handleDownloadZip = async () => {
    if (!batchResults.length) return;
    try {
      setIsZipping(true);
      const zipRes = await createZipArchive(batchResults, `converted-images-${Date.now()}.zip`);
      const a = document.createElement('a');
      a.href = zipRes.downloadUrl!;
      a.download = zipRes.filename;
      a.click();
    } catch (err: any) {
      setErrorMsg('Failed to build ZIP archive: ' + err.message);
    } finally {
      setIsZipping(false);
    }
  };

  const handleColorChange = (value: string) => {
    setColorInput(value);
    const parsed = parseColor(value);
    if (parsed) {
      setColorData(parsed);
    }
  };

  const copyColor = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHashFile = useCallback((file: File) => {
    setHashFile(file);
    setIsHashingFile(true);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        try {
          const res = await computeAllHashes(buffer);
          setHashResult(res);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to hash file';
          setErrorMsg(msg);
        } finally {
          setIsHashingFile(false);
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading file for checksum computation.');
      setIsHashingFile(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Real-time Text Hashing
  useEffect(() => {
    if (activeTool === 'hash-calc' && hashSourceType === 'text') {
      let isMounted = true;
      computeAllHashes(hashTextInput)
        .then((res) => {
          if (isMounted) setHashResult(res);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [activeTool, hashSourceType, hashTextInput]);

  // Window-wide Drag and Drop overlay & auto-routing
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDraggingWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingWindow(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDraggingWindow(false);
      if (e.dataTransfer?.files?.length) {
        const incoming = Array.from(e.dataTransfer.files);
        if (incoming.some((f) => f.type.startsWith('image/'))) {
          if (activeTool !== 'images-to-pdf') {
            setActiveTool('image-convert');
          }
          validateAndSetFiles(incoming);
        } else if (incoming.some((f) => f.name.endsWith('.csv') || f.name.endsWith('.tsv') || f.name.endsWith('.json'))) {
          const file = incoming[0];
          setActiveTool('csv-json');
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result as string;
            if (text) {
              setTextInput(text);
              if (file.name.endsWith('.json')) {
                setCsvMode('json-to-csv');
                const res = jsonToCsv(text, ',');
                if (!res.error) {
                  setTextOutput(res.csv);
                  const parsed = parseCsv(res.csv, ',', true);
                  setCsvParsedResult(parsed);
                }
              } else {
                setCsvMode('csv-to-json');
                const isTab = file.name.endsWith('.tsv') || text.includes('\t');
                const delim = isTab ? '\t' : ',';
                setCsvDelimiter(delim);
                const parsed = parseCsv(text, delim, true);
                setCsvParsedResult(parsed);
                setTextOutput(JSON.stringify(parsed.rows, null, 2));
              }
            }
          };
          reader.readAsText(file);
        } else if (activeTool === 'hash-calc') {
          setHashSourceType('file');
          handleHashFile(incoming[0]);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [activeTool, handleHashFile]);

  // Global Keyboard Shortcuts (Ctrl+Enter to execute, '/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('tool-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvert]);

  const filteredRows = (csvParsedResult?.rows || []).filter((row) => {
    if (!tableFilter.trim()) return true;
    const q = tableFilter.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(q));
  });

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090a0f] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-300 relative selection:bg-amber-500/30 selection:text-amber-900 dark:selection:bg-amber-400/20 dark:selection:text-amber-200">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#tool-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-500 focus:text-neutral-950 focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
      >
        Skip to main converter
      </a>

      {/* Minimalist Ambient Aura (Subtle Golden Sun Glow fading into Deep Obsidian) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-amber-500/8 via-amber-500/2 to-transparent blur-3xl rounded-full dark:from-amber-500/10 dark:via-amber-500/2 pointer-events-none" />
      </div>

      {/* Sleek Glassmorphic Top App Bar */}
      <header role="banner" className="sticky top-0 z-30 glass-panel border-b border-neutral-200/70 dark:border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={navigateToHome}
              title="Isal.in Multi-Converter - Go to Homepage"
              className="flex items-center gap-2 cursor-pointer transition hover:opacity-90 active:scale-95 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
              aria-label="Isal.in Multi-Converter Logo - Home"
            >
              <BrandLogo size="md" showWordmark={true} />
            </button>
            <div className="hidden md:flex flex-col pl-3 border-l border-neutral-200 dark:border-neutral-800 leading-tight">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 italic tracking-tight">
                "Isalin ang lahat. Convert anything."
              </span>
              <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">100% client-side • zero upload</span>
            </div>
            {/* Primary Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
              <button
                onClick={() => {
                  if (viewMode === 'home') {
                    document.getElementById('explore-tools')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigateToHome();
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  viewMode === 'home'
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                Tools
              </button>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="px-3 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                About & Privacy
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Command Palette Button (⌘K / Ctrl+K) */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Search tools and features (Ctrl+K or ⌘K)"
              aria-haspopup="dialog"
              aria-expanded={isPaletteOpen}
              className="hidden sm:inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-xs text-neutral-600 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white glass-panel border border-neutral-300/80 dark:border-white/10 hover:border-amber-500/50 transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Quick tool search and switcher (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Search tools...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Open search command palette"
              aria-haspopup="dialog"
              aria-expanded={isPaletteOpen}
              className="sm:hidden w-9 h-9 rounded-xl border border-neutral-300/80 dark:border-white/10 glass-panel flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <Search className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>

            {/* Desktop History & Presets Drawer Button */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              aria-label={`Open activity history (${history.length} items saved)`}
              aria-haspopup="dialog"
              aria-expanded={isHistoryDrawerOpen}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-panel border border-neutral-300/80 dark:border-white/10 hover:border-amber-500/50 text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Recent conversion history and quick presets"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>History</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* Mobile History Button (matches Search and Theme Toggle) */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              aria-label={`Open activity history (${history.length} items saved)`}
              aria-haspopup="dialog"
              aria-expanded={isHistoryDrawerOpen}
              className="sm:hidden relative w-9 h-9 rounded-xl border border-neutral-300/80 dark:border-white/10 glass-panel flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:scale-105 active:scale-95 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Recent conversion history and quick presets"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-neutral-950 text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            {/* Install PWA Button */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                aria-label="Install Multi-Converter application on device"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 transition shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                title="Install Multi-Converter on your device"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            {/* Zero-Upload Status Indicator */}
            <div
              role="status"
              aria-label="100% Private Sandbox: All operations execute locally in your browser"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>100% Private Sandbox</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
              className="w-9 h-9 rounded-xl border border-neutral-300/80 dark:border-white/10 glass-panel flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:scale-105 active:scale-95 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Brand Motto Subtitle Banner */}
      <div className="md:hidden px-4 py-2 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent border-b border-neutral-200/50 dark:border-white/5 text-center">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 italic tracking-tight">
          "Isalin ang lahat. Convert anything."
        </p>
      </div>

      {/* Offline Status Notification Banner */}
      {!isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="relative z-20 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2 backdrop-blur-md"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Offline Mode Active:</strong> You have lost internet connection, but all converters and encoders remain <strong>100% operational</strong> locally in your browser.
          </span>
        </aside>
      )}

      {viewMode === 'home' ? (
        <main id="main-content" role="main" className="flex-1 w-full relative z-10">
          <HomePage
            tools={TOOLS}
            onSelectTool={navigateToTool}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        </main>
      ) : (
        <main
          id="main-content"
          role="main"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10"
        >
          {/* Left Column: Categorized Tool Drawer & Catalog (lg:col-span-4) - Hidden on mobile in tool mode to prioritize workspace */}
          <aside
            aria-label="Utility Tools Catalog"
            className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-20"
          >
          {/* Category Filter */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalToolsCount={TOOLS.length}
          />

          {/* Quick Search Tool Input */}
          <div className="relative group">
            <Search className="w-3.5 h-3.5 text-neutral-400 group-focus-within:text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              id="tool-search-input"
              type="search"
              role="searchbox"
              aria-label="Search utilities and tools"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search utilities... (Press '/' to focus)"
              className="w-full glass-panel border border-neutral-200/80 dark:border-white/10 rounded-2xl pl-9 pr-12 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 dark:focus:border-amber-400/50 transition shadow-xs"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-mono">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Categorized Tool Cards List */}
          <div role="region" aria-label="Available Utilities" className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] text-neutral-500 font-medium">
              <span>Available Utilities ({filteredTools.length})</span>
              {filteredTools.length > 5 && (
                <span className="text-[10px] text-neutral-400 font-mono">scroll to view</span>
              )}
            </div>

            <div className="relative group/toollist">
              <div
                role="list"
                aria-label="Conversion utilities list"
                className="space-y-2 max-h-[340px] sm:max-h-[380px] lg:max-h-[calc(100vh-310px)] overflow-y-auto pr-1 scroll-smooth"
              >
                {filteredTools.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-neutral-200/80 dark:border-neutral-800 glass-panel text-xs text-neutral-400">
                    No matching tools found for "{searchQuery}".
                  </div>
                ) : (
                  filteredTools.map((tool) => {
                    const isSelected = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        ref={isSelected ? activeToolButtonRef : undefined}
                        role="listitem"
                        aria-current={isSelected ? 'page' : undefined}
                        aria-label={`${tool.title}: ${tool.shortDesc} (${tool.badge} category)`}
                        onClick={() => handleToolSelect(tool.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'glass-card border-amber-500/50 dark:border-amber-400/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20'
                            : 'glass-panel border-neutral-200/70 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/20 hover:translate-x-0.5'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-full shadow-xs" />
                        )}
                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${getToolCategoryColor(
                              tool.category,
                              isSelected
                            )}`}
                          >
                            {tool.id === 'image-convert' && <FileImage className="w-4 h-4" />}
                            {tool.id === 'images-to-pdf' && <FileText className="w-4 h-4" />}
                            {tool.id === 'audio-convert' && <Music className="w-4 h-4" />}
                            {tool.id === 'video-convert' && <Video className="w-4 h-4" />}
                            {tool.id === 'json-yaml' && <ArrowRightLeft className="w-4 h-4" />}
                            {tool.id === 'base64' && <Code2 className="w-4 h-4" />}
                            {tool.id === 'url-encode' && <Link className="w-4 h-4" />}
                            {tool.id === 'uuid' && <Hash className="w-4 h-4" />}
                            {tool.id === 'color-convert' && <Palette className="w-4 h-4" />}
                            {tool.id === 'markdown-html' && <BookOpen className="w-4 h-4" />}
                            {tool.id === 'csv-json' && <Table className="w-4 h-4" />}
                            {tool.id === 'hash-calc' && <Fingerprint className="w-4 h-4" />}
                            {tool.id === 'unit-convert' && <Ruler className="w-4 h-4" />}
                            {tool.id === 'length-convert' && <Ruler className="w-4 h-4" />}
                            {tool.id === 'mass-convert' && <Scale className="w-4 h-4" />}
                            {tool.id === 'area-convert' && <Maximize2 className="w-4 h-4" />}
                            {tool.id === 'volume-convert' && <Box className="w-4 h-4" />}
                            {tool.id === 'temperature-convert' && <Thermometer className="w-4 h-4" />}
                            {tool.id === 'speed-convert' && <Gauge className="w-4 h-4" />}
                            {tool.id === 'time-convert' && <Clock className="w-4 h-4" />}
                            {tool.id === 'number-system' && <Binary className="w-4 h-4" />}
                            {tool.id === 'income-tax-ph' && <Coins className="w-4 h-4" />}
                            {tool.id === 'mortgage-calc' && <Home className="w-4 h-4" />}
                            {tool.id === 'electricity-calc' && <Zap className="w-4 h-4" />}
                            {tool.id === 'bmi-calc' && <Heart className="w-4 h-4" />}
                            {tool.id === 'gwa-calc' && <GraduationCap className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm truncate text-neutral-950 dark:text-white">
                                {tool.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {tool.shortDesc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 pl-1">
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-white/5">
                            {tool.badge}
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isSelected
                                ? 'text-amber-500 dark:text-amber-400 translate-x-0.5'
                                : 'text-neutral-400 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5'
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {/* Subtle bottom gradient fade to indicate scrollable content */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-100/90 dark:from-[#0c0e14]/90 to-transparent rounded-b-2xl opacity-80" />
            </div>
          </div>

          {/* 3.3 Sticky Sidebar Sponsor Card */}
          <div className="hidden lg:block pt-3">
            <AdSlot placement="sidebar" />
          </div>
        </aside>

        {/* Right Column: Active Utility Workspace (Dynamic Category Adaptability) */}
        <div id="tool-workspace" className="col-span-1 lg:col-span-8 space-y-6">
          {/* Converter Header & Breadcrumbs */}
          <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200/80 dark:border-white/10 ${
            ['length-convert', 'mass-convert', 'area-convert', 'volume-convert', 'temperature-convert', 'speed-convert', 'time-convert', 'bmi-calc', 'gwa-calc'].includes(activeTool)
              ? 'max-w-3xl mx-auto'
              : 'w-full'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={navigateToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/50 transition cursor-pointer font-semibold shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Tools</span>
              </button>
              <span className="text-neutral-400">/</span>
              <span className="text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-[10px] font-mono font-medium">
                {currentToolMeta.category}
              </span>
              <span className="text-neutral-400">/</span>
              <span className="font-semibold text-neutral-950 dark:text-white truncate">
                {currentToolMeta.title}
              </span>
            </div>

            <button
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-neutral-600 hover:text-amber-700 dark:text-neutral-300 dark:hover:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition cursor-pointer font-medium focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Switch to another tool (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Tool</span>
              <kbd className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">⌘K</kbd>
            </button>
          </div>
          
          {/* Active Utility Workspace Card */}
          <section
            id="tool-workspace"
            aria-labelledby="active-tool-title"
            className={`glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200/80 dark:border-white/10 relative overflow-hidden scroll-mt-20 sm:scroll-mt-24 transition-all duration-300 ${
              ['length-convert', 'mass-convert', 'area-convert', 'volume-convert', 'temperature-convert', 'speed-convert', 'time-convert', 'bmi-calc', 'gwa-calc'].includes(activeTool)
                ? 'max-w-3xl mx-auto'
                : 'w-full'
            }`}
          >
            {/* Top Specular Glow Edge */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/30 to-transparent pointer-events-none" />

            {/* Active Tool Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200/60 dark:border-white/10">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {currentToolMeta.badge}
                  </span>
                  <h1 id="active-tool-title" className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    {currentToolMeta.title}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                  {currentToolMeta.shortDesc}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  onClick={handleShareTool}
                  title="Copy direct URL to this specific tool"
                  aria-label={`Copy direct link to ${currentToolMeta.title}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-xl transition glass-panel hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleToolSelect(activeTool, true)}
                  title="Reset workspace state"
                  aria-label={`Reset ${currentToolMeta.title} workspace state`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-xl transition glass-panel hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div role="alert" aria-live="assertive" className="mt-4 flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Media Tools (Image / PDF) Workspace */}
            {(activeTool === 'image-convert' || activeTool === 'images-to-pdf') && (
              <div className="mt-5 space-y-5">
                {/* 3-Stage Lifecycle Stepper & Security Badge */}
                <ConversionStateIndicator
                  state={
                    isProcessing
                      ? 'converting'
                      : result?.downloadUrl
                      ? 'completed'
                      : errorMsg
                      ? 'error'
                      : 'ready'
                  }
                  hasFile={files.length > 0}
                  fileName={files.length > 0 ? (files.length === 1 ? files[0].name : `${files.length} images selected`) : undefined}
                  progressPercent={conversionProgress}
                  errorMessage={errorMsg || undefined}
                  errorRemedy={errorRemedy || undefined}
                  supportedFormats={activeTool === 'image-convert' ? 'PNG, JPG, WebP, AVIF, BMP, GIF, ICO' : 'PNG, JPG, JPEG'}
                  maxFileSizeMB={APP_LIMITS.free.maxSingleFileMB}
                  onReset={handleConvertAnother}
                  outputFormatName={
                    activeTool === 'image-convert'
                      ? targetImageFormat.split('/')[1]?.toUpperCase()
                      : 'PDF'
                  }
                />

                {/* Drag & Drop Canvas */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="group relative border-2 border-dashed border-neutral-300/80 dark:border-neutral-700/80 hover:border-amber-500/70 dark:hover:border-amber-400/60 bg-gradient-to-b from-white/70 to-neutral-50/50 dark:from-neutral-900/40 dark:to-[#0c0e14]/60 rounded-3xl p-7 sm:p-9 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm">
                    <UploadCloud className="w-7 h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                    Drop your {activeTool === 'image-convert' ? 'images' : 'files'} here
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
                    or choose files directly from your computer or phone
                  </p>
                  
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                    >
                      Choose {activeTool === 'image-convert' ? 'Images' : 'Files'}
                    </button>
                    {activeTool === 'image-convert' && (
                      <button
                        type="button"
                        id="load-sample-image-btn"
                        onClick={handleLoadSampleImage}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/40 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Try Sample Image</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple={true}
                    accept={activeTool === 'image-convert' ? 'image/*' : 'image/png,image/jpeg'}
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>

                {/* Interactive Batch Queue Manager */}
                {files.length > 0 && (
                  <BatchQueueManager
                    files={files}
                    onRemoveFile={handleRemoveFile}
                    onClearFiles={handleClearFiles}
                    onAddFiles={handleAddMoreFiles}
                    onReorderFiles={handleReorderFiles}
                    targetFormat={targetImageFormat}
                    onTargetFormatChange={setTargetImageFormat}
                    isProcessing={isProcessing}
                    batchResults={batchResults}
                    selectedResultIndex={selectedResultIndex}
                    onSelectResult={handleSelectBatchResult}
                    onDownloadZip={handleDownloadZip}
                    isZipping={isZipping}
                    mode={activeTool as 'image-convert' | 'images-to-pdf'}
                  />
                )}

                {/* Relevant Output Options for Image Converter */}
                {activeTool === 'image-convert' && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Output Format Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                          <span>Output Format</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-normal">
                            Local WebAssembly
                          </span>
                        </label>
                        <select
                          value={targetImageFormat}
                          onChange={(e) => setTargetImageFormat(e.target.value as any)}
                          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                        >
                          <option value="image/webp">WebP (Optimized / Lightest)</option>
                          <option value="image/png">PNG (Lossless 32-bit)</option>
                          <option value="image/jpeg">JPEG / JPG (Standard Photo)</option>
                          <option value="image/avif">AVIF (Next-Gen Open Media)</option>
                          <option value="image/bmp">BMP (Uncompressed Bitmap)</option>
                          <option value="image/x-icon">ICO (Windows & Web Favicon)</option>
                          <option value="image/gif">GIF (Graphics Interchange)</option>
                        </select>
                      </div>

                      {/* Quality Slider with Quick Preset Pills */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          <span>Quality</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                            {Math.round(imageQuality * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={imageQuality}
                          onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                          className="w-full accent-amber-500 h-2 mt-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setImageQuality(0.9)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                              imageQuality === 0.9 ? 'bg-amber-500 text-neutral-950 font-bold' : 'glass-panel text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            90% High
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageQuality(0.8)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                              imageQuality === 0.8 ? 'bg-amber-500 text-neutral-950 font-bold' : 'glass-panel text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            80% Balanced
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageQuality(0.65)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                              imageQuality === 0.65 ? 'bg-amber-500 text-neutral-950 font-bold' : 'glass-panel text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                          >
                            65% Smallest
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Advanced Settings (Kept Collapsed Until Needed) */}
                    <details className="group rounded-2xl glass-panel border border-neutral-200/80 dark:border-white/10 overflow-hidden">
                      <summary className="px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition">
                        <span className="flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>Advanced Settings (EXIF Privacy & Metadata)</span>
                        </span>
                        <ChevronDown className="w-4 h-4 text-neutral-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="p-4 pt-2 border-t border-neutral-200/60 dark:border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="pr-4">
                            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              Strip EXIF & GPS Metadata
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              Removes camera settings, dates, and geolocation tags from output image.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={stripExif}
                            onChange={(e) => setStripExif(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {/* Primary Action Button (State-Aware) */}
                {files.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    className="w-full py-4 bg-neutral-100 dark:bg-neutral-900/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs sm:text-sm rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-500" />
                    <span>Choose files above to start conversion</span>
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={handleConvert}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 disabled:opacity-50 font-extrabold text-sm sm:text-base rounded-2xl transition shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-amber-400/30"
                  >
                    <span>
                      {isProcessing
                        ? `Converting on your device (${conversionProgress}%)...`
                        : activeTool === 'image-convert'
                        ? `Convert to ${targetImageFormat.split('/')[1]?.toUpperCase()} (${files.length} ${files.length > 1 ? 'Images' : 'Image'})`
                        : `Merge ${files.length} Images into PDF`}
                    </span>
                    <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-lg bg-black/15 text-neutral-950 font-semibold">
                      Ctrl+↵
                    </kbd>
                  </button>
                )}

                {/* Post-Conversion Results & Visual Actions */}
                {activeTool === 'image-convert' && result?.downloadUrl && originalPreviewUrl && (
                  <div className="mt-6 space-y-4 pt-4 border-t border-neutral-200/80 dark:border-white/10">
                    {/* Success Summary Pill */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                            Conversion Complete!
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                            {files[0]?.name} ({files[0] ? (files[0].size > 1024 * 1024 ? `${(files[0].size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(files[0].size / 1024)} KB`) : ''})
                            {' → '}
                            <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                              {result.sizeBytes ? (result.sizeBytes > 1024 * 1024 ? `${(result.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(result.sizeBytes / 1024)} KB`) : ''}
                            </strong>
                            {files[0] && result.sizeBytes && files[0].size > result.sizeBytes && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[10px]">
                                -{Math.round(((files[0].size - result.sizeBytes) / files[0].size) * 100)}% smaller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleConvertAnother}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/50 transition cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                        <span>Convert another file</span>
                      </button>
                    </div>

                    <ImageCompareSlider
                      originalUrl={originalPreviewUrl}
                      convertedUrl={result.downloadUrl}
                      originalName={files[selectedResultIndex]?.name || files[0]?.name || 'Original Image'}
                      convertedName={result.filename}
                      originalSizeBytes={files[selectedResultIndex]?.size || files[0]?.size}
                      convertedSizeBytes={result.sizeBytes}
                      originalFormat={files[selectedResultIndex]?.type.split('/')[1]?.toUpperCase() || files[0]?.type.split('/')[1]?.toUpperCase()}
                      convertedFormat={targetImageFormat.split('/')[1]?.toUpperCase()}
                      onDownload={() => {
                        if (result.downloadUrl) {
                          const a = document.createElement('a');
                          a.href = result.downloadUrl;
                          a.download = result.filename;
                          a.click();
                        }
                      }}
                    />

                    {/* Single Image Primary Download and Action Bar */}
                    {batchResults.length <= 1 && (
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <a
                          href={result.downloadUrl}
                          download={result.filename}
                          className="flex-1 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition cursor-pointer ring-2 ring-amber-400/30"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download {result.filename}</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleConvertAnother}
                          className="w-full sm:w-auto py-4 px-5 glass-panel border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/50 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <RotateCcw className="w-4 h-4 text-amber-500" />
                          <span>Convert Another</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PDF Compilation Result */}
                {activeTool === 'images-to-pdf' && result?.downloadUrl && (
                  <div className="mt-6 p-5 rounded-2xl glass-card border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                            PDF Document Created!
                          </div>
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-300">
                            {files.length} images compiled into {result.filename} ({result.sizeBytes ? (result.sizeBytes > 1024 * 1024 ? `${(result.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(result.sizeBytes / 1024)} KB`) : ''})
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleConvertAnother}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-amber-500/50 transition cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                        <span>Compile another PDF</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <a
                        href={result.downloadUrl}
                        download={result.filename}
                        className="flex-1 w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer ring-2 ring-amber-400/30"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download PDF ({result.filename})</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Developer Code & Data Utilities Dual-Pane Workspace */}
            {['json-yaml', 'base64', 'url-encode'].includes(activeTool) && (
              <div className="mt-5">
                <DualPaneCodeWorkspace
                  inputTitle={
                    activeTool === 'json-yaml'
                      ? jsonDirection === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'
                      : activeTool === 'base64'
                      ? base64Mode === 'encode' ? 'Plain Text Source' : 'Base64 Encoded Text'
                      : urlMode === 'encode' ? 'Raw URL / Query String' : 'Percent-Encoded URL'
                  }
                  outputTitle={
                    activeTool === 'json-yaml'
                      ? jsonDirection === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'
                      : activeTool === 'base64'
                      ? base64Mode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Plain Text'
                      : urlMode === 'encode' ? 'Percent-Encoded Output' : 'Decoded URL'
                  }
                  inputBadge={
                    activeTool === 'json-yaml'
                      ? jsonDirection === 'json-to-yaml' ? 'JSON' : 'YAML'
                      : activeTool === 'base64'
                      ? base64Mode === 'encode' ? 'TEXT' : 'BASE64'
                      : urlMode === 'encode' ? 'RAW URL' : 'ENCODED'
                  }
                  outputBadge={
                    activeTool === 'json-yaml'
                      ? jsonDirection === 'json-to-yaml' ? 'YAML' : 'JSON'
                      : activeTool === 'base64'
                      ? base64Mode === 'encode' ? 'BASE64' : 'TEXT'
                      : urlMode === 'encode' ? 'ENCODED' : 'RAW URL'
                  }
                  outputFileExtension={
                    activeTool === 'json-yaml'
                      ? jsonDirection === 'json-to-yaml' ? 'yaml' : 'json'
                      : activeTool === 'base64'
                      ? base64Mode === 'encode' ? 'b64' : 'txt'
                      : 'txt'
                  }
                  inputValue={textInput}
                  outputValue={textOutput}
                  onInputChange={setTextInput}
                  onTransform={handleConvert}
                  onSwap={
                    activeTool === 'json-yaml'
                      ? handleSwapJsonYaml
                      : activeTool === 'base64'
                      ? handleSwapBase64
                      : handleSwapUrl
                  }
                  onLoadSample={() => {
                    if (activeTool === 'json-yaml') {
                      if (jsonDirection === 'json-to-yaml') {
                        const sample = `{\n  "appName": "Multi-Converter",\n  "version": "2.4.0",\n  "privacy": "100% Client-Side",\n  "features": [\n    "Dual-pane workspace",\n    "Live transform",\n    "Zero server uploads"\n  ]\n}`;
                        setTextInput(sample);
                        convertJsonYaml(sample, 'json-to-yaml').then(setTextOutput).catch(() => {});
                      } else {
                        const sample = `appName: Multi-Converter\nversion: 2.4.0\nprivacy: 100% Client-Side\nfeatures:\n  - Dual-pane workspace\n  - Live transform\n  - Zero server uploads\n`;
                        setTextInput(sample);
                        convertJsonYaml(sample, 'yaml-to-json').then(setTextOutput).catch(() => {});
                      }
                    } else if (activeTool === 'base64') {
                      if (base64Mode === 'encode') {
                        const sample = 'Multi-Converter: Fast, private, client-side developer toolbox ⚡';
                        setTextInput(sample);
                        setTextOutput(processBase64(sample, 'encode'));
                      } else {
                        const sample = 'TXVsdGktQ29udmVydGVyOiBGYXN0LCBwcml2YXRlLCBjbGllbnQtc2lkZSBkZXZlbG9wZXIgdG9vbGJveCDimao=';
                        setTextInput(sample);
                        setTextOutput(processBase64(sample, 'decode'));
                      }
                    } else if (activeTool === 'url-encode') {
                      if (urlMode === 'encode') {
                        const sample = 'https://multi-converter.app/search?query=developer tools & privacy=100% private&category=code & data';
                        setTextInput(sample);
                        setTextOutput(processUrlEncode(sample, 'encode'));
                      } else {
                        const sample = 'https%3A%2F%2Fmulti-converter.app%2Fsearch%3Fquery%3Ddeveloper%20tools%20%26%20privacy%3D100%25%20private%26category%3Dcode%20%26%20data';
                        setTextInput(sample);
                        setTextOutput(processUrlEncode(sample, 'decode'));
                      }
                    }
                  }}
                  autoTransform={autoTransform}
                  onAutoTransformChange={setAutoTransform}
                  isProcessing={isProcessing}
                />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* UUID Generator Workspace */}
            {activeTool === 'uuid' && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl glass-panel">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400 font-semibold">Generate Count:</span>
                    <select
                      value={uuidCount}
                      onChange={(e) => setUuidCount(parseInt(e.target.value))}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none"
                    >
                      <option value={1}>1 UUID</option>
                      <option value={5}>5 UUIDs</option>
                      <option value={10}>10 UUIDs</option>
                      <option value={20}>20 UUIDs</option>
                      <option value={50}>50 UUIDs</option>
                    </select>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">RFC 4122 v4 Compliant</span>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl transition shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Generate UUIDs</span>
                  <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/15 text-neutral-900">
                    Ctrl+↵
                  </kbd>
                </button>

                {textOutput && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                        Generated Identifiers
                      </span>
                      <button
                        onClick={() => copyToClipboard(textOutput)}
                        className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy All'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={Math.min(uuidCount + 2, 12)}
                      readOnly
                      value={textOutput}
                      className="w-full bg-neutral-100/70 dark:bg-[#0c0e14]/90 border border-neutral-200/70 dark:border-white/5 rounded-2xl p-4 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y leading-relaxed"
                    />
                    <AdSlot placement="post-conversion" />
                  </div>
                )}
              </div>
            )}

            {/* Color Format Converter Workspace */}
            {activeTool === 'color-convert' && (
              <div className="mt-5 space-y-5">
                {/* Visual Swatch & Native Color Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60">
                  <div className="relative group shrink-0">
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border-2 border-white dark:border-neutral-800 transition-transform group-hover:scale-105 cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: colorData?.hex || '#6366F1' }}
                      onClick={() => document.getElementById('native-color-picker')?.click()}
                    >
                      <Palette className="w-6 h-6 text-white drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <input
                      id="native-color-picker"
                      type="color"
                      value={colorData?.hex || '#6366F1'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Color Input (HEX, RGB, or HSL)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={colorInput}
                        onChange={(e) => handleColorChange(e.target.value)}
                        placeholder="e.g. #6366F1, rgb(99, 102, 241), or hsl(239, 84%, 67%)"
                        className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Click the color swatch to open the visual picker, or type any color code.
                    </p>
                  </div>
                </div>

                {/* Quick Palette Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: 'Indigo', hex: '#6366F1' },
                      { name: 'Emerald', hex: '#10B981' },
                      { name: 'Sky', hex: '#0EA5E9' },
                      { name: 'Amber', hex: '#F59E0B' },
                      { name: 'Rose', hex: '#F43F5E' },
                      { name: 'Purple', hex: '#A855F7' },
                      { name: 'Slate', hex: '#475569' },
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => handleColorChange(preset.hex)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition"
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.hex }} />
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Converted Format Grid */}
                {colorData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { label: 'HEX', val: colorData.hex },
                      { label: 'RGB', val: colorData.rgb },
                      { label: 'HSL', val: colorData.hsl },
                      { label: 'CMYK', val: colorData.cmyk },
                    ].map((fmt) => (
                      <div
                        key={fmt.label}
                        className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                            {fmt.label}
                          </span>
                          <p className="font-mono text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {fmt.val}
                          </p>
                        </div>
                        <button
                          onClick={() => copyColor(fmt.val, fmt.label)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition shrink-0"
                        >
                          {copiedFormat === fmt.label ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* Markdown ⇄ HTML Live Editor Workspace */}
            {activeTool === 'markdown-html' && (
              <div className="mt-5 space-y-4">
                {/* Control Bar: Mode Toggle + Sample Loader */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs bg-neutral-100/50 dark:bg-neutral-950">
                    <button
                      onClick={() => {
                        setMarkdownDirection('md-to-html');
                        setTextOutput(markdownToHtml(textInput));
                      }}
                      className={`px-3 py-1.5 rounded-md font-medium transition ${
                        markdownDirection === 'md-to-html'
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500'
                      }`}
                    >
                      Markdown → HTML
                    </button>
                    <button
                      onClick={() => {
                        setMarkdownDirection('html-to-md');
                        setTextOutput(htmlToMarkdown(textInput));
                      }}
                      className={`px-3 py-1.5 rounded-md font-medium transition ${
                        markdownDirection === 'html-to-md'
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500'
                      }`}
                    >
                      HTML → Markdown
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const sample = `# Multi-Converter Markdown\n\nFast, **100% private** in-browser text transformation.\n\n- Zero server uploads\n- Instant live preview\n- Clean HTML export\n\n> "Security and privacy without compromise."\n\n\`\`\`javascript\nconsole.log("Hello from browser sandbox!");\n\`\`\``;
                      setTextInput(sample);
                      setTextOutput(markdownToHtml(sample));
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Load Sample Markdown
                  </button>
                </div>

                {/* Editor & Preview Panes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Source Text Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-mono uppercase tracking-wider text-[10px]">
                        {markdownDirection === 'md-to-html' ? 'Markdown Source' : 'HTML Source'}
                      </span>
                      <span className="font-mono text-[10px]">
                        {textInput.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={12}
                      value={textInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextInput(val);
                        if (markdownDirection === 'md-to-html') {
                          setTextOutput(markdownToHtml(val));
                        } else {
                          setTextOutput(htmlToMarkdown(val));
                        }
                      }}
                      placeholder={
                        markdownDirection === 'md-to-html'
                          ? 'Type or paste Markdown here...'
                          : 'Type or paste HTML markup here...'
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition resize-y"
                    />
                  </div>

                  {/* Right: Live Preview or Code Output */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      {markdownDirection === 'md-to-html' ? (
                        <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-[10px] bg-neutral-100/50 dark:bg-neutral-950">
                          <button
                            onClick={() => setMarkdownTab('preview')}
                            className={`px-2 py-0.5 rounded font-medium transition ${
                              markdownTab === 'preview'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                                : 'text-neutral-400'
                            }`}
                          >
                            Live Preview
                          </button>
                          <button
                            onClick={() => setMarkdownTab('raw')}
                            className={`px-2 py-0.5 rounded font-medium transition ${
                              markdownTab === 'raw'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                                : 'text-neutral-400'
                            }`}
                          >
                            Raw HTML
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono uppercase tracking-wider text-[10px]">Markdown Output</span>
                      )}

                      <button
                        onClick={() => copyToClipboard(textOutput)}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {markdownDirection === 'md-to-html' && markdownTab === 'preview' ? (
                      <div
                        className="w-full min-h-[260px] max-h-[380px] overflow-y-auto bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 shadow-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: textOutput || '<span class="text-neutral-400 italic">Preview appears here...</span>' }}
                      />
                    ) : (
                      <textarea
                        rows={12}
                        readOnly
                        value={textOutput}
                        className="w-full bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y"
                      />
                    )}
                  </div>
                </div>

                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.9 CSV ⇄ JSON & Data Table Converter */}
            {activeTool === 'csv-json' && (
              <div className="space-y-6">
                {/* Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Direction switcher */}
                    <div className="inline-flex rounded-xl glass-panel p-1 text-xs shadow-2xs">
                      <button
                        onClick={() => {
                          setCsvMode('csv-to-json');
                          if (textInput && !textInput.trim().startsWith('{') && !textInput.trim().startsWith('[')) {
                            const parsed = parseCsv(textInput, csvDelimiter, csvHasHeader);
                            setCsvParsedResult(parsed);
                            setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
                          csvMode === 'csv-to-json'
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        CSV ➔ JSON
                      </button>
                      <button
                        onClick={() => {
                          setCsvMode('json-to-csv');
                          if (textInput && (textInput.trim().startsWith('{') || textInput.trim().startsWith('['))) {
                            const res = jsonToCsv(textInput, csvDelimiter);
                            if (!res.error) {
                              setTextOutput(res.csv);
                              const parsed = parseCsv(res.csv, csvDelimiter, true);
                              setCsvParsedResult(parsed);
                            }
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
                          csvMode === 'json-to-csv'
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        JSON ➔ CSV
                      </button>
                    </div>

                    {/* Delimiter Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-neutral-500 font-medium">Delimiter:</span>
                      <select
                        value={csvDelimiter}
                        onChange={(e) => {
                          const delim = e.target.value;
                          setCsvDelimiter(delim);
                          if (csvMode === 'csv-to-json' && textInput) {
                            const parsed = parseCsv(textInput, delim, csvHasHeader);
                            setCsvParsedResult(parsed);
                            setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                          } else if (csvMode === 'json-to-csv' && textInput) {
                            const res = jsonToCsv(textInput, delim);
                            if (!res.error) setTextOutput(res.csv);
                          }
                        }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs outline-none font-mono"
                      >
                        <option value=",">Comma (,)</option>
                        <option value="	">Tab (TSV)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>

                    {/* Indentation for JSON */}
                    {csvMode === 'csv-to-json' && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-neutral-500 font-medium">Indent:</span>
                        <select
                          value={csvIndentation}
                          onChange={(e) => {
                            const ind = Number(e.target.value);
                            setCsvIndentation(ind);
                            if (csvParsedResult) {
                              setTextOutput(JSON.stringify(csvParsedResult.rows, null, ind));
                            }
                          }}
                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs outline-none font-mono"
                        >
                          <option value={2}>2 spaces</option>
                          <option value={4}>4 spaces</option>
                          <option value={0}>Compact</option>
                        </select>
                      </div>
                    )}

                    {/* Has Header Checkbox */}
                    {csvMode === 'csv-to-json' && (
                      <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={csvHasHeader}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setCsvHasHeader(val);
                            if (textInput) {
                              const parsed = parseCsv(textInput, csvDelimiter, val);
                              setCsvParsedResult(parsed);
                              setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                            }
                          }}
                          className="rounded text-emerald-500 focus:ring-0"
                        />
                        Header row
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={csvFileInputRef}
                      type="file"
                      accept=".csv,.tsv,.txt,.json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const text = event.target?.result as string;
                          if (text) {
                            setTextInput(text);
                            if (file.name.endsWith('.json')) {
                              setCsvMode('json-to-csv');
                              const res = jsonToCsv(text, csvDelimiter);
                              if (!res.error) {
                                setTextOutput(res.csv);
                                const parsed = parseCsv(res.csv, csvDelimiter, true);
                                setCsvParsedResult(parsed);
                              }
                            } else {
                              setCsvMode('csv-to-json');
                              const isTab = file.name.endsWith('.tsv') || text.includes('\t');
                              const delim = isTab ? '\t' : csvDelimiter;
                              if (isTab) setCsvDelimiter('\t');
                              const parsed = parseCsv(text, delim, csvHasHeader);
                              setCsvParsedResult(parsed);
                              setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                            }
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <button
                      onClick={() => csvFileInputRef.current?.click()}
                      className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium inline-flex items-center gap-1.5 transition"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                    </button>
                    <button
                      onClick={() => {
                        const sample = `id,name,role,department,active\n101,Alex Morgan,Staff Engineer,Infrastructure,true\n102,Sophia Chen,Product Lead,Growth,true\n103,David Miller,Security Analyst,SecOps,false\n104,Elena Rostova,UX Designer,Creative,true\n105,Marcus Vance,Data Scientist,Analytics,true`;
                        setTextInput(sample);
                        setCsvMode('csv-to-json');
                        const parsed = parseCsv(sample, ',', true);
                        setCsvParsedResult(parsed);
                        setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      Load Sample
                    </button>
                  </div>
                </div>

                {/* Editor & Preview Panes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Input Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-mono uppercase tracking-wider text-[10px]">
                        {csvMode === 'csv-to-json' ? 'CSV / TSV Input' : 'JSON Array Input'}
                      </span>
                      <span className="font-mono text-[10px]">
                        {textInput.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={13}
                      value={textInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextInput(val);
                        if (csvMode === 'csv-to-json') {
                          const parsed = parseCsv(val, csvDelimiter, csvHasHeader);
                          setCsvParsedResult(parsed);
                          setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                        } else {
                          const res = jsonToCsv(val, csvDelimiter);
                          if (!res.error) {
                            setTextOutput(res.csv);
                            const parsed = parseCsv(res.csv, csvDelimiter, true);
                            setCsvParsedResult(parsed);
                          }
                        }
                      }}
                      placeholder={
                        csvMode === 'csv-to-json'
                          ? 'Paste CSV or TSV spreadsheet content here...'
                          : 'Paste JSON array of objects here, e.g. [{"id": 1, "name": "Alice"}]'
                      }
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition resize-y"
                    />
                  </div>

                  {/* Right: Output Panes with Table / Code Tabs */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-[10px] bg-neutral-100/50 dark:bg-neutral-950">
                        <button
                          onClick={() => setCsvOutputTab('table')}
                          className={`px-2.5 py-0.5 rounded font-medium transition inline-flex items-center gap-1 ${
                            csvOutputTab === 'table'
                              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                              : 'text-neutral-400'
                          }`}
                        >
                          <Table className="w-3 h-3" />
                          <span>Table Grid</span>
                        </button>
                        <button
                          onClick={() => setCsvOutputTab('code')}
                          className={`px-2.5 py-0.5 rounded font-medium transition inline-flex items-center gap-1 ${
                            csvOutputTab === 'code'
                              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                              : 'text-neutral-400'
                          }`}
                        >
                          <Code2 className="w-3 h-3" />
                          <span>{csvMode === 'csv-to-json' ? 'JSON' : 'CSV'} Code</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (!textOutput) return;
                            const isJson = csvMode === 'csv-to-json';
                            const blob = new Blob([textOutput], {
                              type: isJson ? 'application/json' : 'text/csv;charset=utf-8;',
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = isJson ? 'table-data.json' : 'table-data.csv';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(textOutput)}
                          className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {csvOutputTab === 'table' ? (
                      <div className="w-full min-h-[280px] max-h-[380px] overflow-y-auto bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-xs text-neutral-900 dark:text-neutral-100 shadow-xs flex flex-col justify-between">
                        {csvParsedResult && csvParsedResult.headers.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-medium text-neutral-500 font-mono">
                                {filteredRows.length} rows • {csvParsedResult.headers.length} cols
                              </span>
                              <input
                                type="text"
                                placeholder="Filter table records..."
                                value={tableFilter}
                                onChange={(e) => setTableFilter(e.target.value)}
                                className="text-[11px] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 outline-none w-36 sm:w-44 focus:border-neutral-900 dark:focus:border-neutral-100"
                              />
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-neutral-200/80 dark:border-neutral-800">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-neutral-100 dark:bg-neutral-800/80 sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-700">
                                  <tr>
                                    <th className="py-2 px-3 font-mono text-[10px] text-neutral-400 font-semibold w-8">#</th>
                                    {csvParsedResult.headers.map((h, idx) => (
                                      <th key={idx} className="py-2 px-3 font-semibold text-neutral-800 dark:text-neutral-200 font-mono text-[11px] whitespace-nowrap">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                  {filteredRows.slice(0, 50).map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                                      <td className="py-1.5 px-3 font-mono text-[10px] text-neutral-400 select-none">{rIdx + 1}</td>
                                      {csvParsedResult.headers.map((h, cIdx) => {
                                        const val = row[h];
                                        const isBool = typeof val === 'boolean';
                                        const isNum = typeof val === 'number';
                                        return (
                                          <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap font-mono text-[11px]">
                                            {isBool ? (
                                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${val ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                                                {String(val)}
                                              </span>
                                            ) : isNum ? (
                                              <span className="text-indigo-600 dark:text-indigo-400">{val}</span>
                                            ) : (
                                              <span className="text-neutral-800 dark:text-neutral-200 font-sans">{val !== null && val !== undefined ? String(val) : ''}</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {filteredRows.length > 50 && (
                              <p className="text-[10px] text-neutral-400 italic text-center pt-1">
                                Showing first 50 rows of {filteredRows.length} total rows. Export full dataset via Code tab.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-neutral-400 text-xs flex-1">
                            <Table className="w-8 h-8 mb-2 opacity-40" />
                            <span>No tabular data available. Enter CSV or load a sample.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows={13}
                        readOnly
                        value={textOutput}
                        className="w-full bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y"
                      />
                    )}
                  </div>
                </div>

                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.10 Cryptographic Hash & Checksum Tool */}
            {activeTool === 'hash-calc' && (
              <div className="space-y-6">
                {/* Control bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 text-xs bg-white/60 dark:bg-neutral-900/60">
                      <button
                        onClick={() => {
                          setHashSourceType('text');
                          if (hashTextInput) computeAllHashes(hashTextInput).then(setHashResult);
                        }}
                        className={`px-3 py-1 rounded-md font-medium transition ${
                          hashSourceType === 'text'
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        Text Input
                      </button>
                      <button
                        onClick={() => {
                          setHashSourceType('file');
                          if (hashFile) handleHashFile(hashFile);
                        }}
                        className={`px-3 py-1 rounded-md font-medium transition ${
                          hashSourceType === 'file'
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        File Checksum
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer select-none ml-2">
                      <input
                        type="checkbox"
                        checked={hashUppercase}
                        onChange={(e) => setHashUppercase(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-0"
                      />
                      Uppercase HEX
                    </label>
                  </div>

                  {hashSourceType === 'text' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const sample = 'Multi-Converter: 100% private in-browser utility suite.';
                          setHashTextInput(sample);
                          computeAllHashes(sample).then(setHashResult);
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Load Sample Text
                      </button>
                      <button
                        onClick={() => {
                          setHashTextInput('');
                          setHashResult(null);
                        }}
                        className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        ref={hashFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleHashFile(f);
                        }}
                      />
                      <button
                        onClick={() => hashFileInputRef.current?.click()}
                        className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium inline-flex items-center gap-1.5 transition"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                {hashSourceType === 'text' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-mono uppercase tracking-wider text-[10px]">
                        Input Text String (UTF-8)
                      </span>
                      <span className="font-mono text-[10px]">{hashTextInput.length} chars</span>
                    </div>
                    <textarea
                      rows={3}
                      value={hashTextInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHashTextInput(val);
                      }}
                      placeholder="Type or paste text to compute hashes in real-time..."
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition resize-y"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => hashFileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 rounded-2xl p-6 text-center cursor-pointer transition bg-white/40 dark:bg-neutral-900/30 flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <Fingerprint className="w-8 h-8 text-neutral-400 mb-2" />
                    {hashFile ? (
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {hashFile.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {(hashFile.size / (1024 * 1024)).toFixed(2)} MB • {hashFile.type || 'Binary / Document'}
                        </p>
                        {isHashingFile && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 animate-pulse">
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
                          Executables, disk images, archives, docs (100% in-browser, never uploaded)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Bar */}
                <div className="space-y-1.5 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Verify Against Expected Checksum
                    </span>
                    {hashVerifyInput.trim() && (
                      <span className="text-[11px] font-mono">
                        {(() => {
                          if (!hashResult) return null;
                          const cleanTarget = hashVerifyInput.trim().toLowerCase();
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
                    type="text"
                    value={hashVerifyInput}
                    onChange={(e) => setHashVerifyInput(e.target.value)}
                    placeholder="Paste expected checksum here to verify integrity (e.g. from GitHub release or author)..."
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition"
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
                    const displayVal = hashUppercase ? rawVal.toUpperCase() : rawVal;
                    const isMatched =
                      hashVerifyInput.trim() &&
                      rawVal &&
                      rawVal.toLowerCase() === hashVerifyInput.trim().toLowerCase();

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
                            disabled={!displayVal}
                            onClick={() => {
                              if (!displayVal) return;
                              navigator.clipboard.writeText(displayVal);
                              setHashCopiedAlgo(algo.key);
                              setTimeout(() => setHashCopiedAlgo(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium disabled:opacity-40 cursor-pointer"
                          >
                            {hashCopiedAlgo === algo.key ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{hashCopiedAlgo === algo.key ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-xs break-all text-neutral-800 dark:text-neutral-200 select-all bg-neutral-100/70 dark:bg-neutral-950/70 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50">
                          {displayVal || <span className="text-neutral-400 italic">Enter input to generate...</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.11 Unit & Developer Measurement Converter */}
            {activeTool === 'unit-convert' && (
              <div className="space-y-6">
                {/* Mode Sub-Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-neutral-100/60 dark:bg-neutral-850/60 border border-neutral-200/80 dark:border-neutral-800">
                  <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 text-xs bg-white/60 dark:bg-neutral-900/60">
                    <button
                      onClick={() => setUnitCategory('css')}
                      className={`px-3 py-1.5 rounded-md font-medium transition inline-flex items-center gap-1.5 ${
                        unitCategory === 'css'
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>CSS px ⇄ rem</span>
                    </button>
                    <button
                      onClick={() => setUnitCategory('storage')}
                      className={`px-3 py-1.5 rounded-md font-medium transition inline-flex items-center gap-1.5 ${
                        unitCategory === 'storage'
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Data Storage</span>
                    </button>
                    <button
                      onClick={() => setUnitCategory('time')}
                      className={`px-3 py-1.5 rounded-md font-medium transition inline-flex items-center gap-1.5 ${
                        unitCategory === 'time'
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
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

                {/* Sub-tool 1: CSS Typography (px ⇄ rem ⇄ em ⇄ pt) */}
                {unitCategory === 'css' && (
                  <div className="space-y-6">
                    {/* Base font size configuration */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Base Root Font Size (1rem):</span>
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="64"
                            value={cssBaseSize}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value) || 16);
                              setCssBaseSize(val);
                              setCssResults(convertCssUnits(cssPx, 'px', val));
                            }}
                            className="w-16 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs font-mono text-center outline-none"
                          />
                          <span className="font-mono text-neutral-400">px</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCssBaseSize(16);
                          setCssResults(convertCssUnits(cssPx, 'px', 16));
                        }}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        Reset to default (16px)
                      </button>
                    </div>

                    {/* Dual bidirectional input grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Pixels (px) */}
                      <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
                        <label className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                          Pixels (px)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={cssResults.px}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setCssPx(val);
                              setCssResults(convertCssUnits(val, 'px', cssBaseSize));
                            }}
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">px</span>
                        </div>
                      </div>

                      {/* Root EM (rem) */}
                      <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
                        <label className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                          Root EM (rem)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={cssResults.rem}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setCssResults(convertCssUnits(val, 'rem', cssBaseSize));
                              setCssPx(val * cssBaseSize);
                            }}
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">rem</span>
                        </div>
                      </div>

                      {/* Relative EM (em) */}
                      <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
                        <label className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                          Relative EM (em)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={cssResults.em}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setCssResults(convertCssUnits(val, 'em', cssBaseSize));
                              setCssPx(val * cssBaseSize);
                            }}
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">em</span>
                        </div>
                      </div>

                      {/* Points (pt) */}
                      <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
                        <label className="text-[11px] font-mono uppercase text-neutral-500 font-semibold block">
                          Points (pt)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="any"
                            value={cssResults.pt}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setCssResults(convertCssUnits(val, 'pt', cssBaseSize));
                              setCssPx((val * 96) / 72);
                            }}
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm font-semibold outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">pt</span>
                        </div>
                      </div>
                    </div>

                    {/* Common Font Size Preset Chips */}
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
                              onClick={() => {
                                setCssPx(pxVal);
                                setCssResults(convertCssUnits(pxVal, 'px', cssBaseSize));
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
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

                    {/* CSS Code Generator Snippet */}
                    <div className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex items-center justify-between">
                      <div className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
                        <span className="text-emerald-600 dark:text-emerald-400">font-size:</span>{' '}
                        {cssResults.rem}rem; <span className="text-neutral-400">/* {cssResults.px}px */</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`font-size: ${cssResults.rem}rem; /* ${cssResults.px}px */`);
                          setUnitCopiedKey('css-snippet');
                          setTimeout(() => setUnitCopiedKey(null), 2000);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium cursor-pointer"
                      >
                        {unitCopiedKey === 'css-snippet' ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{unitCopiedKey === 'css-snippet' ? 'Copied' : 'Copy CSS'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-tool 2: Data Storage (Bytes, KB, MB, GB, TB) */}
                {unitCategory === 'storage' && (
                  <div className="space-y-6">
                    {/* Amount & Unit Selector Input */}
                    <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex flex-wrap items-center gap-3">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Convert Data Value:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={storageAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setStorageAmount(val);
                          setStorageResults(convertDataStorage(val, storageUnit));
                        }}
                        className="w-36 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 font-mono text-sm font-semibold outline-none"
                      />
                      <select
                        value={storageUnit}
                        onChange={(e) => {
                          const u = e.target.value as typeof storageUnit;
                          setStorageUnit(u);
                          setStorageResults(convertDataStorage(storageAmount, u));
                        }}
                        className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 font-mono text-sm font-semibold outline-none"
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

                    {/* Breakdown grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Decimal SI Standards */}
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
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(item.val));
                                    setUnitCopiedKey(item.key);
                                    setTimeout(() => setUnitCopiedKey(null), 2000);
                                  }}
                                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                                >
                                  {unitCopiedKey === item.key ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Binary IEC Standards */}
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
                                  onClick={() => {
                                    navigator.clipboard.writeText(String(item.val));
                                    setUnitCopiedKey(item.key);
                                    setTimeout(() => setUnitCopiedKey(null), 2000);
                                  }}
                                  className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                                >
                                  {unitCopiedKey === item.key ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tool 3: Unix Timestamp & Date */}
                {unitCategory === 'time' && (
                  <div className="space-y-6">
                    {/* Timestamp Input & "Now" Button */}
                    <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                          Unix Timestamp or ISO Date:
                        </label>
                        <button
                          onClick={() => {
                            const nowSec = Math.floor(Date.now() / 1000);
                            setTimeInputVal(String(nowSec));
                            setTimeResults(parseTimestampOrDate(nowSec));
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Set to Current Time (Now)</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={timeInputVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTimeInputVal(val);
                          setTimeResults(parseTimestampOrDate(val));
                        }}
                        placeholder="Enter Unix seconds, milliseconds, or ISO date string (e.g. 1773919200)..."
                        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5 font-mono text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                      />
                    </div>

                    {/* Converted timestamp cards */}
                    {timeResults ? (
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
                              onClick={() => {
                                navigator.clipboard.writeText(item.val);
                                setUnitCopiedKey(item.key);
                                setTimeout(() => setUnitCopiedKey(null), 2000);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                            >
                              {unitCopiedKey === item.key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-400 text-xs">
                        Invalid date or timestamp. Please enter a valid number or ISO date.
                      </div>
                    )}
                  </div>
                )}

                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.12 Dedicated Unit Converters (Length, Mass, Area, Volume, Temperature, Speed, Time) */}
            {(activeTool === 'length-convert' ||
              activeTool === 'mass-convert' ||
              activeTool === 'area-convert' ||
              activeTool === 'volume-convert' ||
              activeTool === 'temperature-convert' ||
              activeTool === 'speed-convert' ||
              activeTool === 'time-convert') && (
              <div className="space-y-6">
                <UnitConverterTool
                  key={activeTool}
                  initialCategory={
                    activeTool === 'length-convert'
                      ? 'length'
                      : activeTool === 'mass-convert'
                      ? 'mass'
                      : activeTool === 'area-convert'
                      ? 'area'
                      : activeTool === 'volume-convert'
                      ? 'volume'
                      : activeTool === 'temperature-convert'
                      ? 'temperature'
                      : activeTool === 'speed-convert'
                      ? 'speed'
                      : 'time'
                  }
                  onCategoryChange={(cat) => {
                    const toolMap: Record<string, ToolType> = {
                      length: 'length-convert',
                      mass: 'mass-convert',
                      area: 'area-convert',
                      volume: 'volume-convert',
                      temperature: 'temperature-convert',
                      speed: 'speed-convert',
                      time: 'time-convert',
                    };
                    if (toolMap[cat]) {
                      handleToolSelect(toolMap[cat]);
                    }
                  }}
                />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.13 Numerical System & Radix Converter */}
            {activeTool === 'number-system' && (
              <div className="space-y-6">
                <NumberSystemConverter />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.14 Philippine Income Tax Calculator (TRAIN Law) */}
            {activeTool === 'income-tax-ph' && (
              <div className="space-y-6">
                <PhilippineTaxCalculator />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.15 Mortgage & Loan Amortization Calculator */}
            {activeTool === 'mortgage-calc' && (
              <div className="space-y-6">
                <MortgageCalculator />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.16 Electricity & Sub-meter Splitter */}
            {activeTool === 'electricity-calc' && (
              <div className="space-y-6">
                <ElectricityCalculator />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.17 BMI & Body Health Calculator */}
            {activeTool === 'bmi-calc' && (
              <div className="space-y-6">
                <BmiCalculator />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.18 Philippine GPA / GWA College Grade Calculator */}
            {activeTool === 'gwa-calc' && (
              <div className="space-y-6">
                <PhilippineGwaCalculator />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.19 Audio Converter & Extractor */}
            {activeTool === 'audio-convert' && (
              <div className="space-y-6">
                <AudioConverterTool />
                <AdSlot placement="post-conversion" />
              </div>
            )}

            {/* 2.20 Video Converter & Transcoder */}
            {activeTool === 'video-convert' && (
              <div className="space-y-6">
                <VideoConverterTool />
                <AdSlot placement="post-conversion" />
              </div>
            )}
          </section>

          {/* 3.2 In-Feed Section Sponsor */}
          <AdSlot placement="between-content" />

          {/* Privacy & Educational Note */}
          <div className="rounded-3xl glass-panel p-6 sm:p-7 text-xs text-neutral-500 dark:text-neutral-400 space-y-3 relative overflow-hidden border border-emerald-500/20 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-neutral-950 dark:text-neutral-100 text-sm tracking-tight">
                  Client-Side Architecture & Security
                </h3>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Read Full Privacy Policy</span>
              </button>
            </div>
            <p className="leading-relaxed relative z-10">
              Every operation runs locally inside your browser sandbox via JavaScript, WebAssembly, and Canvas Web APIs. Neither your images, documents, nor secret text strings are uploaded to any server. This guarantees zero network latency and 100% data sovereignty.
            </p>
          </div>
        </div>
      </main>
      )}

      {/* Minimalist Glass Footer */}
      <footer role="contentinfo" className="border-t border-neutral-200/60 dark:border-white/10 glass-panel py-8 px-4 text-xs text-neutral-500 dark:text-neutral-400 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <button
              type="button"
              onClick={navigateToHome}
              title="Isal.in Multi-Converter - Go to Homepage"
              className="cursor-pointer transition hover:opacity-90 active:scale-95 focus:outline-none"
              aria-label="Isal.in Multi-Converter Home"
            >
              <BrandLogo size="sm" showWordmark={true} />
            </button>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Isalin ang lahat. Convert anything.
            </span>
            <span className="hidden md:inline text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <span className="hidden md:inline font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
              Zero-Upload Developer & Philippine Utility Suite
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="mailto:crischarlesgarcia345@gmail.com?subject=Isal.in%20Suggestion%20or%20Issue%20Report&body=Hi!%20I%20have%20a%20suggestion%20or%20would%20like%20to%20report%20an%20issue%20with%20Isal.in:%0A%0A-%20Tool%20/%20Category:%0A-%20Details:%0A"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
              aria-label="Send suggestion or report an issue via email to crischarlesgarcia345@gmail.com"
              title="Have a suggestion or found an issue? Send us an email!"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Suggestions / Issues</span>
            </a>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Ethical Ads • No Tracking
            </span>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition cursor-pointer"
              aria-haspopup="dialog"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        tools={TOOLS}
        onSelectTool={handlePaletteSelectTool}
      />
      <HistoryPresetsDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        onDeleteHistoryItem={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
        onRestoreHistory={handleRestoreHistory}
        presets={PRESETS}
      />

      {/* Window-wide Drag and Drop Overlay */}
      {isDraggingWindow && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center pointer-events-none transition-all">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border-2 border-dashed border-white/50 flex items-center justify-center mb-4 scale-110">
            <UploadCloud className="w-10 h-10 text-white animate-bounce" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Drop files to convert</h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-sm">
            Files are loaded directly into your client-side browser sandbox.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
