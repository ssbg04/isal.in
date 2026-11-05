// PDF to Image Conversion Service via PDF.js & HTML5 Canvas
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { createZipArchive } from './conversionService';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface PdfPageImage {
  pageNumber: number;
  blob: Blob;
  downloadUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

export interface PdfToImageResult {
  pages: PdfPageImage[];
  totalPages: number;
  baseFilename: string;
  zipBlob?: Blob;
  zipDownloadUrl?: string;
  zipFilename?: string;
}

export async function convertPdfToImages(
  file: File,
  options: {
    format?: 'image/png' | 'image/jpeg' | 'image/webp';
    scale?: number;
    quality?: number;
  } = {},
  onProgress?: (progressPercent: number) => void
): Promise<PdfToImageResult> {
  const format = options.format || 'image/png';
  const scale = options.scale || 2.0;
  const quality = options.quality ?? 0.92;
  const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const pages: PdfPageImage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // Fill white background for transparent PDF pages (especially for JPEG/PNG output)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const pageFilename = `${baseName}-page-${pageNum}.${ext}`;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error(`Failed to convert page ${pageNum} to ${ext}`))),
        format,
        quality
      );
    });

    const downloadUrl = URL.createObjectURL(blob);
    pages.push({
      pageNumber: pageNum,
      blob,
      downloadUrl,
      width: viewport.width,
      height: viewport.height,
      sizeBytes: blob.size,
      filename: pageFilename,
    });

    if (onProgress) {
      onProgress(Math.round((pageNum / totalPages) * 100));
    }
  }

  // Create zip bundle
  const zipRes = await createZipArchive(
    pages.map((p) => ({
      filename: p.filename,
      blob: p.blob,
      downloadUrl: p.downloadUrl,
      sizeBytes: p.sizeBytes,
    })),
    `${baseName}-all-pages.zip`
  );

  return {
    pages,
    totalPages,
    baseFilename: baseName,
    zipBlob: zipRes.blob,
    zipDownloadUrl: zipRes.downloadUrl,
    zipFilename: zipRes.filename,
  };
}
