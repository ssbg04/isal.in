export type ToolType = 
  | 'image-convert'
  | 'images-to-pdf'
  | 'json-yaml'
  | 'base64'
  | 'url-encode'
  | 'uuid'
  | 'color-convert'
  | 'markdown-html'
  | 'csv-json'
  | 'hash-calc'
  | 'unit-convert'
  | 'length-convert'
  | 'mass-convert'
  | 'area-convert'
  | 'volume-convert'
  | 'temperature-convert'
  | 'speed-convert'
  | 'time-convert'
  | 'number-system'
  | 'income-tax-ph'
  | 'mortgage-calc'
  | 'electricity-calc'
  | 'bmi-calc'
  | 'gwa-calc';

export interface ConversionResult {
  filename: string;
  blob?: Blob;
  downloadUrl?: string;
  textOutput?: string;
  sizeBytes?: number;
  originalSizeBytes?: number;
}

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  r: number;
  g: number;
  b: number;
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
              originalSizeBytes: file.size,
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

/** Combine multiple images into a single PDF document in-browser (dynamically loads pdf-lib) */
export async function convertImagesToPdf(files: File[]): Promise<ConversionResult> {
  const { PDFDocument } = await import('pdf-lib');
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
  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  return {
    filename: 'merged-documents.pdf',
    blob,
    downloadUrl,
    sizeBytes: blob.size,
    originalSizeBytes: totalOriginalSize,
  };
}

