import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ChevronsLeftRight,
  Columns2,
  SlidersHorizontal,
  Eye,
  Maximize2,
  Minimize2,
  Download,
  Check,
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
  onDownload?: () => void;
}

type ViewMode = 'slider' | 'side-by-side' | 'hold-diff';

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalUrl,
  convertedUrl,
  originalName,
  convertedName,
  originalSizeBytes,
  convertedSizeBytes,
  originalFormat,
  convertedFormat,
  onDownload,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [is100Percent, setIs100Percent] = useState<boolean>(false);
  const [isHoldingDiff, setIsHoldingDiff] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

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

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handlePointerMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handlePointerMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX);
    };

    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handlePointerMove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl glass-panel text-xs">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-900/80 p-1 rounded-xl border border-neutral-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Interactive Split Comparison Slider"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Side-by-Side Dual View"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('hold-diff')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 cursor-pointer ${
              viewMode === 'hold-diff'
                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="Hold to Flash Original"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hold Diff</span>
          </button>
        </div>

        {/* View Options & Download */}
        <div className="flex items-center gap-2">
          {/* Zoom 1:1 Toggle */}
          <button
            type="button"
            onClick={() => setIs100Percent(!is100Percent)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
              is100Percent
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold'
                : 'border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Toggle between Fit View and 100% Actual Pixel scale"
          >
            {is100Percent ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{is100Percent ? 'Fit Scale' : '100% Pixels'}</span>
          </button>

          {/* Direct Download Button */}
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Converted</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: Interactive Split Comparison Slider */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
          className={`relative rounded-3xl overflow-hidden glass-card border border-neutral-200/80 dark:border-white/10 select-none group cursor-ew-resize outline-none focus:ring-2 focus:ring-amber-500/30 transition-shadow ${
            is100Percent ? 'overflow-auto max-h-[500px]' : 'max-h-[480px]'
          }`}
          style={{ minHeight: '320px' }}
        >
          {/* Subtle Checkered Transparency Background for Alpha / PNG / WebP */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, rgba(120,120,120,0.12) 25%, transparent 25%),
                                linear-gradient(-45deg, rgba(120,120,120,0.12) 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, rgba(120,120,120,0.12) 75%),
                                linear-gradient(-45deg, transparent 75%, rgba(120,120,120,0.12) 75%)`,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
            }}
          />

          {/* Floating Badges */}
          {/* Left: Original Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1.5">
            <span className="glass-panel px-3 py-1 rounded-xl text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neutral-400" />
              <span>ORIGINAL</span>
              {originalFormat && (
                <span className="text-neutral-400 font-normal uppercase">• {originalFormat}</span>
              )}
              {originalSizeBytes && (
                <span className="text-neutral-400 font-normal">• {formatSize(originalSizeBytes)}</span>
              )}
            </span>
          </div>

          {/* Right: Converted Badge */}
          <div className="absolute top-3 right-3 z-20 pointer-events-none flex items-center gap-1.5">
            <span className="glass-panel px-3 py-1 rounded-xl text-[11px] font-mono font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-600 dark:text-amber-400 font-bold">CONVERTED</span>
              {convertedFormat && (
                <span className="text-neutral-400 font-normal uppercase">• {convertedFormat}</span>
              )}
              {convertedSizeBytes && (
                <span className="text-neutral-400 font-normal">• {formatSize(convertedSizeBytes)}</span>
              )}
              {savings && savings.saved && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  -{savings.percent}%
                </span>
              )}
            </span>
          </div>

          {/* Bottom Center Drag Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="glass-panel px-3 py-1 rounded-full text-[10px] font-mono font-medium text-neutral-500 dark:text-neutral-400 shadow-xs flex items-center gap-1.5 backdrop-blur-md">
              <ChevronsLeftRight className="w-3 h-3 text-amber-500" />
              <span>Drag or use ← → arrow keys</span>
            </span>
          </div>

          {/* Base Layer: Original Image (Left side) */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={originalUrl}
              alt={originalName}
              className={`select-none pointer-events-none transition-all duration-150 ${
                is100Percent
                  ? 'max-w-none max-h-none object-none'
                  : 'max-w-full max-h-[440px] w-auto h-auto object-contain'
              }`}
            />
          </div>

          {/* Top Layer: Converted Image (Right side, clipped based on slider position) */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center p-4 overflow-hidden pointer-events-none"
            style={{
              clipPath: `inset(0 0 0 ${sliderPos}%)`,
            }}
          >
            <img
              src={convertedUrl}
              alt={convertedName}
              className={`select-none pointer-events-none transition-all duration-150 ${
                is100Percent
                  ? 'max-w-none max-h-none object-none'
                  : 'max-w-full max-h-[440px] w-auto h-auto object-contain'
              }`}
            />
          </div>

          {/* Draggable Divider Line & Knob */}
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Luminous Line */}
            <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]" />

            {/* Circular Handle Knob */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-neutral-900 border-2 border-amber-500 shadow-lg shadow-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-transform duration-150 ${
                isDragging ? 'scale-110' : 'group-hover:scale-105'
              }`}
            >
              <ChevronsLeftRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Side-by-Side Dual View */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Pane: Original */}
          <div className="rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 p-4 space-y-3 relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span className="font-bold text-neutral-900 dark:text-white">Original File</span>
                {originalFormat && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    {originalFormat}
                  </span>
                )}
              </div>
              {originalSizeBytes && (
                <span className="font-mono text-neutral-400">{formatSize(originalSizeBytes)}</span>
              )}
            </div>
            <div
              className={`flex-1 min-h-[260px] rounded-2xl bg-neutral-100/40 dark:bg-neutral-900/40 flex items-center justify-center p-3 overflow-hidden ${
                is100Percent ? 'overflow-auto max-h-[380px]' : 'max-h-[360px]'
              }`}
            >
              <img
                src={originalUrl}
                alt={originalName}
                className={
                  is100Percent
                    ? 'max-w-none max-h-none object-none'
                    : 'max-w-full max-h-full object-contain rounded-lg'
                }
              />
            </div>
            <p className="text-[11px] font-mono text-neutral-400 truncate text-center">
              {originalName}
            </p>
          </div>

          {/* Right Pane: Converted */}
          <div className="rounded-3xl glass-card border border-amber-500/30 dark:border-amber-400/30 p-4 space-y-3 relative overflow-hidden flex flex-col shadow-lg shadow-amber-500/5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-neutral-900 dark:text-white">Converted Output</span>
                {convertedFormat && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                    {convertedFormat}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {convertedSizeBytes && (
                  <span className="font-mono text-neutral-400">{formatSize(convertedSizeBytes)}</span>
                )}
                {savings && savings.saved && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Saved {savings.percent}%
                  </span>
                )}
              </div>
            </div>
            <div
              className={`flex-1 min-h-[260px] rounded-2xl bg-neutral-100/40 dark:bg-neutral-900/40 flex items-center justify-center p-3 overflow-hidden ${
                is100Percent ? 'overflow-auto max-h-[380px]' : 'max-h-[360px]'
              }`}
            >
              <img
                src={convertedUrl}
                alt={convertedName}
                className={
                  is100Percent
                    ? 'max-w-none max-h-none object-none'
                    : 'max-w-full max-h-full object-contain rounded-lg'
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-mono text-neutral-400 truncate">{convertedName}</p>
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Hold to Diff View */}
      {viewMode === 'hold-diff' && (
        <div className="rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 p-5 space-y-4 text-center">
          <div className="relative min-h-[320px] max-h-[460px] rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 p-4 flex items-center justify-center overflow-hidden">
            {/* Display Active Image */}
            <img
              src={isHoldingDiff ? originalUrl : convertedUrl}
              alt={isHoldingDiff ? originalName : convertedName}
              className={`select-none pointer-events-none transition-opacity duration-150 ${
                is100Percent
                  ? 'max-w-none max-h-none object-none'
                  : 'max-w-full max-h-[420px] object-contain rounded-xl'
              }`}
            />

            {/* Active Indicator Badge */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span
                className={`glass-panel px-3 py-1 rounded-xl text-[11px] font-mono font-bold shadow-sm flex items-center gap-1.5 transition-colors ${
                  isHoldingDiff
                    ? 'text-neutral-900 dark:text-white border-neutral-400'
                    : 'text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHoldingDiff ? 'bg-neutral-400' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>{isHoldingDiff ? 'VIEWING ORIGINAL' : 'VIEWING CONVERTED'}</span>
              </span>
            </div>
          </div>

          {/* Interactive Hold Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onMouseDown={() => setIsHoldingDiff(true)}
              onMouseUp={() => setIsHoldingDiff(false)}
              onMouseLeave={() => setIsHoldingDiff(false)}
              onTouchStart={() => setIsHoldingDiff(true)}
              onTouchEnd={() => setIsHoldingDiff(false)}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-2 select-none cursor-pointer shadow-md active:scale-95 ${
                isHoldingDiff
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 scale-102 ring-4 ring-neutral-500/20'
                  : 'glass-panel hover:border-amber-500/40 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-500" />
              <span>{isHoldingDiff ? 'Release to view Converted' : 'Press & Hold to inspect Original'}</span>
            </button>

            {savings && savings.saved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                <span>
                  Compressed by {savings.percent}% ({formatSize(savings.bytes)} saved)
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ImageCompareSlider;
