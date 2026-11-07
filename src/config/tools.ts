export type ToolType = 
  | 'image-convert'
  | 'images-to-pdf'
  | 'pdf-to-image'
  | 'audio-convert'
  | 'video-convert'
  | 'paste-download'
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

export const SITE_URL = 'https://isal.in';
export const SITE_NAME = 'Isalin';
export type Category = 'media' | 'developer' | 'security' | 'units' | 'calculators';

export interface ToolMeta {
  id: ToolType;
  title: string;
  category: Category;
  shortDesc: string;
  badge: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'image-convert',
    title: 'Image Converter & Resizer',
    category: 'media',
    shortDesc: 'WebP, PNG, JPG, AVIF, BMP, ICO with compression & dimensions',
    badge: 'Media',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF Document',
    category: 'media',
    shortDesc: 'Bundle multiple pictures into a single organized PDF',
    badge: 'Media',
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image Extractor',
    category: 'media',
    shortDesc: 'Extract all PDF pages into high-resolution PNG, JPG, or WebP images and ZIP',
    badge: 'Media',
  },
  {
    id: 'audio-convert',
    title: 'Audio Converter & Extractor',
    category: 'media',
    shortDesc: 'MP3, WAV, WebM, OGG with volume boost, trimming & video extraction',
    badge: 'Audio',
  },
  {
    id: 'video-convert',
    title: 'Video Converter & GIF Maker',
    category: 'media',
    shortDesc: 'MP4, WebM transcoding, animated GIF creation, resolution scaling & snapshots',
    badge: 'Video',
  },
  {
    id: 'paste-download',
    title: 'Paste to Download',
    category: 'media',
    shortDesc: 'Paste screenshots, clipboard images, or URLs to preview and download in any format',
    badge: 'Media',
  },
  {
    id: 'json-yaml',
    title: 'JSON ⇄ YAML Transformer',
    category: 'developer',
    shortDesc: 'Bi-directional serialization parsing and syntax formatting',
    badge: 'Data',
  },
  {
    id: 'base64',
    title: 'Base64 Encoder / Decoder',
    category: 'security',
    shortDesc: 'Safely encode binary or text representations',
    badge: 'Encoding',
  },
  {
    id: 'url-encode',
    title: 'URL Percent Encoder',
    category: 'developer',
    shortDesc: 'Query param escaping & URI string decoding',
    badge: 'Web',
  },
  {
    id: 'uuid',
    title: 'UUID v4 Identifier Generator',
    category: 'developer',
    shortDesc: 'Cryptographically secure standard random tokens',
    badge: 'Crypto',
  },
  {
    id: 'color-convert',
    title: 'Color Format Converter',
    category: 'developer',
    shortDesc: 'Instant bidirectional HEX, RGB, HSL, and CMYK with visual color picker',
    badge: 'Design',
  },
  {
    id: 'markdown-html',
    title: 'Markdown ⇄ HTML Live Editor',
    category: 'developer',
    shortDesc: 'Live bidirectional Markdown and rendered HTML with syntax formatting',
    badge: 'Text',
  },
  {
    id: 'csv-json',
    title: 'CSV ⇄ JSON & Data Table',
    category: 'developer',
    shortDesc: 'Parse CSV/TSV spreadsheets into JSON arrays with interactive data table & delimiter choices',
    badge: 'Data',
  },
  {
    id: 'hash-calc',
    title: 'Cryptographic Hash & Checksum',
    category: 'security',
    shortDesc: 'Compute SHA-256, SHA-512, MD5, and verify file or text integrity checksums',
    badge: 'Crypto',
  },
  {
    id: 'unit-convert',
    title: 'CSS & Dev Unit Converter',
    category: 'developer',
    shortDesc: 'CSS px ⇄ rem typography, byte storage scaling, and Unix epoch timestamp decoder',
    badge: 'Utility',
  },
  // Measurement & Unit Converters
  {
    id: 'length-convert',
    title: 'Length & Distance Converter',
    category: 'units',
    shortDesc: 'Meters, kilometers, centimeters, feet, inches, yards, and nautical miles',
    badge: 'Units',
  },
  {
    id: 'mass-convert',
    title: 'Mass & Weight Converter',
    category: 'units',
    shortDesc: 'Kilograms, grams, pounds (lbs), ounces, stones, and metric tons',
    badge: 'Units',
  },
  {
    id: 'area-convert',
    title: 'Area & Land Converter',
    category: 'units',
    shortDesc: 'Square meters, hectares, acres, square feet, and square kilometers',
    badge: 'Units',
  },
  {
    id: 'volume-convert',
    title: 'Volume & Capacity Converter',
    category: 'units',
    shortDesc: 'Liters, milliliters, US/Imperial gallons, cups, tablespoons, and cubic meters',
    badge: 'Units',
  },
  {
    id: 'temperature-convert',
    title: 'Temperature Converter',
    category: 'units',
    shortDesc: 'Celsius, Fahrenheit, Kelvin, and Rankine thermal scales',
    badge: 'Physics',
  },
  {
    id: 'speed-convert',
    title: 'Speed & Velocity Converter',
    category: 'units',
    shortDesc: 'km/h, mph, m/s, knots, ft/s, and Mach speed calculations',
    badge: 'Physics',
  },
  {
    id: 'time-convert',
    title: 'Time & Duration Converter',
    category: 'units',
    shortDesc: 'Seconds, minutes, hours, days, weeks, months, and years',
    badge: 'Time',
  },
  {
    id: 'number-system',
    title: 'Numerical System & Radix',
    category: 'units',
    shortDesc: 'Decimal, Binary nibbles, Hexadecimal, Octal, ASCII, and Roman numerals',
    badge: 'Math',
  },
  // Everyday & Philippine Calculators
  {
    id: 'income-tax-ph',
    title: 'Philippine Income Tax & Salary',
    category: 'calculators',
    shortDesc: 'TRAIN Law 2023+ revised brackets, SSS, PhilHealth, Pag-IBIG & take-home pay',
    badge: 'PH Tax',
  },
  {
    id: 'mortgage-calc',
    title: 'Mortgage & Loan Calculator',
    category: 'calculators',
    shortDesc: 'Pag-IBIG & bank housing loans, monthly amortization and payment schedule',
    badge: 'Finance',
  },
  {
    id: 'electricity-calc',
    title: 'Electricity & Sub-Meter Splitter',
    category: 'calculators',
    shortDesc: 'Apartment/tenant sub-meter bill calculation, effective kWh rate, & appliance costs',
    badge: 'Utility',
  },
  {
    id: 'bmi-calc',
    title: 'BMI & Body Health Calculator',
    category: 'calculators',
    shortDesc: 'Metric & Imperial Body Mass Index with Asian/WHO thresholds and ideal weight',
    badge: 'Health',
  },
  {
    id: 'gwa-calc',
    title: 'Philippine GPA / GWA Calculator',
    category: 'calculators',
    shortDesc: 'General Weighted Average (1.00–5.00), units weighting, and Latin Honors standings',
    badge: 'PH College',
  },
];

export const CATEGORIES: { id: Category; label: string; count: number }[] = [
  { id: 'media', label: 'Media & Documents', count: 6 },
  { id: 'developer', label: 'Data & Formats', count: 7 },
  { id: 'security', label: 'Encoding & Security', count: 2 },
  { id: 'units', label: 'Units & Measurements', count: 8 },
  { id: 'calculators', label: 'Calculators & PH', count: 5 },
];

export const isToolId = (id: string): id is ToolType => TOOLS.some((t) => t.id === id);
