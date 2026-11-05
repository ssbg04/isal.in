import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clipboard,
  Download,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Link,
  Pencil,
} from 'lucide-react';
import { convertImage } from '../../services/conversionService';
import type { SupportedImageFormat } from '../../services/imageFormatsService';

export const PasteDownloadTool: React.FC = () => {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalType, setOriginalType] = useState<string>('image/png');
  const [baseFilename, setBaseFilename] = useState<string>('pasted-image');
  const [targetFormat, setTargetFormat] = useState<SupportedImageFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const cleanPreviewUrl = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const loadImageFromBlob = useCallback(
    (blob: Blob, defaultName = 'pasted-image') => {
      setErrorMsg(null);
      cleanPreviewUrl();

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setImageBlob(blob);
      setOriginalType(blob.type || 'image/png');
      setBaseFilename(defaultName);

      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        setErrorMsg('Failed to decode image dimensions.');
      };
      img.src = url;
    },
    [cleanPreviewUrl]
  );

  const handlePasteEvent = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            loadImageFromBlob(file, `screenshot-${Date.now().toString().slice(-4)}`);
            return;
          }
        }
      }

      // Check if text is an image URL
      const text = e.clipboardData.getData('text');
      if (text && (text.startsWith('http') || text.startsWith('data:image/'))) {
        setUrlInput(text);
      }
    },
    [loadImageFromBlob]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePasteEvent);
    return () => {
      window.removeEventListener('paste', handlePasteEvent);
      cleanPreviewUrl();
    };
  }, [handlePasteEvent, cleanPreviewUrl]);

  const handleReadClipboard = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.clipboard?.read) {
        throw new Error('Clipboard API not permitted in this browser.');
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          loadImageFromBlob(blob, 'clipboard-image');
          return;
        }
      }

      // Check text for URL
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http') || text.startsWith('data:image/'))) {
        setUrlInput(text);
        handleFetchUrl(text);
        return;
      }

      setErrorMsg('No image data found in clipboard. Try copying an image or taking a screenshot first.');
    } catch {
      setErrorMsg('Clipboard permission denied or unavailable. Use Ctrl+V or paste a URL below.');
    }
  };

  const handleFetchUrl = async (urlString = urlInput) => {
    const trimmed = urlString.trim();
    if (!trimmed) return;
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      if (trimmed.startsWith('data:image/')) {
        const res = await fetch(trimmed);
        const blob = await res.blob();
        loadImageFromBlob(blob, 'data-uri-image');
        return;
      }

      // External HTTP URL
      const res = await fetch(trimmed, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error('URL does not return an image');

      const urlName = trimmed.split('/').pop()?.split('?')[0]?.replace(/\.[^/.]+$/, '') || 'downloaded-image';
      loadImageFromBlob(blob, urlName);
    } catch {
      // Fallback: load into canvas via Image element (CORS may block canvas export for external domains)
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (b) {
              loadImageFromBlob(b, 'web-image');
            } else {
              setErrorMsg('Unable to convert image from URL due to CORS restrictions.');
            }
          }, 'image/png');
        }
      };
      img.onerror = () => {
        setErrorMsg('Unable to load image from URL. The host may block direct browser downloads.');
      };
      img.src = trimmed;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!imageBlob) return;
    setIsProcessing(true);
    try {
      const ext =
        targetFormat === 'image/jpeg'
          ? 'jpg'
          : targetFormat === 'image/x-icon'
          ? 'ico'
          : targetFormat.replace('image/', '');
      const cleanName = baseFilename.trim().replace(/[\\/:*?"<>|]+/g, '_') || 'image';
      const filename = `${cleanName}.${ext}`;

      const file = new File([imageBlob], filename, { type: originalType });
      const converted = await convertImage(file, targetFormat, quality);

      if (converted.downloadUrl) {
        const a = document.createElement('a');
        a.href = converted.downloadUrl;
        a.download = filename;
        a.click();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Download failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyImageBack = async () => {
    if (!imageBlob) return;
    try {
      // Browsers usually only support writing PNG to clipboard
      const file = new File([imageBlob], 'pasted.png', { type: originalType });
      const pngConv = await convertImage(file, 'image/png');
      if (pngConv.blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': pngConv.blob }),
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      }
    } catch {
      setErrorMsg('Failed to copy image to clipboard.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clipboard className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Paste to Download
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Paste screenshots (<kbd className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">Ctrl+V</kbd>), clipboard images, or URLs to save instantly.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadClipboard}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm shadow-amber-500/20 active:scale-95 transition cursor-pointer"
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste from Clipboard</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload & Paste Zone */}
      {!imageBlob ? (
        <div className="space-y-4">
          <div
            onClick={handleReadClipboard}
            className="group border-2 border-dashed border-neutral-300/80 dark:border-neutral-700/80 hover:border-amber-500/70 dark:hover:border-amber-400/60 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all bg-gradient-to-b from-white/70 to-neutral-50/50 dark:from-neutral-900/40 dark:to-[#0c0e14]/60"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Clipboard className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
              Press <kbd className="font-mono bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-lg">Ctrl + V</kbd> to Paste Any Image
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Works directly with screenshots, copied web photos, Figma/Photoshop clips, or image files.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20">
              <Clipboard className="w-3.5 h-3.5" />
              <span>Click to Paste from Clipboard</span>
            </div>
          </div>

          {/* URL Fetch Input */}
          <div className="p-4 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-amber-500" />
              <span>Or Paste an Image URL / Base64 Data URI:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                placeholder="https://example.com/photo.jpg or data:image/png;base64,..."
                className="flex-1 bg-background border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                disabled={isProcessing || !urlInput.trim()}
                onClick={() => handleFetchUrl()}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                {isProcessing ? 'Loading...' : 'Load'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace when Image is Pasted */
        <div className="space-y-5">
          {/* Preview Canvas */}
          <div className="p-4 sm:p-5 rounded-3xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[10px]">
                  PASTED
                </span>
                {dimensions && (
                  <span className="font-mono text-neutral-500">
                    {dimensions.width} &times; {dimensions.height} px
                  </span>
                )}
                <span className="font-mono text-neutral-400">
                  • {formatBytes(imageBlob.size)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyImageBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
                  title="Copy as PNG to clipboard"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? 'Copied!' : 'Copy Image'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cleanPreviewUrl();
                    setImageBlob(null);
                    setPreviewUrl(null);
                    setDimensions(null);
                  }}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  title="Paste another image"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Container with Checkered Transparency */}
            <div
              className="relative min-h-[260px] max-h-[440px] rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 p-4 flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(45deg, rgba(120,120,120,0.10) 25%, transparent 25%),
                                  linear-gradient(-45deg, rgba(120,120,120,0.10) 25%, transparent 25%),
                                  linear-gradient(45deg, transparent 75%, rgba(120,120,120,0.10) 75%),
                                  linear-gradient(-45deg, transparent 75%, rgba(120,120,120,0.10) 75%)`,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={baseFilename}
                  className="max-w-full max-h-[400px] object-contain rounded-xl select-none"
                />
              )}
            </div>

            {/* Format & Download Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs">
              {/* Filename Input */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                  Filename
                </label>
                <div className="flex items-center rounded-xl bg-background border border-neutral-300 dark:border-neutral-700 px-3 py-2">
                  <Pencil className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={baseFilename}
                    onChange={(e) => setBaseFilename(e.target.value)}
                    className="w-full bg-transparent font-mono outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Format Selector */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                  Save Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as SupportedImageFormat)}
                  className="w-full bg-background border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none focus:border-amber-500"
                >
                  <option value="image/png">PNG (Lossless)</option>
                  <option value="image/webp">WebP (Optimized)</option>
                  <option value="image/jpeg">JPEG (Standard Photo)</option>
                  <option value="image/avif">AVIF (Next-Gen)</option>
                  <option value="image/x-icon">ICO (Icon)</option>
                  <option value="image/bmp">BMP (Bitmap)</option>
                </select>
              </div>

              {/* Quality Slider (for lossy formats) */}
              {['image/webp', 'image/jpeg', 'image/avif'].includes(targetFormat) && (
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="flex justify-between items-center font-bold text-neutral-700 dark:text-neutral-300">
                    <span>Quality</span>
                    <span className="font-mono text-amber-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-2 mt-2 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Action Download Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing...'
                    : `Download as ${targetFormat.replace('image/', '').toUpperCase()}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasteDownloadTool;
