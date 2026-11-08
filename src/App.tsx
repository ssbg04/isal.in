import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  FileImage,
  FileText,
  Code2,
  ArrowRightLeft,
  Link,
  Hash,
  Check,
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
  Clipboard,
  Sun,
  Moon,
  Shield,
  ChevronRight,
  UploadCloud,
} from 'lucide-react';

import { HomePage } from './components/HomePage';
import { AdSlot } from './components/AdSlot';
import { CategoryFilter } from './components/CategoryFilter';
import { PrivacyModal } from './components/PrivacyModal';
import { BrandLogo } from './components/BrandLogo';
import { CommandPalette } from './components/CommandPalette';
import {
  HistoryPresetsDrawer,
  type HistoryItem,
} from './components/HistoryPresetsDrawer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { useTheme } from './hooks/useTheme';
import { useConversionHistory } from './hooks/useConversionHistory';
import { useToolRouting } from './hooks/useToolRouting';
import { buildPresets } from './config/presets';
import { TOOLS, CATEGORIES, type Category } from './config/tools';
import type { ToolType } from './services/conversionService';

// Lazy-loaded workspace modules for optimal code splitting
const ImageConverterWorkspace = lazy(() => import('./components/tools/ImageConverterWorkspace').then((m) => ({ default: m.ImageConverterWorkspace })));
const CodeDataWorkspace = lazy(() => import('./components/tools/CodeDataWorkspace').then((m) => ({ default: m.CodeDataWorkspace })));
const UuidGeneratorWorkspace = lazy(() => import('./components/tools/UuidGeneratorWorkspace').then((m) => ({ default: m.UuidGeneratorWorkspace })));
const ColorConverterWorkspace = lazy(() => import('./components/tools/ColorConverterWorkspace').then((m) => ({ default: m.ColorConverterWorkspace })));
const MarkdownPreviewWorkspace = lazy(() => import('./components/tools/MarkdownPreviewWorkspace').then((m) => ({ default: m.MarkdownPreviewWorkspace })));
const CsvJsonTableWorkspace = lazy(() => import('./components/tools/CsvJsonTableWorkspace').then((m) => ({ default: m.CsvJsonTableWorkspace })));
const HashCalculatorWorkspace = lazy(() => import('./components/tools/HashCalculatorWorkspace').then((m) => ({ default: m.HashCalculatorWorkspace })));
const CssUnitsWorkspace = lazy(() => import('./components/tools/CssUnitsWorkspace').then((m) => ({ default: m.CssUnitsWorkspace })));

// Existing calculator & media tools
const UnitConverterTool = lazy(() => import('./components/tools/UnitConverterTool').then((m) => ({ default: m.UnitConverterTool })));
const NumberSystemConverter = lazy(() => import('./components/tools/NumberSystemConverter').then((m) => ({ default: m.NumberSystemConverter })));
const PhilippineTaxCalculator = lazy(() => import('./components/tools/PhilippineTaxCalculator').then((m) => ({ default: m.PhilippineTaxCalculator })));
const MortgageCalculator = lazy(() => import('./components/tools/MortgageCalculator').then((m) => ({ default: m.MortgageCalculator })));
const ElectricityCalculator = lazy(() => import('./components/tools/ElectricityCalculator').then((m) => ({ default: m.ElectricityCalculator })));
const BmiCalculator = lazy(() => import('./components/tools/BmiCalculator').then((m) => ({ default: m.BmiCalculator })));
const PhilippineGwaCalculator = lazy(() => import('./components/tools/PhilippineGwaCalculator').then((m) => ({ default: m.PhilippineGwaCalculator })));
const AudioConverterTool = lazy(() => import('./components/tools/AudioConverterTool').then((m) => ({ default: m.AudioConverterTool })));
const VideoConverterTool = lazy(() => import('./components/tools/VideoConverterTool').then((m) => ({ default: m.VideoConverterTool })));
const PdfConverterTool = lazy(() => import('./components/tools/PdfConverterTool').then((m) => ({ default: m.PdfConverterTool })));
const PasteDownloadTool = lazy(() => import('./components/tools/PasteDownloadTool').then((m) => ({ default: m.PasteDownloadTool })));