/** Create a downloadable ZIP archive containing all converted files (dynamically loads jszip) */
export async function createZipArchive(
  items: ConversionResult[],
  archiveName: string = 'multi-converter-batch.zip'
): Promise<ConversionResult> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const item of items) {
    if (item.blob) {
      zip.file(item.filename, item.blob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipBlob);

  return {
    filename: archiveName,
    blob: zipBlob,
    downloadUrl,
    sizeBytes: zipBlob.size,
  };
}

/** JSON <-> YAML converter (dynamically loads js-yaml) */
export async function convertJsonYaml(input: string, direction: 'json-to-yaml' | 'yaml-to-json'): Promise<string> {
  if (!input.trim()) return '';
  const { dump, load } = await import('js-yaml');
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

/** Color Converter: Parses HEX, RGB, or HSL and computes all formats */
export function parseColor(rawInput: string): ColorFormats | null {
  const input = rawInput.trim();
  let r = 0, g = 0, b = 0;

  // 1. HEX match (#fff or #ffffff)
  const hexMatch = input.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i) ||
                   input.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (hexMatch) {
    if (hexMatch[1].length === 1) {
      r = parseInt(hexMatch[1] + hexMatch[1], 16);
      g = parseInt(hexMatch[2] + hexMatch[2], 16);
      b = parseInt(hexMatch[3] + hexMatch[3], 16);
    } else {
      r = parseInt(hexMatch[1], 16);
      g = parseInt(hexMatch[2], 16);
      b = parseInt(hexMatch[3], 16);
    }
  } else {
    // 2. RGB match: rgb(255, 255, 255) or 255, 255, 255
    const rgbMatch = input.match(/rgba?\(?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
    if (rgbMatch) {
      r = Math.min(255, parseInt(rgbMatch[1], 10));
      g = Math.min(255, parseInt(rgbMatch[2], 10));
      b = Math.min(255, parseInt(rgbMatch[3], 10));
    } else {
      return null;
    }
  }

  // Format outputs
  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // Calculate HSL
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  const hsl = `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  // Calculate CMYK
  let c = 0, m = 0, y = 0, k = 0;
  if (r === 0 && g === 0 && b === 0) {
    k = 100;
  } else {
    const cVal = 1 - rn;
    const mVal = 1 - gn;
    const yVal = 1 - bn;
    const kVal = Math.min(cVal, mVal, yVal);
    c = Math.round(((cVal - kVal) / (1 - kVal)) * 100);
    m = Math.round(((mVal - kVal) / (1 - kVal)) * 100);
    y = Math.round(((yVal - kVal) / (1 - kVal)) * 100);
    k = Math.round(kVal * 100);
  }
  const cmyk = `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;

  return { hex, rgb, hsl, cmyk, r, g, b };
}

/** Fast, secure client-side Markdown to HTML converter */
export function markdownToHtml(rawMd: string): string {
  if (!rawMd.trim()) return '';

  let html = rawMd
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:[^"']*/gi, '');

  // Fenced Code blocks
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="my-3 p-3.5 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto"><code>${escaped}</code></pre>`;
  });

  // Headers (# H1 to ###### H6)
  html = html
    .replace(/^###### (.*$)/gim, '<h6 class="text-xs font-bold my-2 text-neutral-800 dark:text-neutral-200">$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5 class="text-sm font-bold my-2 text-neutral-800 dark:text-neutral-200">$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold my-2.5 text-neutral-900 dark:text-neutral-100">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-3 text-neutral-900 dark:text-neutral-100">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-3.5 border-b border-neutral-200 dark:border-neutral-800 pb-1 text-neutral-900 dark:text-neutral-100">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold my-4 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-neutral-950 dark:text-white">$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-3 my-2 text-neutral-600 dark:text-neutral-400 italic text-xs">$1</blockquote>');

  // Horizontal Rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gim, '<hr class="my-4 border-neutral-200 dark:border-neutral-800" />');

  // Bold & Italic & Strikethrough
  html = html
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-neutral-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/~~(.*?)~~/g, '<del class="line-through text-neutral-400">$1</del>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono text-xs">$1</code>');

  // Images and Links
  html = html
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-3 max-h-60 rounded-lg border border-neutral-200 dark:border-neutral-800 object-contain" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80">$1</a>');

  // Unordered list items (- or *)
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-4 list-disc text-neutral-700 dark:text-neutral-300 my-0.5">$1</li>');

  // Paragraphs
  html = html.replace(/\n{2,}/g, '</p><p class="my-2 leading-relaxed text-neutral-700 dark:text-neutral-300">');

  return `<div class="prose-clean space-y-1">${html}</div>`;
}

/** Basic HTML to Markdown converter */
export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img\s+[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<hr\s*\/?>/gi, '---\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** Parse CSV / TSV string into an array of objects or rows */
export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  rawRows: string[][];
  error?: string;
}

export function parseCsv(
  csvText: string,
  delimiter: string = ',',
  hasHeader: boolean = true
): CsvParseResult {
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], rawRows: [] };
  }

  // Tokenize CSV according to RFC 4180
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  const d = delimiter;
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === d && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      currentVal = '';
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  let headers: string[] = [];
  let dataRows: string[][] = [];

  if (hasHeader) {
    headers = rows[0].map((h, idx) => (h ? h : `col_${idx + 1}`));
    dataRows = rows.slice(1);
  } else {
    const maxCols = Math.max(...rows.map((r) => r.length));
    headers = Array.from({ length: maxCols }, (_, idx) => `col_${idx + 1}`);
    dataRows = rows;
  }

  const objects: Record<string, string | number | boolean | null>[] = dataRows.map((row) => {
    const obj: Record<string, string | number | boolean | null> = {};
    headers.forEach((header, colIndex) => {
      const val = row[colIndex] ?? '';
      if (val === '') {
        obj[header] = '';
      } else if (val.toLowerCase() === 'true') {
        obj[header] = true;
      } else if (val.toLowerCase() === 'false') {
        obj[header] = false;
      } else if (val.toLowerCase() === 'null') {
        obj[header] = null;
      } else if (!isNaN(Number(val)) && val.trim() !== '') {
        obj[header] = Number(val);
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });

  return { headers, rows: objects, rawRows: rows };
}

/** Convert JSON array of objects to CSV/TSV */
export function jsonToCsv(jsonInput: string, delimiter: string = ','): { csv: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonInput);
    let items: Record<string, unknown>[] = [];
    if (Array.isArray(parsed)) {
      items = parsed.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
    } else if (typeof parsed === 'object' && parsed !== null) {
      items = [parsed as Record<string, unknown>];
    } else {
      return { csv: '', error: 'Input JSON must be an array of objects or an object.' };
    }

    if (items.length === 0) return { csv: '' };

    // Extract all unique keys
    const headersSet = new Set<string>();
    items.forEach((item) => {
      Object.keys(item).forEach((k) => headersSet.add(k));
    });
    const headers = Array.from(headersSet);
    if (headers.length === 0) return { csv: '', error: 'No properties found in JSON objects.' };

    const formatCell = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headerLine = headers.map(formatCell).join(delimiter);
    const rowLines = items.map((item) => {
      return headers
        .map((h) => {
          const val = item[h];
          return formatCell(val);
        })
        .join(delimiter);
    });

    return { csv: [headerLine, ...rowLines].join('\n') };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid JSON format';
    return { csv: '', error: message };
  }
}

export interface HashResult {
  sha256: string;
  sha512: string;
  sha384: string;
  sha1: string;
  md5: string;
}

/** Lightweight RFC 1321 MD5 implementation */
export function md5(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;

  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  words[(((n + 8) >> 6) << 4) + 14] = n * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;

    a = ff(a, b, c, d, words[i] || 0, 7, -680876936);
    d = ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = gg(b, c, d, a, words[i] || 0, 20, -373897302);
    a = gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = hh(d, a, b, c, words[i] || 0, 11, -358537222);
    c = hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = ii(a, b, c, d, words[i] || 0, 6, -198630844);
    d = ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  function rhex(n: number) {
    let s = '';
    for (let j = 0; j <= 3; j++) {
      s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
    }
    return s;
  }
  return (rhex(a) + rhex(b) + rhex(c) + rhex(d)).toLowerCase();
}

/** Compute SHA-256, SHA-512, SHA-384, SHA-1, and MD5 simultaneously */
export async function computeAllHashes(data: string | ArrayBuffer): Promise<HashResult> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const uint8 = new Uint8Array(buffer);

  const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
    crypto.subtle.digest('SHA-256', buffer),
    crypto.subtle.digest('SHA-512', buffer),
    crypto.subtle.digest('SHA-384', buffer),
    crypto.subtle.digest('SHA-1', buffer),
  ]);

  const toHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  return {
    sha256: toHex(sha256Buf),
    sha512: toHex(sha512Buf),
    sha384: toHex(sha384Buf),
    sha1: toHex(sha1Buf),
    md5: md5(uint8),
  };
}

export interface CssUnitResults {
  px: number;
  rem: number;
  em: number;
  pt: number;
}

export function convertCssUnits(val: number, from: 'px' | 'rem' | 'em' | 'pt', baseFontSize: number = 16): CssUnitResults {
  const safeBase = baseFontSize > 0 ? baseFontSize : 16;
  let pxVal = val;
  if (from === 'rem' || from === 'em') {
    pxVal = val * safeBase;
  } else if (from === 'pt') {
    pxVal = (val * 96) / 72;
  }

  return {
    px: Number(pxVal.toFixed(2)),
    rem: Number((pxVal / safeBase).toFixed(4)),
    em: Number((pxVal / safeBase).toFixed(4)),
    pt: Number(((pxVal * 72) / 96).toFixed(2)),
  };
}

export interface DataUnitBreakdown {
  bytes: number;
  kb: number;
  mb: number;
  gb: number;
  tb: number;
  kib: number;
  mib: number;
  gib: number;
  tib: number;
}

export function convertDataStorage(val: number, fromUnit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'KiB' | 'MiB' | 'GiB' | 'TiB'): DataUnitBreakdown {
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1000,
    MB: 1000 ** 2,
    GB: 1000 ** 3,
    TB: 1000 ** 4,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
    TiB: 1024 ** 4,
  };

  const bytes = val * (multipliers[fromUnit] || 1);

  return {
    bytes,
    kb: bytes / 1000,
    mb: bytes / (1000 ** 2),
    gb: bytes / (1000 ** 3),
    tb: bytes / (1000 ** 4),
    kib: bytes / 1024,
    mib: bytes / (1024 ** 2),
    gib: bytes / (1024 ** 3),
    tib: bytes / (1024 ** 4),
  };
}

export interface TimestampResults {
  epochSeconds: number;
  epochMs: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
}

export function parseTimestampOrDate(input: string | number): TimestampResults | null {
  let date: Date;
  if (typeof input === 'number' || (!isNaN(Number(input)) && String(input).trim() !== '')) {
    const num = Number(input);
    const ms = num < 1e11 ? num * 1000 : num;
    date = new Date(ms);
  } else {
    date = new Date(input);
  }

  if (isNaN(date.getTime())) return null;

  const ms = date.getTime();
  const sec = Math.floor(ms / 1000);
  const diffSec = Math.floor((ms - Date.now()) / 1000);

  let relative = '';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffSec) < 60) {
    relative = rtf.format(diffSec, 'second');
  } else if (Math.abs(diffSec) < 3600) {
    relative = rtf.format(Math.round(diffSec / 60), 'minute');
  } else if (Math.abs(diffSec) < 86400) {
    relative = rtf.format(Math.round(diffSec / 3600), 'hour');
  } else {
    relative = rtf.format(Math.round(diffSec / 86400), 'day');
  }

  return {
    epochSeconds: sec,
    epochMs: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative,
  };
}




