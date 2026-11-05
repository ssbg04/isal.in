import React, { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  FolderArchive,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Check,
  MoveUp,
  MoveDown,
  Trash2,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';
import { convertImagesToPdf, type ConversionResult } from '../../services/conversionService';
import { convertPdfToImages, type PdfPageImage } from '../../services/pdfConversionService';

export interface PdfConverterToolProps {
  initialMode?: 'images-to-pdf' | 'pdf-to-image';
}

export const PdfConverterTool: React.FC<PdfConverterToolProps> = ({
  initialMode = 'images-to-pdf',
}) => {
  const [mode, setMode] = useState<'images-to-pdf' | 'pdf-to-image'>(initialMode);

  // Images to PDF state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState<ConversionResult | null>(null);
  const [pdfCustomName, setPdfCustomName] = useState('merged-documents');

  // PDF to Images state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [targetImageFormat, setTargetImageFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [resolutionScale, setResolutionScale] = useState<number>(2.0);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedPages, setExtractedPages] = useState<PdfPageImage[]>([]);
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null);
  const [zipFilename, setZipFilename] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Images to PDF ---
  const handleAddImages = (newFiles: FileList | File[] | null) => {
    if (!newFiles) return;
    const incoming = Array.from(newFiles).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) {
      setErrorMsg('Please select valid image files (PNG, JPG, WebP, etc.).');
      return;
    }
    setErrorMsg(null);
    setPdfResult(null);
    setImageFiles((prev) => [...prev, ...incoming]);
  };

  const handleCompilePdf = async () => {
    if (imageFiles.length === 0) return;
    setIsCompilingPdf(true);
    setErrorMsg(null);
    try {
      const res = await convertImagesToPdf(imageFiles);
      const cleanName = pdfCustomName.trim().replace(/[\\/:*?"<>|]+/g, '_') || 'merged-documents';
      res.filename = `${cleanName}.pdf`;
      setPdfResult(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to compile PDF document.');
    } finally {
      setIsCompilingPdf(false);
    }
  };

  const handleReorderImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageFiles.length) return;
    const reordered = [...imageFiles];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setImageFiles(reordered);
  };

  // --- Handlers for PDF to Images ---
  const handleSelectPdf = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      return;
    }
    setErrorMsg(null);
    setPdfFile(file);
    setExtractedPages([]);
    setZipDownloadUrl(null);
  };

  const handleExtractPages = async () => {
    if (!pdfFile) return;
    setIsExtractingPages(true);
    setExtractionProgress(0);
    setErrorMsg(null);
    try {
      const res = await convertPdfToImages(
        pdfFile,
        {
          format: targetImageFormat,
          scale: resolutionScale,
        },
        (pct) => setExtractionProgress(pct)
      );
      setExtractedPages(res.pages);
      if (res.zipDownloadUrl) {
        setZipDownloadUrl(res.zipDownloadUrl);
        setZipFilename(res.zipFilename || `${res.baseFilename}-images.zip`);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to extract images from PDF.');
    } finally {
      setIsExtractingPages(false);
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
    <div className="space-y-6">
      {/* Bidirectional Mode Switcher */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setMode('images-to-pdf');
              setErrorMsg(null);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'images-to-pdf'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Images to PDF</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('pdf-to-image');
              setErrorMsg(null);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'pdf-to-image'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>PDF to Images</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>100% In-Browser</span>
          <span>•</span>
          <span>No Server Upload</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: IMAGES TO PDF                                     */}
      {/* ======================================================== */}
      {mode === 'images-to-pdf' && (
        <div className="space-y-5">
          {imageFiles.length === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleAddImages(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-neutral-300/80 dark:border-neutral-700/80 hover:border-amber-500/70 dark:hover:border-amber-400/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-gradient-to-b from-white/70 to-neutral-50/50 dark:from-neutral-900/40 dark:to-[#0c0e14]/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.bmp"
                className="hidden"
                onChange={(e) => handleAddImages(e.target.files)}
              />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                Drop images here to compile into PDF
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                Combine JPG, PNG, WebP, AVIF, and BMP photos into a single organized document.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20">
                <span>Choose Images</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Queue Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {imageFiles.length} Image{imageFiles.length === 1 ? '' : 's'} Selected
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Use arrows to reorder pages before compiling into PDF
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-panel border border-neutral-300 dark:border-white/10 hover:border-amber-500/40 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-amber-500" />
                    <span>Add More</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAddImages(e.target.files)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFiles([]);
                      setPdfResult(null);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Clear list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Pages Reorder List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {imageFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="p-2.5 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-neutral-900/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="font-semibold text-neutral-900 dark:text-white truncate text-xs sm:text-sm">
                        {file.name}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {formatBytes(file.size)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleReorderImage(idx, idx - 1)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === imageFiles.length - 1}
                        onClick={() => handleReorderImage(idx, idx + 1)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button & Options */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <div className="flex items-center rounded-xl bg-background border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs flex-1">
                  <span className="text-neutral-400 mr-2 font-mono">Filename:</span>
                  <input
                    type="text"
                    value={pdfCustomName}
                    onChange={(e) => setPdfCustomName(e.target.value)}
                    className="w-full bg-transparent font-mono outline-none text-neutral-900 dark:text-white"
                  />
                  <span className="text-neutral-400 font-mono text-xs">.pdf</span>
                </div>

                <button
                  type="button"
                  disabled={isCompilingPdf}
                  onClick={handleCompilePdf}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCompilingPdf ? 'Compiling Document...' : `Create PDF (${imageFiles.length} Pages)`}</span>
                </button>
              </div>

              {/* PDF Compilation Success Card */}
              {pdfResult && (
                <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>PDF Document Successfully Created!</span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400">
                      {formatBytes(pdfResult.sizeBytes || 0)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={pdfResult.downloadUrl}
                      download={pdfResult.filename}
                      className="flex-1 w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {pdfResult.filename}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles([]);
                        setPdfResult(null);
                      }}
                      className="py-3 px-4 rounded-xl glass-panel text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Create Another</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: PDF TO IMAGES (VICE VERSA)                         */}
      {/* ======================================================== */}
      {mode === 'pdf-to-image' && (
        <div className="space-y-5">
          {!pdfFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleSelectPdf(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-neutral-300/80 dark:border-neutral-700/80 hover:border-amber-500/70 dark:hover:border-amber-400/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-gradient-to-b from-white/70 to-neutral-50/50 dark:from-neutral-900/40 dark:to-[#0c0e14]/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleSelectPdf(e.target.files)}
              />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                Drop PDF here to extract pages as images
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                Convert every page of your PDF into crisp, high-resolution PNG, JPG, or WebP images.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20">
                <span>Select PDF File</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected File & Settings Bar */}
              <div className="p-4 sm:p-5 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/60 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {pdfFile.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {formatBytes(pdfFile.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setExtractedPages([]);
                      setZipDownloadUrl(null);
                    }}
                    className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    title="Change PDF"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                      Target Image Format
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => {
                        const lbl = fmt === 'image/jpeg' ? 'JPG' : fmt === 'image/webp' ? 'WebP' : 'PNG';
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setTargetImageFormat(fmt)}
                            className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                              targetImageFormat === fmt
                                ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10'
                            }`}
                          >
                            {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
                      Resolution Quality
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { scale: 1.5, lbl: 'Standard' },
                        { scale: 2.0, lbl: 'High (2x)' },
                        { scale: 3.0, lbl: 'Ultra (3x)' },
                      ].map((item) => (
                        <button
                          key={item.scale}
                          type="button"
                          onClick={() => setResolutionScale(item.scale)}
                          className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                            resolutionScale === item.scale
                              ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                              : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10'
                          }`}
                        >
                          {item.lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Extract Trigger Button */}
                <button
                  type="button"
                  disabled={isExtractingPages}
                  onClick={handleExtractPages}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {isExtractingPages
                      ? `Extracting Pages (${extractionProgress}%)...`
                      : 'Convert All PDF Pages to Images'}
                  </span>
                </button>
              </div>

              {/* Progress Indicator */}
              {isExtractingPages && (
                <div className="p-4 rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-neutral-600 dark:text-neutral-300">
                    <span>Rendering PDF pages on HTML5 Canvas...</span>
                    <span>{extractionProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-150"
                      style={{ width: `${extractionProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Extracted Pages Grid */}
              {extractedPages.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span className="font-bold">
                        Successfully converted {extractedPages.length} page{extractedPages.length === 1 ? '' : 's'}!
                      </span>
                    </div>

                    {zipDownloadUrl && (
                      <a
                        href={zipDownloadUrl}
                        download={zipFilename}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <FolderArchive className="w-4 h-4" />
                        <span>Download All as ZIP</span>
                      </a>
                    )}
                  </div>

                  {/* Thumbnails Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {extractedPages.map((page) => (
                      <div
                        key={page.pageNumber}
                        className="rounded-2xl glass-card border border-neutral-200/80 dark:border-white/10 p-3 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center max-h-56">
                          <img
                            src={page.downloadUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-auto max-h-56 object-contain"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-950/80 text-white font-mono text-[10px] font-bold">
                            Page {page.pageNumber}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="text-[11px] font-mono text-neutral-500">
                            <span>{page.width} &times; {page.height}</span>
                            <span className="mx-1">•</span>
                            <span>{formatBytes(page.sizeBytes)}</span>
                          </div>

                          <a
                            href={page.downloadUrl}
                            download={page.filename}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 cursor-pointer"
                            title={`Download page ${page.pageNumber}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfConverterTool;
