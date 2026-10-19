// Unit Conversion Services: Length, Mass, Area, Volume, Temperature, Speed, Time, Number System

export type UnitCategory = 'length' | 'mass' | 'area' | 'volume' | 'temperature' | 'speed' | 'time';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
  description?: string;
}

// 1. LENGTH (Base: Meter)
export const LENGTH_UNITS: UnitDefinition[] = [
  { id: 'm', name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
  { id: 'km', name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'um', name: 'Micrometer', symbol: 'µm', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
  { id: 'nm', name: 'Nanometer', symbol: 'nm', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
  { id: 'in', name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
  { id: 'ft', name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { id: 'yd', name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
  { id: 'mi', name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  { id: 'nmi', name: 'Nautical Mile', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
];

// 2. MASS / WEIGHT (Base: Kilogram)
export const MASS_UNITS: UnitDefinition[] = [
  { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
  { id: 'g', name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
  { id: 't', name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { id: 'lb', name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
  { id: 'st', name: 'Stone', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
  { id: 'ct', name: 'Carat', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (v) => v / 0.0002 },
  { id: 'gr', name: 'Grain', symbol: 'gr', toBase: (v) => v * 0.00006479891, fromBase: (v) => v / 0.00006479891 },
];

// 3. AREA (Base: Square Meter)
export const AREA_UNITS: UnitDefinition[] = [
  { id: 'sqm', name: 'Square Meter', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
  { id: 'sqkm', name: 'Square Kilometer', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
  { id: 'sqcm', name: 'Square Centimeter', symbol: 'cm²', toBase: (v) => v / 1e4, fromBase: (v) => v * 1e4 },
  { id: 'sqmm', name: 'Square Millimeter', symbol: 'mm²', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
  { id: 'ha', name: 'Hectare', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  { id: 'ac', name: 'Acre', symbol: 'ac', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
  { id: 'sqft', name: 'Square Foot', symbol: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
  { id: 'sqyd', name: 'Square Yard', symbol: 'yd²', toBase: (v) => v * 0.83612736, fromBase: (v) => v / 0.83612736 },
  { id: 'sqmi', name: 'Square Mile', symbol: 'mi²', toBase: (v) => v * 2589988.110336, fromBase: (v) => v / 2589988.110336 },
];

// 4. VOLUME (Base: Liter)
export const VOLUME_UNITS: UnitDefinition[] = [
  { id: 'l', name: 'Liter', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
  { id: 'ml', name: 'Milliliter', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'cum', name: 'Cubic Meter', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { id: 'cucm', name: 'Cubic Centimeter (cc)', symbol: 'cm³', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'gal_us', name: 'US Gallon', symbol: 'gal (US)', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
  { id: 'qt_us', name: 'US Quart', symbol: 'qt (US)', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
  { id: 'pt_us', name: 'US Pint', symbol: 'pt (US)', toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
  { id: 'cup_us', name: 'US Cup', symbol: 'cup', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
  { id: 'floz_us', name: 'US Fluid Ounce', symbol: 'fl oz (US)', toBase: (v) => v * 0.0295735295625, fromBase: (v) => v / 0.0295735295625 },
  { id: 'tbsp', name: 'Tablespoon (Metric)', symbol: 'tbsp', toBase: (v) => v * 0.015, fromBase: (v) => v / 0.015 },
  { id: 'tsp', name: 'Teaspoon (Metric)', symbol: 'tsp', toBase: (v) => v * 0.005, fromBase: (v) => v / 0.005 },
  { id: 'gal_uk', name: 'Imperial Gallon', symbol: 'gal (UK)', toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
  { id: 'cuft', name: 'Cubic Foot', symbol: 'ft³', toBase: (v) => v * 28.316846592, fromBase: (v) => v / 28.316846592 },
];

// 5. TEMPERATURE (Special formulas, base: Celsius)
export const TEMPERATURE_UNITS: UnitDefinition[] = [
  { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
  { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
  { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  { id: 'r', name: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => ((v + 273.15) * 9) / 5 },
];

// 6. SPEED (Base: Meter per second)
export const SPEED_UNITS: UnitDefinition[] = [
  { id: 'kmh', name: 'Kilometer per hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  { id: 'ms', name: 'Meter per second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
  { id: 'kn', name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444444, fromBase: (v) => v / 0.514444444 },
  { id: 'fts', name: 'Foot per second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { id: 'mach', name: 'Mach (Standard Sea Level)', symbol: 'Ma', toBase: (v) => v * 340.29, fromBase: (v) => v / 340.29 },
];

// 7. TIME (Base: Second)
export const TIME_UNITS: UnitDefinition[] = [
  { id: 's', name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
  { id: 'min', name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  { id: 'h', name: 'Hour', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  { id: 'd', name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
  { id: 'wk', name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
  { id: 'mo', name: 'Month (Average 30.44d)', symbol: 'mo', toBase: (v) => v * 2629746, fromBase: (v) => v / 2629746 },
  { id: 'yr', name: 'Year (365.25d)', symbol: 'yr', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
  { id: 'ms', name: 'Millisecond', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'us', name: 'Microsecond', symbol: 'µs', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
  { id: 'ns', name: 'Nanosecond', symbol: 'ns', toBase: (v) => v / 1e9, fromBase: (v) => v * 1e9 },
];

export const CATEGORY_UNIT_MAP: Record<UnitCategory, UnitDefinition[]> = {
  length: LENGTH_UNITS,
  mass: MASS_UNITS,
  area: AREA_UNITS,
  volume: VOLUME_UNITS,
  temperature: TEMPERATURE_UNITS,
  speed: SPEED_UNITS,
  time: TIME_UNITS,
};

export interface ConvertedUnitItem {
  id: string;
  name: string;
  symbol: string;
  value: number;
  formatted: string;
}

/** Convert a value from one unit to all units in the same category */
export function convertUnitToAll(
  category: UnitCategory,
  inputValue: number,
  fromUnitId: string,
  precision: number = 4
): ConvertedUnitItem[] {
  const units = CATEGORY_UNIT_MAP[category];
  const fromDef = units.find((u) => u.id === fromUnitId) || units[0];
  
  if (isNaN(inputValue)) {
    return units.map((u) => ({
      id: u.id,
      name: u.name,
      symbol: u.symbol,
      value: 0,
      formatted: '0',
    }));
  }

  const baseValue = fromDef.toBase(inputValue);

  return units.map((u) => {
    const val = u.fromBase(baseValue);
    let formatted = '';
    if (Math.abs(val) >= 1e9 || (Math.abs(val) < 1e-4 && val !== 0)) {
      formatted = val.toExponential(Math.min(precision, 6));
    } else {
      formatted = Number(val.toFixed(precision)).toString();
    }
    return {
      id: u.id,
      name: u.name,
      symbol: u.symbol,
      value: val,
      formatted,
    };
  });
}

// 8. NUMBER SYSTEM / RADIX CONVERSIONS
export interface NumberSystemResult {
  decimal: string;
  binary: string;
  hexadecimal: string;
  octal: string;
  ascii: string;
  roman: string;
  bitLength: number;
  isValid: boolean;
  error?: string;
}

export function toRomanNumeral(num: number): string {
  if (num <= 0 || num > 3999 || !Number.isInteger(num)) return 'N/A (Range 1-3999)';
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  let n = num;
  for (const i of Object.keys(lookup)) {
    const q = Math.floor(n / lookup[i]);
    n -= q * lookup[i];
    roman += i.repeat(q);
  }
  return roman;
}

export function parseNumberSystem(input: string, base: '10' | '2' | '16' | '8'): NumberSystemResult {
  const clean = input.trim();
  if (!clean) {
    return {
      decimal: '',
      binary: '',
      hexadecimal: '',
      octal: '',
      ascii: '',
      roman: '',
      bitLength: 0,
      isValid: true,
    };
  }

  try {
    let bigNum: bigint;
    const radix = parseInt(base, 10);
    if (radix === 10) {
      if (!/^-?\d+$/.test(clean)) throw new Error('Invalid decimal integer');
      bigNum = BigInt(clean);
    } else if (radix === 2) {
      if (!/^[01]+$/.test(clean)) throw new Error('Invalid binary digit (must be 0 or 1)');
      bigNum = BigInt('0b' + clean);
    } else if (radix === 16) {
      if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error('Invalid hexadecimal string');
      bigNum = BigInt('0x' + clean);
    } else if (radix === 8) {
      if (!/^[0-7]+$/.test(clean)) throw new Error('Invalid octal digit (must be 0-7)');
      bigNum = BigInt('0o' + clean);
    } else {
      throw new Error('Unsupported radix');
    }

    const decStr = bigNum.toString(10);
    const binStr = bigNum >= 0n ? bigNum.toString(2) : '-' + (-bigNum).toString(2);
    const hexStr = (bigNum >= 0n ? bigNum.toString(16) : '-' + (-bigNum).toString(16)).toUpperCase();
    const octStr = bigNum >= 0n ? bigNum.toString(8) : '-' + (-bigNum).toString(8);

    // ASCII attempt if small positive number
    let ascii = '';
    if (bigNum >= 32n && bigNum <= 126n) {
      ascii = String.fromCharCode(Number(bigNum));
    } else if (bigNum === 10n) {
      ascii = '\\n (Newline)';
    } else if (bigNum === 9n) {
      ascii = '\\t (Tab)';
    } else {
      ascii = 'Non-printable / out of ASCII range';
    }

    let roman = '';
    if (bigNum > 0n && bigNum <= 3999n) {
      roman = toRomanNumeral(Number(bigNum));
    } else {
      roman = 'N/A';
    }

    return {
      decimal: decStr,
      binary: binStr,
      hexadecimal: hexStr,
      octal: octStr,
      ascii,
      roman,
      bitLength: bigNum >= 0n ? bigNum.toString(2).length : (-bigNum).toString(2).length,
      isValid: true,
    };
  } catch (err: unknown) {
    return {
      decimal: '',
      binary: '',
      hexadecimal: '',
      octal: '',
      ascii: '',
      roman: '',
      bitLength: 0,
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid numeric input',
    };
  }
}
