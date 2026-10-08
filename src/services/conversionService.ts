import { PDFDocument } from 'pdf-lib';
import { dump, load } from 'js-yaml';

export type ToolType = 
  | 'image-convert'
  | 'images-to-pdf'
  | 'json-yaml'
  | 'base64'
  | 'url-encode'
  | 'uuid';

export interface ConversionResult {
  filename: string;
  blob?: Blob;
  downloadUrl?: string;
  textOutput?: string;
  sizeBytes?: number;
}

/** Convert image format (PNG, JPEG, WebP) and quality entirely in-browser */
export async function convertImage(
  file: File,
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp',
  quality: number = 0.85,
  maxWidth?: number,
  maxHeight?: number
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (maxWidth && width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context unavailable'));
        }

        // Fill white background for JPEG conversions if alpha exists
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Conversion failed'));
            const ext = targetFormat === 'image/png' ? 'png' : targetFormat === 'image/jpeg' ? 'jpg' : 'webp';
            const originalBase = file.name.replace(/\.[^/.]+$/, '');
            const newName = `${originalBase}-converted.${ext}`;
            const downloadUrl = URL.createObjectURL(blob);
            resolve({
              filename: newName,
              blob,
              downloadUrl,
              sizeBytes: blob.size,
            });
          },
          targetFormat,
          quality
        );
      };
      img.onerror = () => reject(new Error('Unable to read image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

/** Combine multiple images into a single PDF document in-browser */
export async function convertImagesToPdf(files: File[]): Promise<ConversionResult> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    let embeddedImage;

    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
      }
    } catch {
      // Fallback: convert via canvas to png first
      const fallbackResult = await convertImage(file, 'image/png');
      if (fallbackResult.blob) {
        const fbBuf = await fallbackResult.blob.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(fbBuf);
      } else {
        continue;
      }
    }

    const { width, height } = embeddedImage;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  return {
    filename: 'merged-documents.pdf',
    blob,
    downloadUrl,
    sizeBytes: blob.size,
  };
}

/** JSON <-> YAML converter */
export function convertJsonYaml(input: string, direction: 'json-to-yaml' | 'yaml-to-json'): string {
  if (!input.trim()) return '';
  if (direction === 'json-to-yaml') {
    const parsed = JSON.parse(input);
    return dump(parsed, { indent: 2 });
  } else {
    const parsed = load(input);
    return JSON.stringify(parsed, null, 2);
  }
}

/** Base64 Encoder / Decoder */
export function processBase64(input: string, mode: 'encode' | 'decode'): string {
  if (!input) return '';
  if (mode === 'encode') {
    return btoa(unescape(encodeURIComponent(input)));
  } else {
    return decodeURIComponent(escape(atob(input.trim())));
  }
}

/** URL Encoder / Decoder */
export function processUrlEncode(input: string, mode: 'encode' | 'decode'): string {
  if (!input) return '';
  return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
}

/** UUID Generator */
export function generateUUIDs(count: number = 5): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(crypto.randomUUID());
  }
  return result;
}