const getToolCategoryColor = (_category: Category, isSelected: boolean) => {
  if (isSelected) {
    return 'bg-amber-500 text-neutral-950 font-bold shadow-sm shadow-amber-500/20';
  }
  return 'glass-panel text-neutral-700 dark:text-neutral-300 border border-neutral-300/80 dark:border-white/10 hover:border-amber-500/40 hover:text-neutral-950 dark:hover:text-white';
};

const ToolLoadingFallback = () => (
  <div role="status" aria-live="polite" className="glass-panel rounded-2xl p-8 text-center text-sm text-neutral-500 animate-pulse">
    Loading tool…
  </div>
);

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const { history, addHistoryItem, clearHistory, deleteHistoryItem } = useConversionHistory();
  const { activeTool, setActiveTool, viewMode, setViewMode, currentToolMeta, selectTool, navigateToHome } = useToolRouting();

  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isDraggingWindow, setIsDraggingWindow] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const activeToolButtonRef = useRef<HTMLButtonElement>(null);

  // Keep active tool in view inside sidebar on desktop
  useEffect(() => {
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

  // Online / Offline listeners & PWA install prompt
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
    const url = `${window.location.origin}/${activeTool}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleToolSelect = useCallback((toolId: ToolType) => {
    selectTool(toolId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById('tool-workspace');
        if (el) {
          const headerOffset = 76;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }, 70);
    }
  }, [selectTool]);

  const handlePaletteSelectTool = useCallback(
    (toolId: ToolType) => {
      handleToolSelect(toolId);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    },
    [handleToolSelect]
  );

  const handleRestoreHistory = useCallback(
    (item: HistoryItem) => {
      handleToolSelect(item.toolId);
      setTimeout(() => {
        document.getElementById('tool-workspace')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    },
    [handleToolSelect]
  );

  const presets = useMemo(() => {
    return buildPresets({
      onSelectTool: handleToolSelect,
    });
  }, [handleToolSelect]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('tool-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window-wide drag-and-drop listener
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
        const first = incoming[0];
        if (incoming.some((f) => f.type.startsWith('image/'))) {
          setActiveTool('image-convert');
          setViewMode('tool');
        } else if (first && (first.name.endsWith('.csv') || first.name.endsWith('.tsv') || first.name.endsWith('.json'))) {
          setActiveTool('csv-json');
          setViewMode('tool');
        } else {
          setActiveTool('hash-calc');
          setViewMode('tool');
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
  }, [setActiveTool, setViewMode]);

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toolTitle = currentToolMeta?.title ?? 'Tool Workspace';
  const toolDesc = currentToolMeta?.shortDesc ?? 'Convert and transform files safely in your browser.';
  const toolBadge = currentToolMeta?.badge ?? 'TOOL';
  const toolCategory = currentToolMeta?.category ?? 'utilities';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#tool-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-500 focus:text-neutral-950 focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
      >
        Skip to main converter
      </a>

      {/* Minimalist Ambient Aura */}
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
              title="Isalin Multi-Converter - Go to Homepage"
              className="flex items-center gap-2 cursor-pointer transition hover:opacity-90 active:scale-95 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
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

            {/* Mobile History Button */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              aria-label={`Open activity history (${history.length > 9 ? '9+' : history.length} items saved)`}
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
              onClick={toggleTheme}
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
            onSelectTool={(toolId) => {
              handleToolSelect(toolId);
            }}
            onDropFiles={(droppedFiles) => {
              const first = droppedFiles[0];
              if (!first) return;
              const name = first.name.toLowerCase();
              if (first.type.startsWith('image/')) {
                handleToolSelect('image-convert');
              } else if (first.type.startsWith('audio/')) {
                handleToolSelect('audio-convert');
              } else if (first.type.startsWith('video/')) {
                handleToolSelect('video-convert');
              } else if (name.endsWith('.csv') || name.endsWith('.tsv')) {
                handleToolSelect('csv-json');
              } else if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml')) {
                handleToolSelect('json-yaml');
              } else if (name.endsWith('.md') || name.endsWith('.html')) {
                handleToolSelect('markdown-html');
              } else {
                handleToolSelect('hash-calc');
              }
            }}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        </main>
      ) : (
        <main
          id="main-content"
          role="main"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10"
        >
          {/* Left Column: Categorized Tool Drawer & Catalog */}
          <aside
            aria-label="Utility Tools Catalog"
            className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-20"
          >
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
                  <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
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
                              {tool.id === 'pdf-to-image' && <FileImage className="w-4 h-4" />}
                              {tool.id === 'paste-download' && <Clipboard className="w-4 h-4" />}
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
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-100/90 dark:from-[#0c0e14]/90 to-transparent rounded-b-2xl opacity-80" />
              </div>
            </div>

            {/* Sidebar Sponsor Card */}
            <div className="hidden lg:block pt-3">
              <AdSlot placement="sidebar" />
            </div>
          </aside>

          {/* Right Column: Active Utility Workspace */}
          <div id="tool-workspace" className="col-span-1 lg:col-span-8 space-y-6">
            {/* Header & Breadcrumbs */}
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
                  {toolCategory}
                </span>
                <span className="text-neutral-400">/</span>
                <span className="font-semibold text-neutral-950 dark:text-white truncate">
                  {toolTitle}
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

            {/* Active Utility Card */}
            <section
              aria-labelledby="active-tool-title"
              className={`glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200/80 dark:border-white/10 relative overflow-hidden scroll-mt-20 sm:scroll-mt-24 transition-all duration-300 ${
                ['length-convert', 'mass-convert', 'area-convert', 'volume-convert', 'temperature-convert', 'speed-convert', 'time-convert', 'bmi-calc', 'gwa-calc'].includes(activeTool)
                  ? 'max-w-3xl mx-auto'
                  : 'w-full'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-amber-400/30 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-200/60 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {toolBadge}
                    </span>
                    <h1 id="active-tool-title" className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                      {toolTitle}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {toolDesc}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={handleShareTool}
                    title="Copy direct URL to this specific tool"
                    aria-label={`Copy direct link to ${toolTitle}`}
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
                    onClick={() => handleToolSelect(activeTool)}
                    title="Reset workspace state"
                    aria-label={`Reset ${toolTitle} workspace state`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-xl transition glass-panel hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Tool Component Lazy Mount wrapped in ErrorBoundary */}
              <div className="mt-6">
                <ErrorBoundary key={activeTool}>
                  <Suspense fallback={<ToolLoadingFallback />}>
                    {activeTool === 'image-convert' && (
                      <ImageConverterWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'image-convert',
                            toolTitle: 'Image Converter',
                            badge: 'IMAGE',
                            summary,
                          })
                        }
                      />
                    )}
                    {(activeTool === 'json-yaml' || activeTool === 'base64' || activeTool === 'url-encode') && (
                      <CodeDataWorkspace
                        toolId={activeTool}
                        onHistoryAdd={(tId, title, badge, input, output) =>
                          addHistoryItem({
                            toolId: tId,
                            toolTitle: title,
                            badge,
                            summary: input.slice(0, 50),
                            inputContent: input,
                            outputContent: output,
                          })
                        }
                      />
                    )}
                    {activeTool === 'uuid' && (
                      <UuidGeneratorWorkspace
                        onHistoryAdd={(summary, output) =>
                          addHistoryItem({
                            toolId: 'uuid',
                            toolTitle: 'UUID Generator',
                            badge: 'UUID',
                            summary,
                            outputContent: output,
                          })
                        }
                      />
                    )}
                    {activeTool === 'color-convert' && (
                      <ColorConverterWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'color-convert',
                            toolTitle: 'Color Converter',
                            badge: 'COLOR',
                            summary,
                          })
                        }
                      />
                    )}
                    {activeTool === 'markdown-html' && (
                      <MarkdownPreviewWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'markdown-html',
                            toolTitle: 'Markdown ⇄ HTML',
                            badge: 'MD',
                            summary,
                          })
                        }
                      />
                    )}
                    {activeTool === 'csv-json' && (
                      <CsvJsonTableWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'csv-json',
                            toolTitle: 'CSV ⇄ JSON',
                            badge: 'CSV',
                            summary,
                          })
                        }
                      />
                    )}
                    {activeTool === 'hash-calc' && (
                      <HashCalculatorWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'hash-calc',
                            toolTitle: 'Hash Calculator',
                            badge: 'HASH',
                            summary,
                          })
                        }
                      />
                    )}
                    {activeTool === 'unit-convert' && (
                      <CssUnitsWorkspace
                        onHistoryAdd={(summary) =>
                          addHistoryItem({
                            toolId: 'unit-convert',
                            toolTitle: 'Unit Converter',
                            badge: 'UNIT',
                            summary,
                          })
                        }
                      />
                    )}

                    {/* Specialized standalone calculators & unit tools */}
                    {[
                      'length-convert',
                      'mass-convert',
                      'area-convert',
                      'volume-convert',
                      'temperature-convert',
                      'speed-convert',
                      'time-convert',
                    ].includes(activeTool) && (
                      <UnitConverterTool
                        initialCategory={
                          activeTool === 'mass-convert'
                            ? 'mass'
                            : activeTool === 'area-convert'
                            ? 'area'
                            : activeTool === 'volume-convert'
                            ? 'volume'
                            : activeTool === 'temperature-convert'
                            ? 'temperature'
                            : activeTool === 'speed-convert'
                            ? 'speed'
                            : activeTool === 'time-convert'
                            ? 'time'
                            : 'length'
                        }
                      />
                    )}
                    {activeTool === 'number-system' && <NumberSystemConverter />}
                    {activeTool === 'income-tax-ph' && <PhilippineTaxCalculator />}
                    {activeTool === 'mortgage-calc' && <MortgageCalculator />}
                    {activeTool === 'electricity-calc' && <ElectricityCalculator />}
                    {activeTool === 'bmi-calc' && <BmiCalculator />}
                    {activeTool === 'gwa-calc' && <PhilippineGwaCalculator />}
                    {activeTool === 'audio-convert' && <AudioConverterTool />}
                    {activeTool === 'video-convert' && <VideoConverterTool />}
                    {activeTool === 'images-to-pdf' && <PdfConverterTool initialMode="images-to-pdf" />}
                    {activeTool === 'pdf-to-image' && <PdfConverterTool initialMode="pdf-to-image" />}
                    {activeTool === 'paste-download' && <PasteDownloadTool />}
                  </Suspense>
                </ErrorBoundary>
              </div>
            </section>

            {/* In-Feed Sponsor Slot */}
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
              title="Isalin Multi-Converter - Go to Homepage"
              className="cursor-pointer transition hover:opacity-90 active:scale-95 focus:outline-none"
            >
              <BrandLogo size="sm" showWordmark={true} />
            </button>
            <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Isalin ang lahat. Convert anything.
            </span>
            <span className="hidden md:inline text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <span className="hidden md:inline font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              Zero-Upload Developer & Philippine Utility Suite
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs">
            <a
              href="/privacy"
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition"
            >
              Privacy Policy
            </a>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <a
              href="/terms"
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition"
            >
              Terms of Service
            </a>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <a
              href="/about"
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition"
            >
              About
            </a>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <a
              href="/contact"
              className="text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 font-medium transition"
            >
              Contact
            </a>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">•</span>
            <a
              href="mailto:crischarlesgarcia345@gmail.com?subject=Isalin%20Suggestion%20or%20Issue%20Report&body=Hi!%20I%20have%20a%20suggestion%20or%20would%20like%20to%20report%20an%20issue%20with%20Isalin:%0A%0A-%20Tool%20/%20Category:%0A-%20Details:%0A"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold transition cursor-pointer"
              title="Have a suggestion or found an issue? Send us an email!"
            >
              <Mail className="w-3 h-3" aria-hidden="true" />
              <span>Feedback</span>
            </a>
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
        onClearHistory={clearHistory}
        onDeleteHistoryItem={deleteHistoryItem}
        onRestoreHistory={handleRestoreHistory}
        presets={presets}
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
