import React, { useState, useEffect } from 'react';
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
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { AdSlot } from './components/AdSlot';
import { CategoryFilter } from './components/CategoryFilter';
import type { ToolType, ConversionResult } from './services/conversionService';
import {
  convertImage,
  convertImagesToPdf,
  convertJsonYaml,
  processBase64,
  processUrlEncode,
  generateUUIDs,
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
];

const CATEGORIES: { id: Category; label: string; count: number }[] = [
  { id: 'media', label: 'Media & Documents', count: 2 },
  { id: 'developer', label: 'Data & Formats', count: 3 },
  { id: 'security', label: 'Encoding & Security', count: 1 },
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

  // Selected tool & category filter
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [activeTool, setActiveTool] = useState<ToolType>('image-convert');

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [targetImageFormat, setTargetImageFormat] = useState<'image/webp' | 'image/png' | 'image/jpeg'>('image/webp');
  const [imageQuality, setImageQuality] = useState<number>(0.85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Text/utility state
  const [textInput, setTextInput] = useState<string>('');
  const [textOutput, setTextOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [jsonDirection, setJsonDirection] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');
  const [uuidCount, setUuidCount] = useState<number>(5);

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

  const handleToolSelect = (toolId: ToolType) => {
    setActiveTool(toolId);
    setFiles([]);
    setResult(null);
    setErrorMsg(null);
    setTextInput('');
    setTextOutput('');
  };

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

  const handleConvert = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      if (activeTool === 'image-convert') {
        if (!files.length) throw new Error('Please select an image file to proceed.');
        const res = await convertImage(files[0], targetImageFormat, imageQuality);
        setResult(res);
      } else if (activeTool === 'images-to-pdf') {
        if (!files.length) throw new Error('Select at least one image to compile.');
        const res = await convertImagesToPdf(files);
        setResult(res);
      } else if (activeTool === 'json-yaml') {
        const out = convertJsonYaml(textInput, jsonDirection);
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
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTools = selectedCategory === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Minimalist Top App Bar */}
      <header className="border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-sm sm:text-base text-neutral-950 dark:text-neutral-50">
                Multi-Converter
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                client-local
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      {/* 3.1 Header Advertisement (Subtle & Non-Intrusive) */}
      <section className="px-4 pt-4 sm:pt-6">
        <AdSlot placement="header" />
      </section>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Categorized Tool Drawer & Catalog (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Category Filter */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalToolsCount={TOOLS.length}
          />

          {/* Categorized Tool Cards List */}
          <div className="space-y-2">
            {filteredTools.map((tool) => {
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
            })}
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

              <button
                onClick={() => handleToolSelect(activeTool)}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
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
                    multiple={activeTool === 'images-to-pdf'}
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
                  </div>
                )}

                {/* Conversion Trigger Button */}
                <button
                  disabled={!files.length || isProcessing}
                  onClick={handleConvert}
                  className="w-full py-3 bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm rounded-xl transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xs"
                >
                  {isProcessing ? 'Processing in Browser...' : activeTool === 'image-convert' ? 'Convert Image' : 'Merge into PDF'}
                </button>

                {/* Result Section & Safe Download Button */}
                {result && (
                  <div className="mt-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-3.5">
                    <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="font-mono truncate max-w-[260px] sm:max-w-md">{result.filename}</span>
                      {result.sizeBytes && (
                        <span className="font-mono text-neutral-500">
                          {(result.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      )}
                    </div>

                    <a
                      href={result.downloadUrl}
                      download={result.filename}
                      className="w-full py-2.5 px-4 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 font-medium text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
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
                  {activeTool === 'uuid' ? 'Generate UUIDs' : 'Transform Input'}
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
          </div>

          {/* 3.2 In-Feed Section Sponsor */}
          <AdSlot placement="between-content" />

          {/* Privacy & Educational Note */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40 p-5 sm:p-6 text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Architecture & Security
            </h3>
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
          <span>Multi-Converter • Client-Side Utility Platform</span>
          <span>Free Plan with Transparent Ads • No Tracking</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
