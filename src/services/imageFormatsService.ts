// Image Formats Encoder: WebP, PNG, JPEG, AVIF, BMP, ICO, and GIF

export type SupportedImageFormat = 
  | 'image/webp'
  | 'image/png'
  | 'image/jpeg'
  | 'image/avif'
  | 'image/bmp'
  | 'image/x-icon'
  | 'image/gif';

export interface ImageFormatOption {
  mime: SupportedImageFormat;
  extension: string;
  label: string;
  description: string;
}

export const SUPPORTED_IMAGE_FORMATS: ImageFormatOption[] = [
  { mime: 'image/webp', extension: 'webp', label: 'WebP', description: 'Modern efficient web format with rich transparency' },
  { mime: 'image/png', extension: 'png', label: 'PNG', description: 'Lossless quality with full 32-bit alpha transparency' },
  { mime: 'image/jpeg', extension: 'jpg', label: 'JPEG / JPG', description: 'Universal photo format with high compression' },
  { mime: 'image/avif', extension: 'avif', label: 'AVIF', description: 'Next-gen open media format with extreme compression' },
  { mime: 'image/bmp', extension: 'bmp', label: 'BMP', description: 'Standard uncompressed Windows bitmap' },
  { mime: 'image/x-icon', extension: 'ico', label: 'ICO (Favicon)', description: 'Multi-resolution Windows & website favicon icon' },
  { mime: 'image/gif', extension: 'gif', label: 'GIF', description: 'Standard graphics interchange format' },
];

/** Encode Canvas ImageData into a 32-bit uncompressed BMP file */
export function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const extraBytes = (4 - ((width * 3) % 4)) % 4; // 24-bit 4-byte padding
  const imageSize = (width * 3 + extraBytes) * height;
  const fileSize = 54 + imageSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // 1. BMP Header (14 bytes)
  view.setUint16(0, 0x424d, false); // 'BM'
  view.setUint32(2, fileSize, true); // File size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Offset to pixel data

  // 2. DIB Header (BITMAPINFOHEADER 40 bytes)
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Width
  view.setInt32(22, height, true); // Height (positive = bottom-to-top)
  view.setUint16(26, 1, true); // Planes
  view.setUint16(28, 24, true); // 24 bits per pixel (RGB)
  view.setUint32(30, 0, true); // BI_RGB (uncompressed)
  view.setUint32(34, imageSize, true); // Image size
  view.setInt32(38, 2835, true); // ~72 DPI horizontal (pixels/meter)
  view.setInt32(42, 2835, true); // ~72 DPI vertical
  view.setUint32(46, 0, true); // Colors in color table
  view.setUint32(50, 0, true); // Important color count

  // 3. Pixel Data (Bottom-to-Top, BGR order)
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // BMP uses BGR
      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }
    for (let p = 0; p < extraBytes; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/** Encode Canvas into a standard PNG-wrapped ICO icon file */
export async function canvasToIcoBlob(canvas: HTMLCanvasElement, targetSize: number = 64): Promise<Blob> {
  // Resize to icon dimensions (e.g. 16, 32, 48, 64, 128, 256)
  const size = Math.min(256, Math.max(16, targetSize));
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = size;
  iconCanvas.height = size;
  const ctx = iconCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, size, size);

  // Get PNG bytes
  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    iconCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG blob creation failed'))), 'image/png');
  });

  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const icoFileSize = 6 + 16 + pngBytes.length;
  const icoBuffer = new ArrayBuffer(icoFileSize);
  const view = new DataView(icoBuffer);

  // ICONDIR Header (6 bytes)
  view.setUint16(0, 0, true); // Reserved (must be 0)
  view.setUint16(2, 1, true); // Resource Type (1 = Icon .ico)
  view.setUint16(4, 1, true); // Image count = 1

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, size === 256 ? 0 : size); // Width
  view.setUint8(7, size === 256 ? 0 : size); // Height
  view.setUint8(8, 0); // Color count
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngBytes.length, true); // Size of image data
  view.setUint32(18, 22, true); // Offset of image data (6 + 16 = 22)

  // Copy PNG bytes into ICO file
  new Uint8Array(icoBuffer, 22).set(pngBytes);

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
