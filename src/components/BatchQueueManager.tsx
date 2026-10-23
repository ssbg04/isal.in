import React, { useMemo } from 'react';
import {
  Trash2,
  Plus,
  FolderArchive,
  Download,
  CheckCircle2,
  Sparkles,
  MoveUp,
  MoveDown,
  Layers,
  FileCheck,
} from 'lucide-react';
import type { ConversionResult } from '../services/conversionService';
import type { SupportedImageFormat } from '../services/imageFormatsService';

export interface BatchQueueManagerProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearFiles: () => void;
  onAddFiles: (files: File[]) => void;
  onReorderFiles?: (fromIndex: number, toIndex: number) => void;
  targetFormat: SupportedImageFormat;
  onTargetFormatChange?: (format: SupportedImageFormat) => void;
  isProcessing: boolean;
  batchResults: ConversionResult[];
  selectedResultIndex: number;
  onSelectResult: (index: number) => void;
  onDownloadZip: () => void;
  isZipping: boolean;
  mode?: 'image-convert' | 'images-to-pdf';
}

export const BatchQueueManager: React.FC<BatchQueueManagerProps> = ({
  files,
  onRemoveFile,
  onClearFiles,
  onAddFiles,
  onReorderFiles,
  targetFormat,
  onTargetFormatChange,
  isProcessing,
  batchResults,
  selectedResultIndex,
  onSelectResult,
  onDownloadZip,
  isZipping,
  mode = 'image-convert',
}) => {
  // Previews for queued files
  const previews = useMemo(() => {
    return files.map((file) => {
      try {
        return URL.createObjectURL(file);
      } catch {
        return '';
      }
    });
  }, [files]);

  // Clean up previews on unmount/change
  React.useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const totalInputBytes = useMemo(() => {
    return files.reduce((acc, f) => acc + f.size, 0);
  }, [files]);

  const totalOutputBytes = useMemo(() => {
    return batchResults.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
  }, [batchResults]);

  const savingsPercent = useMemo(() => {
    if (!totalInputBytes || !totalOutputBytes || totalOutputBytes >= totalInputBytes) return 0;
    return Math.round(((totalInputBytes - totalOutputBytes) / totalInputBytes) * 100);
  }, [totalInputBytes, totalOutputBytes]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-3.5 rounded-3xl p-4 sm:p-5 glass-card border border-neutral-200/80 dark:border-white/10 relative overflow-hidden">
      {/* Top Specular Edge Glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />

      {/* Header Toolbar: Count, Total Size & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900 dark:text-white text-sm">
                Batch Queue ({files.length} file{files.length === 1 ? '' : 's'})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/70 dark:border-white/5">
                {formatBytes(totalInputBytes)} Total
              </span>
            </div>
            {mode === 'images-to-pdf' && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Reorder pages using the arrow controls before compiling
              </p>
            )}
          </div>
        </div>

        {/* Global Format Selector (Quick Switcher) */}
        <div className="flex items-center gap-2">
          {mode === 'image-convert' && onTargetFormatChange && (
            <div className="inline-flex flex-wrap rounded-xl glass-panel p-0.5 text-xs border border-neutral-200/80 dark:border-white/5">
              {(['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'image/bmp', 'image/x-icon', 'image/gif'] as const).map((fmt) => {
                const label = fmt === 'image/x-icon' ? 'ICO' : fmt === 'image/jpeg' ? 'JPG' : fmt.split('/')[1].toUpperCase();
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => onTargetFormatChange(fmt)}
                    className={`px-2 py-1 rounded-lg font-semibold text-[10px] sm:text-[11px] transition cursor-pointer ${
                      targetFormat === fmt
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Add More Files Trigger */}
          <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold glass-panel border border-neutral-200/80 dark:border-white/10 hover:border-amber-500/40 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition cursor-pointer shadow-2xs">
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>Add Files</span>
            <input
              type="file"
              multiple
              accept={mode === 'image-convert' ? 'image/*' : 'image/png,image/jpeg'}
              className="hidden"
              onChange={handleFileInput}
            />
          </label>

          {/* Clear All */}
          <button
            type="button"
            onClick={onClearFiles}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
            title="Clear all queued files"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Savings Metric Banner (if converted in batch) */}
      {batchResults.length > 0 && savingsPercent > 0 && (
        <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">
              Batch Compression Complete: Saved {savingsPercent}% payload ({formatBytes(totalInputBytes - totalOutputBytes)} reduced)
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold">
            {formatBytes(totalOutputBytes)} output
          </span>
        </div>
      )}

      {/* Itemized File Queue Cards */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {files.map((file, idx) => {
          const isResultItem = batchResults[idx];
          const isSelected = selectedResultIndex === idx;

          return (
            <div
              key={`${file.name}-${idx}`}
              onClick={() => {
                if (batchResults.length > 0) onSelectResult(idx);
              }}
              className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                isSelected && batchResults.length > 0
                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 shadow-xs'
                  : 'bg-white/60 dark:bg-neutral-900/50 border-neutral-200/70 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/15'
              } ${batchResults.length > 0 ? 'cursor-pointer' : ''}`}
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Index / Page Number Badge */}
                <span className="w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {/* Image Thumbnail */}
                {previews[idx] ? (
                  <img
                    src={previews[idx]}
                    alt={file.name}
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-200/80 dark:border-white/10 shrink-0 shadow-xs bg-neutral-100 dark:bg-neutral-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-white/10 flex items-center justify-center shrink-0 text-neutral-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                )}

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate text-xs sm:text-sm">
                      {file.name}
                    </p>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 shrink-0">
                      {file.type.split('/')[1] || 'IMAGE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                    <span>{formatBytes(file.size)}</span>
                    {isResultItem && (
                      <>
                        <span>→</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatBytes(isResultItem.sizeBytes || 0)}
                        </span>
                        <span className="inline-flex items-center text-emerald-500">
                          <CheckCircle2 className="w-3 h-3 ml-0.5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions (Reorder / Download / Delete) */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Page Reorder for PDF */}
                {mode === 'images-to-pdf' && onReorderFiles && (
                  <div className="flex items-center gap-0.5 mr-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onReorderFiles(idx, idx - 1)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 transition cursor-pointer"
                      title="Move page up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === files.length - 1}
                      onClick={() => onReorderFiles(idx, idx + 1)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 transition cursor-pointer"
                      title="Move page down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Individual Download if Converted */}
                {isResultItem?.downloadUrl && (
                  <a
                    href={isResultItem.downloadUrl}
                    download={isResultItem.filename}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                    title={`Download ${isResultItem.filename}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Remove from Queue */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onRemoveFile(idx)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-30"
                  title="Remove file from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Batch Result Bulk Download Button */}
      {batchResults.length > 1 && mode === 'image-convert' && (
        <button
          type="button"
          onClick={onDownloadZip}
          disabled={isZipping}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
        >
          <FolderArchive className="w-4 h-4" />
          <span>{isZipping ? 'Creating ZIP Bundle...' : `Download All ${batchResults.length} Images (.ZIP)`}</span>
        </button>
      )}
    </div>
  );
};

export default BatchQueueManager;
