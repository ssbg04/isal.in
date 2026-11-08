import React, { useState, useEffect } from 'react';
import { UploadCloud, Sparkles, Sliders, ChevronDown } from 'lucide-react';
import { ConversionStateIndicator } from '../ConversionStateIndicator';
import { BatchQueueManager } from '../BatchQueueManager';
import { ImageCompareSlider } from '../ImageCompareSlider';
import { convertImage, type ConversionResult } from '../../services/conversionService';
import { APP_LIMITS } from '../../config/limits';
import { sanitizeFilename, revokeSafeObjectUrl } from '../../utils/security';

interface ImageConverterWorkspaceProps {
  initialFiles?: File[];
  onHistoryAdd?: (summary: string) => void;
}

export const ImageConverterWorkspace: React.FC<ImageConverterWorkspaceProps> = ({
  initialFiles = [],
  onHistoryAdd,
}) => {
  const [files, setFiles] = useState<File[]>(() => initialFiles);
  const [targetFormat, setTargetFormat] = useState<
    'image/webp' | 'image/png' | 'image/jpeg' | 'image/avif' | 'image/bmp' | 'image/x-icon' | 'image/gif'
  >('image/webp');
  const [imageQuality, setImageQuality] = useState<number>(0.8);
  const [stripExif, setStripExif] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [batchResults, setBatchResults] = useState<ConversionResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      revokeSafeObjectUrl(originalPreviewUrl);
      batchResults.forEach((b) => revokeSafeObjectUrl(b.downloadUrl));
    };
  }, [originalPreviewUrl, batchResults]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected].slice(0, APP_LIMITS.free.maxBatchCount));
      setErrorMsg(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      if (dropped.length === 0) {
        setErrorMsg('Please select valid image files (PNG, JPG, WebP, AVIF, BMP, GIF, ICO).');
        return;
      }
      setFiles((prev) => [...prev, ...dropped].slice(0, APP_LIMITS.free.maxBatchCount));
      setErrorMsg(null);
    }
  };

  const handleLoadSample = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 600, 400);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 400);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Isalin Sample Image', 300, 190);
        ctx.font = '16px sans-serif';
        ctx.fillText('100% Client-Side Conversion', 300, 230);

        canvas.toBlob((blob) => {
          if (blob) {
            const sampleFile = new File([blob], 'isalin-sample.png', { type: 'image/png' });
            setFiles([sampleFile]);
            setErrorMsg(null);
          }
        }, 'image/png');
      }
    } catch {
      setErrorMsg('Failed to create sample image.');
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(10);
    setErrorMsg(null);

    const results: ConversionResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await convertImage(file, targetFormat, imageQuality);
        const ext = targetFormat.split('/')[1] || 'webp';
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const outName = sanitizeFilename(`${baseName}.${ext}`);

        results.push({
          downloadUrl: res.downloadUrl,
          filename: outName,
          sizeBytes: res.sizeBytes,
        });

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setBatchResults(results);
      setSelectedResultIndex(0);

      // Set original preview url
      if (files[0]) {
        revokeSafeObjectUrl(originalPreviewUrl);
        setOriginalPreviewUrl(URL.createObjectURL(files[0]));
      }

      onHistoryAdd?.(`Image conversion: ${files.length} file(s) to ${targetFormat.split('/')[1]?.toUpperCase()}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image conversion encountered an error.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (batchResults.length === 0) return;
    setIsZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      for (const item of batchResults) {
        if (!item.downloadUrl) continue;
        const resp = await fetch(item.downloadUrl);
        const blob = await resp.blob();
        zip.file(sanitizeFilename(item.filename), blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = sanitizeFilename(`isalin-converted-${Date.now()}.zip`);
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch {
      setErrorMsg('Failed to bundle ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const currentResult = batchResults[selectedResultIndex];

  return (
    <div className="mt-5 space-y-5">
      <ConversionStateIndicator
        state={
          isProcessing
            ? 'converting'
            : currentResult?.downloadUrl
            ? 'completed'
            : errorMsg
            ? 'error'
            : 'ready'
        }
        hasFile={files.length > 0}
        fileName={files.length > 0 ? (files.length === 1 ? files[0].name : `${files.length} images selected`) : undefined}
        progressPercent={progress}
        errorMessage={errorMsg || undefined}
        supportedFormats="PNG, JPG, WebP, AVIF, BMP, GIF, ICO"
        maxFileSizeMB={APP_LIMITS.free.maxSingleFileMB}
        onReset={() => {
          setFiles([]);
          setBatchResults([]);
          setErrorMsg(null);
        }}
        outputFormatName={targetFormat.split('/')[1]?.toUpperCase()}
      />

      <input
        id="image-file-upload-input"
        type="file"
        multiple={true}
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {files.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="group relative border-2 border-dashed border-neutral-300/80 dark:border-neutral-700/80 hover:border-amber-500/70 dark:hover:border-amber-400/60 bg-gradient-to-b from-white/70 to-neutral-50/50 dark:from-neutral-900/40 dark:to-[#0c0e14]/60 rounded-3xl p-7 sm:p-9 flex flex-col items-center justify-center text-center transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-sm">
            <UploadCloud className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
            Drop your images here
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
            or choose files directly from your computer or phone (100% private in-browser)
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('image-file-upload-input')?.click()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              Choose Images
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold glass-panel text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:border-amber-500/40 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Try Sample Image</span>
            </button>
          </div>
        </div>
      ) : (
        <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}>
          <BatchQueueManager
            files={files}
            onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
            onClearFiles={() => {
              setFiles([]);
              setBatchResults([]);
            }}
            onAddFiles={(newFiles) => setFiles((prev) => [...prev, ...newFiles].slice(0, APP_LIMITS.free.maxBatchCount))}
            onReorderFiles={(fromIdx, toIdx) => {
              setFiles((prev) => {
                const next = [...prev];
                const [moved] = next.splice(fromIdx, 1);
                next.splice(toIdx, 0, moved);
                return next;
              });
            }}
            isProcessing={isProcessing}
            batchResults={batchResults}
            selectedResultIndex={selectedResultIndex}
            onSelectResult={(idx) => setSelectedResultIndex(idx)}
            onRenameResult={(idx, newName) => {
              setBatchResults((prev) =>
                prev.map((item, i) => (i === idx ? { ...item, filename: sanitizeFilename(newName) } : item))
              );
            }}
            onDownloadZip={handleDownloadZip}
            isZipping={isZipping}
            mode="image-convert"
          />
        </div>
      )}

      {/* Conversion Options */}
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
              <span>Output Format</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-normal">
                Local WebAssembly
              </span>
            </label>
            <select
              value={targetFormat}
              onChange={(e) =>
                setTargetFormat(
                  e.target.value as 'image/webp' | 'image/png' | 'image/jpeg' | 'image/avif' | 'image/bmp' | 'image/x-icon' | 'image/gif'
                )
              }
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
              {[
                { label: '90% High', val: 0.9 },
                { label: '80% Balanced', val: 0.8 },
                { label: '65% Smallest', val: 0.65 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setImageQuality(p.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                    imageQuality === p.val
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'glass-panel text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
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

      {/* Convert Button */}
      {files.length > 0 && (
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleConvert}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 disabled:opacity-50 font-extrabold text-sm sm:text-base rounded-2xl transition shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer ring-2 ring-amber-400/30"
        >
          <span>
            {isProcessing
              ? `Converting on your device (${progress}%)...`
              : `Convert to ${targetFormat.split('/')[1]?.toUpperCase()} (${files.length} ${files.length > 1 ? 'Images' : 'Image'})`}
          </span>
        </button>
      )}

      {/* Comparison Preview Slider */}
      {currentResult?.downloadUrl && originalPreviewUrl && (
        <div className="mt-4 pt-3 border-t border-neutral-200/80 dark:border-white/10">
          <ImageCompareSlider
            originalUrl={originalPreviewUrl}
            convertedUrl={currentResult.downloadUrl}
            originalName={files[selectedResultIndex]?.name || 'Original Image'}
            convertedName={currentResult.filename}
            originalSizeBytes={files[selectedResultIndex]?.size}
            convertedSizeBytes={currentResult.sizeBytes}
            originalFormat={files[selectedResultIndex]?.type.split('/')[1]?.toUpperCase()}
            convertedFormat={targetFormat.split('/')[1]?.toUpperCase()}
            onRename={(newName) => {
              setBatchResults((prev) =>
                prev.map((item, i) => (i === selectedResultIndex ? { ...item, filename: sanitizeFilename(newName) } : item))
              );
            }}
            onDownload={(finalName) => {
              if (currentResult.downloadUrl) {
                const a = document.createElement('a');
                a.href = currentResult.downloadUrl;
                a.download = sanitizeFilename(finalName);
                a.click();
              }
            }}
            onConvertAnother={() => {
              setFiles([]);
              setBatchResults([]);
            }}
          />
        </div>
      )}
    </div>
  );
};
