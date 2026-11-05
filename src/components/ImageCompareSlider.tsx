import React, { useState } from 'react';
import {
  Eye,
  Maximize2,
  Minimize2,
  Download,
  Check,
  Pencil,
  RotateCcw,
} from 'lucide-react';

export interface ImageCompareSliderProps {
  originalUrl: string;
  convertedUrl: string;
  originalName: string;
  convertedName: string;
  originalSizeBytes?: number;
  convertedSizeBytes?: number;
  originalFormat?: string;
  convertedFormat?: string;
  onRename?: (newFilename: string) => void;
  onDownload?: (filename: string) => void;
  onConvertAnother?: () => void;
}

const splitFilename = (name: string): { base: string; ext: string } => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return { base: name, ext: '' };
  return { base: name.slice(0, lastDot), ext: name.slice(lastDot) };
};

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalUrl,
  convertedUrl,
  originalName,
  convertedName,
  originalSizeBytes,
  convertedSizeBytes,
  originalFormat,
  convertedFormat,
  onRename,
  onDownload,
  onConvertAnother,
}) => {
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [is100Percent, setIs100Percent] = useState<boolean>(false);

  const { base: defaultBase, ext } = splitFilename(convertedName);

  const handleBaseChange = (val: string) => {
    const clean = val.replace(/[\\/:*?"<>|]+/g, '_');
    onRename?.(`${clean}${ext}`);
  };

  const finalFilename = `${defaultBase.trim() || 'converted'}${ext}`;

  // Compute file size savings
  const savings = (() => {
    if (!originalSizeBytes || !convertedSizeBytes || originalSizeBytes <= 0) return null;
    const diff = originalSizeBytes - convertedSizeBytes;
    const pct = Math.round((diff / originalSizeBytes) * 100);
    return {
      bytes: diff,
      percent: pct,
      saved: diff > 0,
    };
  })();

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-4">
      {/* Unified Single Preview Canvas with Before / After Toggle */}
      <div className="rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 p-4 sm:p-5 space-y-4">
        {/* Top Toolbar: Status Pill + Before/After Segmented Toggle + 100% Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Size & Compression Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-bold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ready</span>
            </span>
            <span className="font-mono text-neutral-600 dark:text-neutral-300">
              {originalFormat || 'ORIG'} {formatSize(originalSizeBytes)}
              {' → '}
              <strong className="text-neutral-950 dark:text-white">
                {convertedFormat || ext.replace('.', '').toUpperCase()} {formatSize(convertedSizeBytes)}
              </strong>
            </span>
            {savings && savings.saved && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold font-mono border border-emerald-500/25">
                -{savings.percent}% ({formatSize(savings.bytes)} saved)
              </span>
            )}
          </div>

          {/* Toggle & Scale Controls */}
          <div className="flex items-center gap-2">
            {/* Before / After Toggle Pill */}
            <div
              role="group"
              aria-label="Preview before or after conversion"
              className="inline-flex items-center p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/10"
            >
              <button
                type="button"
                onClick={() => setShowOriginal(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !showOriginal
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                After ({convertedFormat || 'Converted'})
              </button>
              <button
                type="button"
                onClick={() => setShowOriginal(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  showOriginal
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Before (Original)
              </button>
            </div>

            {/* 100% Pixel Scale Toggle */}
            <button
              type="button"
              onClick={() => setIs100Percent(!is100Percent)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                is100Percent
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Toggle between Fit View and 100% Actual Pixel scale"
            >
              {is100Percent ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{is100Percent ? 'Fit' : '100%'}</span>
            </button>
          </div>
        </div>

        {/* Image Viewport (Click image to toggle Before / After) */}
        <div
          onClick={() => setShowOriginal((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setShowOriginal((prev) => !prev);
            }
          }}
          aria-label="Click to toggle between converted and original image"
          className={`relative min-h-[300px] max-h-[460px] rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 p-4 flex items-center justify-center cursor-pointer select-none group outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            is100Percent ? 'overflow-auto' : 'overflow-hidden'
          }`}
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(120,120,120,0.10) 25%, transparent 25%),
                              linear-gradient(-45deg, rgba(120,120,120,0.10) 25%, transparent 25%),
                              linear-gradient(45deg, transparent 75%, rgba(120,120,120,0.10) 75%),
                              linear-gradient(-45deg, transparent 75%, rgba(120,120,120,0.10) 75%)`,
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        >
          <img
            src={showOriginal ? originalUrl : convertedUrl}
            alt={showOriginal ? originalName : finalFilename}
            className={`select-none pointer-events-none transition-opacity duration-150 ${
              is100Percent
                ? 'max-w-none max-h-none object-none'
                : 'max-w-full max-h-[420px] object-contain rounded-xl'
            }`}
          />

          {/* Top-Left Active State Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span
              className={`glass-panel px-3 py-1 rounded-xl text-[11px] font-mono font-bold shadow-sm flex items-center gap-1.5 transition-colors ${
                showOriginal
                  ? 'text-neutral-900 dark:text-white border-neutral-400'
                  : 'text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  showOriginal ? 'bg-neutral-400' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span>
                {showOriginal
                  ? `BEFORE • ORIGINAL (${formatSize(originalSizeBytes)})`
                  : `AFTER • ${convertedFormat || 'CONVERTED'} (${formatSize(convertedSizeBytes)})`}
              </span>
            </span>
          </div>

          {/* Bottom Toggle Hint Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="glass-panel px-3 py-1 rounded-full text-[11px] font-medium text-neutral-700 dark:text-neutral-200 shadow-xs flex items-center gap-1.5 backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Click image to toggle {showOriginal ? 'After (Converted)' : 'Before (Original)'}</span>
            </span>
          </div>
        </div>

        {/* Rename + Download Action Bar (Single Unified Row) */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Editable Filename Input */}
          <div className="flex-1 flex items-center rounded-xl bg-background border border-neutral-300 dark:border-neutral-700 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 px-3 py-2 text-xs sm:text-sm">
            <Pencil className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
            <input
              type="text"
              value={defaultBase}
              onChange={(e) => handleBaseChange(e.target.value)}
              aria-label="Output file name before extension"
              placeholder="Enter file name"
              className="w-full bg-transparent text-neutral-900 dark:text-white font-mono outline-none min-w-0"
            />
            {ext && (
              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-xs font-semibold shrink-0 select-none">
                {ext}
              </span>
            )}
          </div>

          {/* Primary Download Button */}
          <a
            href={convertedUrl}
            download={finalFilename}
            onClick={(e) => {
              if (onDownload) {
                e.preventDefault();
                onDownload(finalFilename);
              }
            }}
            className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </a>

          {onConvertAnother && (
            <button
              type="button"
              onClick={onConvertAnother}
              className="py-2.5 px-3.5 glass-panel border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/50 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Clear and convert another image"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ImageCompareSlider;
