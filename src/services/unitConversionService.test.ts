import { describe, it, expect } from 'vitest';
import {
  convertUnitToAll,
  toRomanNumeral,
  parseNumberSystem,
} from './unitConversionService';

describe('unitConversionService', () => {
  describe('convertUnitToAll', () => {
    it('converts 1 kilometer to meters, miles, and feet', () => {
      const results = convertUnitToAll('length', 1, 'km');
      const meterItem = results.find((r) => r.id === 'm');
      const mileItem = results.find((r) => r.id === 'mi');
      const ftItem = results.find((r) => r.id === 'ft');

      expect(meterItem?.value).toBe(1000);
      expect(mileItem?.value).toBeCloseTo(0.621371, 4);
      expect(ftItem?.value).toBeCloseTo(3280.84, 1);
    });

    it('converts 100 Celsius to Fahrenheit and Kelvin', () => {
      const results = convertUnitToAll('temperature', 100, 'c');
      const fItem = results.find((r) => r.id === 'f');
      const kItem = results.find((r) => r.id === 'k');

      expect(fItem?.value).toBe(212);
      expect(kItem?.value).toBe(373.15);
    });

    it('converts 0 Celsius to Fahrenheit and Kelvin', () => {
      const results = convertUnitToAll('temperature', 0, 'c');
      const fItem = results.find((r) => r.id === 'f');
      const kItem = results.find((r) => r.id === 'k');

      expect(fItem?.value).toBe(32);
      expect(kItem?.value).toBe(273.15);
    });

    it('converts 1 kilogram to grams and pounds', () => {
      const results = convertUnitToAll('mass', 1, 'kg');
      const gItem = results.find((r) => r.id === 'g');
      const lbItem = results.find((r) => r.id === 'lb');

      expect(gItem?.value).toBe(1000);
      expect(lbItem?.value).toBeCloseTo(2.20462, 4);
    });

    it('converts 60 miles per hour to km/h', () => {
      const results = convertUnitToAll('speed', 60, 'mph');
      const kmhItem = results.find((r) => r.id === 'kmh');
      expect(kmhItem?.value).toBeCloseTo(96.56, 1);
    });

    it('converts 1 hour to minutes and seconds', () => {
      const results = convertUnitToAll('time', 1, 'h');
      const minItem = results.find((r) => r.id === 'min');
      const secItem = results.find((r) => r.id === 's');

      expect(minItem?.value).toBe(60);
      expect(secItem?.value).toBe(3600);
    });
  });

  describe('toRomanNumeral', () => {
    it('converts basic numbers to standard Roman numerals', () => {
      expect(toRomanNumeral(1)).toBe('I');
      expect(toRomanNumeral(4)).toBe('IV');
      expect(toRomanNumeral(9)).toBe('IX');
      expect(toRomanNumeral(58)).toBe('LVIII');
      expect(toRomanNumeral(1994)).toBe('MCMXCIV');
      expect(toRomanNumeral(2026)).toBe('MMXXVI');
    });

    it('handles out of range numbers gracefully', () => {
      expect(toRomanNumeral(0)).toBe('N/A (Range 1-3999)');
      expect(toRomanNumeral(4000)).toBe('N/A (Range 1-3999)');
      expect(toRomanNumeral(-5)).toBe('N/A (Range 1-3999)');
    });
  });

  describe('parseNumberSystem', () => {
    it('parses decimal input and converts to binary, hex, and octal', () => {
      const result = parseNumberSystem('255', '10');
      expect(result.isValid).toBe(true);
      expect(result.decimal).toBe('255');
      expect(result.binary).toBe('11111111');
      expect(result.hexadecimal.toUpperCase()).toBe('FF');
      expect(result.octal).toBe('377');
      expect(result.roman).toBe('CCLV');
    });

    it('parses hexadecimal input correctly', () => {
      const result = parseNumberSystem('1A', '16');
      expect(result.isValid).toBe(true);
      expect(result.decimal).toBe('26');
      expect(result.binary).toBe('11010');
    });

    it('flags invalid digits for the chosen radix', () => {
      const invalidBinary = parseNumberSystem('102', '2');
      expect(invalidBinary.isValid).toBe(false);

      const invalidHex = parseNumberSystem('ZZZ', '16');
      expect(invalidHex.isValid).toBe(false);
    });
  });
});
