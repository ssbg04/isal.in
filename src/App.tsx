import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FolderArchive,
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
} from 'lucide-react';
import { AdSlot } from './components/AdSlot';
import { CategoryFilter } from './components/CategoryFilter';
import { PrivacyModal } from './components/PrivacyModal';
import { BrandLogo } from './components/BrandLogo';
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

type Category = 'media' | 'developer' | 'security';

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
    shortDesc: 'WebP, PNG, JPG with compression and dimension scaling',
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
    title: 'Unit & Dev Converter',
    category: 'developer',
    shortDesc: 'CSS px ⇄ rem typography, byte storage scaling, and Unix epoch timestamp decoder',
    badge: 'Utility',
  },
];

const CATEGORIES: { id: Category; label: string; count: number }[] = [
  { id: 'media', label: 'Media & Documents', count: 2 },
  { id: 'developer', label: 'Data & Formats', count: 7 },
  { id: 'security', label: 'Encoding & Security', count: 2 },
];

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

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [targetImageFormat, setTargetImageFormat] = useState<'image/webp' | 'image/png' | 'image/jpeg'>('image/webp');
  const [imageQuality, setImageQuality] = useState<number>(0.85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [batchResults, setBatchResults] = useState<ConversionResult[]>([]);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isDraggingWindow, setIsDraggingWindow] = useState<boolean>(false);
  const [stripExif, setStripExif] = useState<boolean>(true);
  const dragCounter = useRef<number>(0);

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
    if (currentToolMeta) {
      document.title = `${currentToolMeta.title} — Multi-Converter`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `${currentToolMeta.shortDesc}. Fast, 100% private in-browser tool with zero server uploads.`
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
  }, [activeTool, currentToolMeta]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ToolType;
      if (TOOLS.some((t) => t.id === hash)) {
        setActiveTool(hash);
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

  const handleToolSelect = useCallback((toolId: ToolType) => {
    setActiveTool(toolId);
    setFiles([]);
    setResult(null);
    setBatchResults([]);
    setErrorMsg(null);
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
  }, [csvIndentation]);

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
  };

  const handleConvert = useCallback(async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      if (activeTool === 'image-convert') {
        if (!files.length) throw new Error('Please select at least one image file to proceed.');
        const convertedItems: ConversionResult[] = [];
        for (const file of files) {
          const res = await convertImage(file, targetImageFormat, imageQuality);
          convertedItems.push(res);
        }
        setBatchResults(convertedItems);
        setResult(convertedItems[0]);
      } else if (activeTool === 'images-to-pdf') {
        if (!files.length) throw new Error('Select at least one image to compile.');
        const res = await convertImagesToPdf(files);
        setResult(res);
        setBatchResults([res]);
      } else if (activeTool === 'json-yaml') {
        const out = await convertJsonYaml(textInput, jsonDirection);
        setTextOutput(out);
      } else if (activeTool === 'base64') {
        const out = processBase64(textInput, base64Mode);
        setTextOutput(out);
      } else if (activeTool === 'url-encode') {
        const out = processUrlEncode(textInput, urlMode);
        setTextOutput(out);
      } else if (activeTool === 'uuid') {
        const uuids = generateUUIDs(uuidCount);
        setTextOutput(uuids.join('\n'));
      } else if (activeTool === 'markdown-html') {
        if (markdownDirection === 'md-to-html') {
          const out = markdownToHtml(textInput);
          setTextOutput(out);
        } else {
          const out = htmlToMarkdown(textInput);
          setTextOutput(out);
        }
      } else if (activeTool === 'csv-json') {
        if (!textInput.trim()) throw new Error('Please provide CSV or JSON data to convert.');
        if (csvMode === 'csv-to-json') {
          const parsed = parseCsv(textInput, csvDelimiter, csvHasHeader);
          if (parsed.error) throw new Error(parsed.error);
          setCsvParsedResult(parsed);
          setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
        } else {
          const res = jsonToCsv(textInput, csvDelimiter);
          if (res.error) throw new Error(res.error);
          setTextOutput(res.csv);
          const parsed = parseCsv(res.csv, csvDelimiter, true);
          setCsvParsedResult(parsed);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during conversion.');
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
  ]);

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Minimalist Top App Bar */}
      <header className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showWordmark={true} />
            <span className="hidden md:inline-block text-xs text-neutral-400 dark:text-neutral-500 font-mono border-l border-neutral-200 dark:border-neutral-800 pl-3 py-0.5">
              client-local
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Install PWA Button */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                title="Install Multi-Converter on your device"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
              <Shield className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
              <span>Zero-Upload Guarantee</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle Theme"
              className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Offline Status Notification Banner */}
      {!isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Offline Mode Active:</strong> You have lost internet connection, but all converters and encoders remain <strong>100% operational</strong> locally in your browser.
          </span>
        </aside>
      )}

      {/* 3.1 Header Advertisement (Subtle & Non-Intrusive) */}
      <section className="px-4 pt-4 sm:pt-6">
        <AdSlot placement="header" />
      </section>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Categorized Tool Drawer & Catalog (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Filter */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalToolsCount={TOOLS.length}
          />

          {/* Quick Search Tool Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="tool-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tools... (Press '/' to search)"
              className="w-full bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-xl pl-8 pr-7 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-neutral-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Categorized Tool Cards List */}
          <div className="space-y-2">
            {filteredTools.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 text-xs text-neutral-400">
                No matching tools found for "{searchQuery}".
              </div>
            ) : (
              filteredTools.map((tool) => {
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolSelect(tool.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-neutral-900 dark:border-neutral-100 bg-white dark:bg-neutral-900 shadow-xs'
                        : 'border-neutral-200/80 dark:border-neutral-850 bg-white/60 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700'
                        }`}
                      >
                        {tool.id === 'image-convert' && <FileImage className="w-4 h-4" />}
                        {tool.id === 'images-to-pdf' && <FileText className="w-4 h-4" />}
                        {tool.id === 'json-yaml' && <ArrowRightLeft className="w-4 h-4" />}
                        {tool.id === 'base64' && <Code2 className="w-4 h-4" />}
                        {tool.id === 'url-encode' && <Link className="w-4 h-4" />}
                        {tool.id === 'uuid' && <Hash className="w-4 h-4" />}
                        {tool.id === 'color-convert' && <Palette className="w-4 h-4" />}
                        {tool.id === 'markdown-html' && <BookOpen className="w-4 h-4" />}
                        {tool.id === 'csv-json' && <Table className="w-4 h-4" />}
                        {tool.id === 'hash-calc' && <Fingerprint className="w-4 h-4" />}
                        {tool.id === 'unit-convert' && <Ruler className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs sm:text-sm truncate text-neutral-900 dark:text-neutral-100">
                            {tool.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {tool.shortDesc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-neutral-900 dark:text-white translate-x-0.5'
                          : 'text-neutral-400 opacity-40 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* 3.3 Sticky Sidebar Sponsor Card */}
          <div className="hidden lg:block pt-3">
            <AdSlot placement="sidebar" />
          </div>
        </div>

        {/* Right Column: Active Utility Workspace (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Tool Header Badge */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60">
                    {currentToolMeta.badge}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                    {currentToolMeta.title}
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {currentToolMeta.shortDesc}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={handleShareTool}
                  title="Copy link to this specific tool"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleToolSelect(activeTool)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mt-4 flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Media Tools (Image / PDF) Workspace */}
            {(activeTool === 'image-convert' || activeTool === 'images-to-pdf') && (
              <div className="mt-5 space-y-5">
                {/* Drag & Drop Canvas */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                  className="group border border-dashed border-neutral-300 dark:border-neutral-750 hover:border-neutral-900 dark:hover:border-neutral-400 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Drop your {activeTool === 'image-convert' ? 'image' : 'images'} here, or{' '}
                    <span className="underline underline-offset-4 decoration-neutral-400">browse files</span>
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Free Limit: Up to {APP_LIMITS.free.maxSingleFileMB}MB per file • Processed 100% locally
                  </p>
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple={true}
                    accept={activeTool === 'image-convert' ? 'image/*' : 'image/png,image/jpeg'}
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>

                {/* Selected Files Preview List */}
                {files.length > 0 && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 p-3.5">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
                      Selected File{files.length > 1 ? 's' : ''} ({files.length})
                    </div>
                    <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                      {files.map((f, i) => (
                        <li key={i} className="flex items-center justify-between py-1 px-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50">
                          <span className="truncate max-w-[240px] sm:max-w-md font-mono">{f.name}</span>
                          <span className="text-neutral-400 font-mono">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional Settings for Image Converter */}
                {activeTool === 'image-convert' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Target Format
                      </label>
                      <select
                        value={targetImageFormat}
                        onChange={(e) => setTargetImageFormat(e.target.value as any)}
                        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                      >
                        <option value="image/webp">WebP (Optimized / Lightest)</option>
                        <option value="image/png">PNG (Lossless)</option>
                        <option value="image/jpeg">JPEG (Standard Photo)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        <span>Quality</span>
                        <span className="font-mono">{Math.round(imageQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                        className="w-full accent-neutral-900 dark:accent-neutral-100 h-2 mt-2"
                      />
                    </div>

                    {/* EXIF Privacy Stripper Option */}
                    <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/30">
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                            Strip EXIF & GPS Metadata
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Removes private camera, date, and geolocation tags from output image.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={stripExif}
                        onChange={(e) => setStripExif(e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 dark:text-white accent-neutral-900 dark:accent-neutral-100 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Conversion Trigger Button */}
                <button
                  disabled={!files.length || isProcessing}
                  onClick={handleConvert}
                  className="w-full py-3 bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm rounded-xl transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>
                    {isProcessing
                      ? 'Processing in Browser...'
                      : activeTool === 'image-convert'
                      ? `Convert ${files.length > 1 ? `${files.length} Images` : 'Image'}`
                      : 'Merge into PDF'}
                  </span>
                  <kbd className="hidden sm:inline-block text-[10px] opacity-60 font-mono px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/20">
                    Ctrl+↵
                  </kbd>
                </button>

                {/* Batch Image Conversion Results */}
                {batchResults.length > 1 && activeTool === 'image-convert' && (
                  <div className="mt-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Batch Output ({batchResults.length} files)
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Converted to {targetImageFormat.split('/')[1].toUpperCase()} locally in-browser
                        </p>
                      </div>

                      {/* Total Savings Badge */}
                      {(() => {
                        const totalOrig = batchResults.reduce((sum, item) => sum + (item.originalSizeBytes || 0), 0);
                        const totalNew = batchResults.reduce((sum, item) => sum + (item.sizeBytes || 0), 0);
                        const diff = totalOrig - totalNew;
                        const pct = totalOrig > 0 ? Math.round((diff / totalOrig) * 100) : 0;
                        if (pct > 0) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                              Saved {pct}% ({(diff / (1024 * 1024)).toFixed(2)} MB less)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Download All as ZIP Button */}
                    <button
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <FolderArchive className="w-4 h-4" />
                      <span>{isZipping ? 'Archiving files into ZIP...' : 'Download All as .ZIP Archive'}</span>
                    </button>

                    {/* Itemized Converted Files List */}
                    <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                      {batchResults.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-900/70 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.downloadUrl && (
                              <img
                                src={item.downloadUrl}
                                alt="thumb"
                                className="w-8 h-8 rounded object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                              />
                            )}
                            <div className="min-w-0 truncate">
                              <p className="font-mono truncate text-neutral-800 dark:text-neutral-200 font-medium">
                                {item.filename}
                              </p>
                              {item.sizeBytes && (
                                <p className="text-[10px] text-neutral-400 font-mono">
                                  {(item.sizeBytes / 1024).toFixed(1)} KB
                                  {item.originalSizeBytes && item.sizeBytes < item.originalSizeBytes && (
                                    <span className="text-emerald-500 ml-1.5 font-semibold">
                                      (-{Math.round(((item.originalSizeBytes - item.sizeBytes) / item.originalSizeBytes) * 100)}%)
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>

                          <a
                            href={item.downloadUrl}
                            download={item.filename}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition shrink-0 ml-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </div>
                      ))}
                    </div>

                    <AdSlot placement="post-conversion" />
                  </div>
                )}

                {/* Single Result Section (for Single Image or PDF) */}
                {result && (batchResults.length <= 1 || activeTool === 'images-to-pdf') && (
                  <div className="mt-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono truncate text-neutral-900 dark:text-neutral-200 max-w-[200px] sm:max-w-xs">
                          {result.filename}
                        </span>
                        {result.sizeBytes && (
                          <span className="font-mono text-neutral-500 shrink-0">
                            {(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        )}
                      </div>

                      {/* Compression Savings Badge */}
                      {files.length > 0 && result.sizeBytes && (() => {
                        const originalBytes = files.reduce((acc, f) => acc + f.size, 0);
                        const diff = originalBytes - result.sizeBytes;
                        const pct = Math.round((diff / originalBytes) * 100);
                        if (pct > 0) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              Saved {pct}% ({(diff / (1024 * 1024)).toFixed(2)} MB less)
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Image Preview Thumbnail */}
                    {activeTool === 'image-convert' && result.downloadUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 flex items-center justify-center p-2 max-h-44">
                        <img
                          src={result.downloadUrl}
                          alt="Converted file preview"
                          className="max-h-40 w-auto object-contain rounded"
                        />
                      </div>
                    )}

                    <a
                      href={result.downloadUrl}
                      download={result.filename}
                      className="w-full py-2.5 px-4 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </a>

                    {/* 3.4 Non-Intrusive Post-Conversion Sponsor */}
                    <AdSlot placement="post-conversion" />
                  </div>
                )}
              </div>
            )}

            {/* Developer Utility Tools Workspace */}
            {['json-yaml', 'base64', 'url-encode', 'uuid'].includes(activeTool) && (
              <div className="mt-5 space-y-4">
                {/* Mode Selectors */}
                <div className="flex flex-wrap items-center gap-3">
                  {activeTool === 'json-yaml' && (
                    <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs bg-neutral-100/50 dark:bg-neutral-950">
                      <button
                        onClick={() => setJsonDirection('json-to-yaml')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          jsonDirection === 'json-to-yaml'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        JSON → YAML
                      </button>
                      <button
                        onClick={() => setJsonDirection('yaml-to-json')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          jsonDirection === 'yaml-to-json'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        YAML → JSON
                      </button>
                    </div>
                  )}

                  {activeTool === 'base64' && (
                    <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs bg-neutral-100/50 dark:bg-neutral-950">
                      <button
                        onClick={() => setBase64Mode('encode')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          base64Mode === 'encode'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        Encode
                      </button>
                      <button
                        onClick={() => setBase64Mode('decode')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          base64Mode === 'decode'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        Decode
                      </button>
                    </div>
                  )}

                  {activeTool === 'url-encode' && (
                    <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs bg-neutral-100/50 dark:bg-neutral-950">
                      <button
                        onClick={() => setUrlMode('encode')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          urlMode === 'encode'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        Encode
                      </button>
                      <button
                        onClick={() => setUrlMode('decode')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                          urlMode === 'decode'
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                            : 'text-neutral-500'
                        }`}
                      >
                        Decode
                      </button>
                    </div>
                  )}

                  {activeTool === 'uuid' && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-neutral-500">Count:</span>
                      <select
                        value={uuidCount}
                        onChange={(e) => setUuidCount(parseInt(e.target.value))}
                        className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 outline-none"
                      >
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Text Input Area */}
                {activeTool !== 'uuid' && (
                  <div>
                    <textarea
                      rows={6}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste text, JSON, or code string here..."
                      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition resize-y"
                    />
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  className="w-full py-2.5 bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 font-medium text-xs sm:text-sm rounded-xl transition hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <span>{activeTool === 'uuid' ? 'Generate UUIDs' : 'Transform Input'}</span>
                  <kbd className="hidden sm:inline-block text-[10px] opacity-60 font-mono px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/20">
                    Ctrl+↵
                  </kbd>
                </button>

                {/* Text Output Result */}
                {textOutput && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                        Result
                      </span>
                      <button
                        onClick={() => copyToClipboard(textOutput)}
                        className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition font-medium"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      readOnly
                      value={textOutput}
                      className="w-full bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 font-mono text-xs sm:text-sm text-neutral-900 dark:text-neutral-200 outline-none resize-y"
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
                    <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 text-xs bg-white/60 dark:bg-neutral-900/60">
                      <button
                        onClick={() => {
                          setCsvMode('csv-to-json');
                          if (textInput && !textInput.trim().startsWith('{') && !textInput.trim().startsWith('[')) {
                            const parsed = parseCsv(textInput, csvDelimiter, csvHasHeader);
                            setCsvParsedResult(parsed);
                            setTextOutput(JSON.stringify(parsed.rows, null, csvIndentation));
                          }
                        }}
                        className={`px-3 py-1 rounded-md font-medium transition ${
                          csvMode === 'csv-to-json'
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                            : 'text-neutral-500'
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
                        className={`px-3 py-1 rounded-md font-medium transition ${
                          csvMode === 'json-to-csv'
                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                            : 'text-neutral-500'
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
          </div>

          {/* 3.2 In-Feed Section Sponsor */}
          <AdSlot placement="between-content" />

          {/* Privacy & Educational Note */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 p-5 sm:p-6 text-xs text-neutral-500 dark:text-neutral-400 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                Architecture & Security
              </h3>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Read Full Privacy Policy
              </button>
            </div>
            <p className="leading-relaxed">
              Every operation runs locally inside your browser sandbox via JavaScript and Web APIs. Neither your images,
              documents, nor secret text strings are uploaded to any server. This guarantees zero latency and 100% data privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60 py-6 px-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showWordmark={true} />
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">•</span>
            <span className="hidden sm:inline">Client-Side Utility Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ethical Ads • No Tracking</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white underline font-medium transition cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

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
