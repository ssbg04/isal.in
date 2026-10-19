import type { ToolType } from './conversionService';
import { CATEGORY_UNIT_MAP, type UnitCategory } from './unitConversionService';

export interface NaturalConversionResult {
  query: string;
  categoryName: string;
  toolId: ToolType;
  inputValue: string | number;
  inputUnitName: string;
  outputUnitName: string;
  outputValue: string;
  formattedOutput: string;
  summary: string;
  confidence: number;
}

// Approximate Currency Benchmark for quick Philippine conversion queries
const CURRENCY_RATES_TO_PHP: Record<string, number> = {
  usd: 58.55,
  eur: 63.4,
  jpy: 0.388,
  gbp: 74.2,
  cad: 42.6,
  aud: 38.9,
  sgd: 44.2,
  hkd: 7.52,
  php: 1.0,
};

// Unit aliases to map shorthand to unitDefinition ID and category
interface UnitMapping {
  category: UnitCategory;
  unitId: string;
  name: string;
  symbol: string;
}

const UNIT_ALIASES: Record<string, UnitMapping> = {
  // Length
  cm: { category: 'length', unitId: 'cm', name: 'Centimeter', symbol: 'cm' },
  centimeter: { category: 'length', unitId: 'cm', name: 'Centimeter', symbol: 'cm' },
  centimeters: { category: 'length', unitId: 'cm', name: 'Centimeter', symbol: 'cm' },
  m: { category: 'length', unitId: 'm', name: 'Meter', symbol: 'm' },
  meter: { category: 'length', unitId: 'm', name: 'Meter', symbol: 'm' },
  meters: { category: 'length', unitId: 'm', name: 'Meter', symbol: 'm' },
  km: { category: 'length', unitId: 'km', name: 'Kilometer', symbol: 'km' },
  kilometer: { category: 'length', unitId: 'km', name: 'Kilometer', symbol: 'km' },
  kilometers: { category: 'length', unitId: 'km', name: 'Kilometer', symbol: 'km' },
  mm: { category: 'length', unitId: 'mm', name: 'Millimeter', symbol: 'mm' },
  millimeter: { category: 'length', unitId: 'mm', name: 'Millimeter', symbol: 'mm' },
  millimeters: { category: 'length', unitId: 'mm', name: 'Millimeter', symbol: 'mm' },
  in: { category: 'length', unitId: 'in', name: 'Inch', symbol: 'in' },
  inch: { category: 'length', unitId: 'in', name: 'Inch', symbol: 'in' },
  inches: { category: 'length', unitId: 'in', name: 'Inch', symbol: 'in' },
  ft: { category: 'length', unitId: 'ft', name: 'Foot', symbol: 'ft' },
  foot: { category: 'length', unitId: 'ft', name: 'Foot', symbol: 'ft' },
  feet: { category: 'length', unitId: 'ft', name: 'Foot', symbol: 'ft' },
  yd: { category: 'length', unitId: 'yd', name: 'Yard', symbol: 'yd' },
  yard: { category: 'length', unitId: 'yd', name: 'Yard', symbol: 'yd' },
  yards: { category: 'length', unitId: 'yd', name: 'Yard', symbol: 'yd' },
  mi: { category: 'length', unitId: 'mi', name: 'Mile', symbol: 'mi' },
  mile: { category: 'length', unitId: 'mi', name: 'Mile', symbol: 'mi' },
  miles: { category: 'length', unitId: 'mi', name: 'Mile', symbol: 'mi' },

  // Mass
  kg: { category: 'mass', unitId: 'kg', name: 'Kilogram', symbol: 'kg' },
  kilo: { category: 'mass', unitId: 'kg', name: 'Kilogram', symbol: 'kg' },
  kilos: { category: 'mass', unitId: 'kg', name: 'Kilogram', symbol: 'kg' },
  kilogram: { category: 'mass', unitId: 'kg', name: 'Kilogram', symbol: 'kg' },
  kilograms: { category: 'mass', unitId: 'kg', name: 'Kilogram', symbol: 'kg' },
  g: { category: 'mass', unitId: 'g', name: 'Gram', symbol: 'g' },
  gram: { category: 'mass', unitId: 'g', name: 'Gram', symbol: 'g' },
  grams: { category: 'mass', unitId: 'g', name: 'Gram', symbol: 'g' },
  mg: { category: 'mass', unitId: 'mg', name: 'Milligram', symbol: 'mg' },
  lb: { category: 'mass', unitId: 'lb', name: 'Pound', symbol: 'lb' },
  lbs: { category: 'mass', unitId: 'lb', name: 'Pound', symbol: 'lbs' },
  pound: { category: 'mass', unitId: 'lb', name: 'Pound', symbol: 'lb' },
  pounds: { category: 'mass', unitId: 'lb', name: 'Pound', symbol: 'lbs' },
  oz: { category: 'mass', unitId: 'oz', name: 'Ounce', symbol: 'oz' },
  ounce: { category: 'mass', unitId: 'oz', name: 'Ounce', symbol: 'oz' },
  ounces: { category: 'mass', unitId: 'oz', name: 'Ounce', symbol: 'oz' },
  stone: { category: 'mass', unitId: 'st', name: 'Stone', symbol: 'st' },
  stones: { category: 'mass', unitId: 'st', name: 'Stone', symbol: 'st' },

  // Temperature
  c: { category: 'temperature', unitId: 'c', name: 'Celsius', symbol: '°C' },
  celsius: { category: 'temperature', unitId: 'c', name: 'Celsius', symbol: '°C' },
  f: { category: 'temperature', unitId: 'f', name: 'Fahrenheit', symbol: '°F' },
  fahrenheit: { category: 'temperature', unitId: 'f', name: 'Fahrenheit', symbol: '°F' },
  k: { category: 'temperature', unitId: 'k', name: 'Kelvin', symbol: 'K' },
  kelvin: { category: 'temperature', unitId: 'k', name: 'Kelvin', symbol: 'K' },

  // Speed
  kmh: { category: 'speed', unitId: 'kmh', name: 'Kilometer per hour', symbol: 'km/h' },
  'km/h': { category: 'speed', unitId: 'kmh', name: 'Kilometer per hour', symbol: 'km/h' },
  kph: { category: 'speed', unitId: 'kmh', name: 'Kilometer per hour', symbol: 'km/h' },
  mph: { category: 'speed', unitId: 'mph', name: 'Miles per hour', symbol: 'mph' },
  knot: { category: 'speed', unitId: 'kn', name: 'Knot', symbol: 'kn' },
  knots: { category: 'speed', unitId: 'kn', name: 'Knot', symbol: 'kn' },
  mach: { category: 'speed', unitId: 'mach', name: 'Mach', symbol: 'Ma' },

  // Volume
  l: { category: 'volume', unitId: 'l', name: 'Liter', symbol: 'L' },
  liter: { category: 'volume', unitId: 'l', name: 'Liter', symbol: 'L' },
  liters: { category: 'volume', unitId: 'l', name: 'Liter', symbol: 'L' },
  ml: { category: 'volume', unitId: 'ml', name: 'Milliliter', symbol: 'mL' },
  gal: { category: 'volume', unitId: 'gal_us', name: 'Gallon', symbol: 'gal' },
  gallon: { category: 'volume', unitId: 'gal_us', name: 'Gallon', symbol: 'gal' },
  gallons: { category: 'volume', unitId: 'gal_us', name: 'Gallon', symbol: 'gal' },
  cup: { category: 'volume', unitId: 'cup_us', name: 'Cup', symbol: 'cup' },
  cups: { category: 'volume', unitId: 'cup_us', name: 'Cup', symbol: 'cup' },
};

/**
 * Parses natural language conversion shorthand such as:
 * - "250 usd to php"
 * - "180 cm in ft"
 * - "70 kg to lbs"
 * - "32 c to f"
 * - "16 px to rem"
 * - "100 mb to gb"
 * - "hex to rgb"
 * - "png to webp"
 */
export function parseNaturalLanguageConversion(input: string): NaturalConversionResult | null {
  const clean = input.trim().toLowerCase();
  if (!clean || clean.length < 3) return null;

  // 1. Shorthand Pattern: [number] [fromUnit] (to|in|=) [toUnit]
  // e.g., "250 usd to php", "180 cm in ft", "5.9 ft to cm", "70kg to lbs"
  const unitMatch = clean.match(/^([\d.,]+)\s*([a-zA-Z/°]+)\s+(?:to|in|=)\s+([a-zA-Z/°]+)$/);
  if (unitMatch) {
    const rawVal = unitMatch[1].replace(/,/g, '');
    const num = parseFloat(rawVal);
    const fromStr = unitMatch[2].replace('°', '');
    const toStr = unitMatch[3].replace('°', '');

    if (!isNaN(num)) {
      // 1A. Currency check (e.g. "250 usd to php")
      if (CURRENCY_RATES_TO_PHP[fromStr] !== undefined && CURRENCY_RATES_TO_PHP[toStr] !== undefined) {
        const inPhp = num * CURRENCY_RATES_TO_PHP[fromStr];
        const result = inPhp / CURRENCY_RATES_TO_PHP[toStr];
        const formatted = result.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return {
          query: input,
          categoryName: 'Currency & Rates',
          toolId: 'income-tax-ph',
          inputValue: num,
          inputUnitName: fromStr.toUpperCase(),
          outputUnitName: toStr.toUpperCase(),
          outputValue: formatted,
          formattedOutput: `${num} ${fromStr.toUpperCase()} = ${formatted} ${toStr.toUpperCase()}`,
          summary: `Calculated at benchmark Philippine forex rates.`,
          confidence: 0.95,
        };
      }

      // 1B. CSS Unit check: px to rem or rem to px
      if ((fromStr === 'px' && toStr === 'rem') || (fromStr === 'rem' && toStr === 'px')) {
        const result = fromStr === 'px' ? num / 16 : num * 16;
        const formatted = result % 1 === 0 ? result.toString() : result.toFixed(3).replace(/\.?0+$/, '');
        return {
          query: input,
          categoryName: 'CSS Units',
          toolId: 'unit-convert',
          inputValue: num,
          inputUnitName: fromStr,
          outputUnitName: toStr,
          outputValue: formatted,
          formattedOutput: `${num} ${fromStr} = ${formatted} ${toStr} (base 16px)`,
          summary: `CSS typography conversion calculated with standard 16px root font size.`,
          confidence: 0.95,
        };
      }

      // 1C. Data storage units: mb to gb, gb to tb, etc.
      const dataRanks: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 };
      if (dataRanks[fromStr] && dataRanks[toStr]) {
        const bytes = num * dataRanks[fromStr];
        const result = bytes / dataRanks[toStr];
        const formatted = result % 1 === 0 ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
        return {
          query: input,
          categoryName: 'Data Storage',
          toolId: 'unit-convert',
          inputValue: num,
          inputUnitName: fromStr.toUpperCase(),
          outputUnitName: toStr.toUpperCase(),
          outputValue: formatted,
          formattedOutput: `${num} ${fromStr.toUpperCase()} = ${formatted} ${toStr.toUpperCase()}`,
          summary: `Binary IEC data scale conversion.`,
          confidence: 0.95,
        };
      }

      // 1D. Physical Measurements (Length, Mass, Temperature, Speed, Volume)
      const fromDef = UNIT_ALIASES[fromStr];
      const toDef = UNIT_ALIASES[toStr];
      if (fromDef && toDef && fromDef.category === toDef.category) {
        const cat = fromDef.category;
        const unitList = CATEGORY_UNIT_MAP[cat];
        const fullFrom = unitList.find((u) => u.id === fromDef.unitId);
        const fullTo = unitList.find((u) => u.id === toDef.unitId);

        if (fullFrom && fullTo) {
          const inBase = fullFrom.toBase(num);
          const converted = fullTo.fromBase(inBase);
          const formatted = converted % 1 === 0 ? converted.toString() : converted.toFixed(4).replace(/\.?0+$/, '');

          const toolMap: Record<UnitCategory, ToolType> = {
            length: 'length-convert',
            mass: 'mass-convert',
            area: 'area-convert',
            volume: 'volume-convert',
            temperature: 'temperature-convert',
            speed: 'speed-convert',
            time: 'time-convert',
          };

          return {
            query: input,
            categoryName: cat.charAt(0).toUpperCase() + cat.slice(1),
            toolId: toolMap[cat] || 'unit-convert',
            inputValue: num,
            inputUnitName: fullFrom.symbol,
            outputUnitName: fullTo.symbol,
            outputValue: formatted,
            formattedOutput: `${num} ${fullFrom.symbol} = ${formatted} ${fullTo.symbol}`,
            summary: `Direct ${fromDef.name} to ${toDef.name} conversion computed via browser engine.`,
            confidence: 0.98,
          };
        }
      }
    }
  }

  // 2. Format & Encoding Conversions (e.g., "hex to rgb", "png to webp", "json to yaml")
  if (clean.includes('hex to rgb') || clean.includes('# to rgb')) {
    return {
      query: input,
      categoryName: 'Color Palette',
      toolId: 'color-convert',
      inputValue: '#6366F1',
      inputUnitName: 'HEX',
      outputUnitName: 'RGB',
      outputValue: 'rgb(99, 102, 241)',
      formattedOutput: '#6366F1 → rgb(99, 102, 241)',
      summary: 'Hexadecimal to RGB color space translation.',
      confidence: 0.9,
    };
  }

  if (clean.includes('png to webp') || clean.includes('jpg to webp') || clean.includes('image to webp')) {
    return {
      query: input,
      categoryName: 'Image Converter',
      toolId: 'image-convert',
      inputValue: 'Selected Images',
      inputUnitName: 'PNG/JPG',
      outputUnitName: 'WebP',
      outputValue: 'Compressed WebP',
      formattedOutput: 'Convert images to modern WebP (reduces size up to 80%)',
      summary: 'Lossy/lossless WebP compression sandbox with privacy protection.',
      confidence: 0.92,
    };
  }

  if (clean.includes('images to pdf') || clean.includes('jpg to pdf') || clean.includes('photos to pdf')) {
    return {
      query: input,
      categoryName: 'PDF Document',
      toolId: 'images-to-pdf',
      inputValue: 'Image Photos',
      inputUnitName: 'Images',
      outputUnitName: 'PDF',
      outputValue: 'Compiled PDF',
      formattedOutput: 'Compile multiple photos into a clean PDF document',
      summary: 'Client-side PDF compiler with page orientation and quality settings.',
      confidence: 0.92,
    };
  }

  if (clean.includes('json to yaml') || clean.includes('yaml to json')) {
    return {
      query: input,
      categoryName: 'Data Serialization',
      toolId: 'json-yaml',
      inputValue: clean.includes('json to yaml') ? 'JSON' : 'YAML',
      inputUnitName: clean.includes('json to yaml') ? 'JSON' : 'YAML',
      outputUnitName: clean.includes('json to yaml') ? 'YAML' : 'JSON',
      outputValue: 'Formatted Data',
      formattedOutput: clean.includes('json to yaml') ? 'JSON ⇄ YAML Serialization' : 'YAML ⇄ JSON Serialization',
      summary: 'Bi-directional serialization with syntax validation and beautification.',
      confidence: 0.9,
    };
  }

  if (clean.includes('csv to json') || clean.includes('json to csv') || clean.includes('excel to json')) {
    return {
      query: input,
      categoryName: 'Tabular Data',
      toolId: 'csv-json',
      inputValue: 'Spreadsheet',
      inputUnitName: 'CSV/TSV',
      outputUnitName: 'JSON',
      outputValue: 'JSON Array',
      formattedOutput: 'Spreadsheet Table ⇄ JSON Array Objects',
      summary: 'Client-side delimiter parser with live grid preview.',
      confidence: 0.9,
    };
  }

  if (clean.includes('base64 encode') || clean.includes('base64 decode')) {
    return {
      query: input,
      categoryName: 'Security & Encodings',
      toolId: 'base64',
      inputValue: 'Payload',
      inputUnitName: 'Raw Text',
      outputUnitName: 'Base64',
      outputValue: 'Encoded String',
      formattedOutput: 'Base64 RFC 4648 Encoding & Decoding',
      summary: 'Encode or decode strings and binary payloads directly in browser.',
      confidence: 0.9,
    };
  }

  return null;
}
