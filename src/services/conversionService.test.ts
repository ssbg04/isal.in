import { describe, it, expect } from 'vitest';
import {
  processBase64,
  processUrlEncode,
  generateUUIDs,
  parseColor,
  parseCsv,
  jsonToCsv,
  convertCssUnits,
  convertDataStorage,
  md5,
} from './conversionService';

describe('conversionService', () => {
  describe('processBase64', () => {
    it('encodes ASCII text to Base64', () => {
      expect(processBase64('Hello, World!', 'encode')).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('decodes valid Base64 string to original text', () => {
      expect(processBase64('SGVsbG8sIFdvcmxkIQ==', 'decode')).toBe('Hello, World!');
    });

    it('handles unicode and emojis safely in Base64 encoding', () => {
      const emojiText = 'Kumusta Mundo! 🇵🇭';
      const encoded = processBase64(emojiText, 'encode');
      expect(processBase64(encoded, 'decode')).toBe(emojiText);
    });

    it('throws or handles invalid Base64 input gracefully', () => {
      expect(() => processBase64('!!!not-valid-base64', 'decode')).toThrow();
    });
  });

  describe('processUrlEncode', () => {
    it('encodes special URL characters', () => {
      expect(processUrlEncode('https://isal.in/test?query=hello world&tag=#1', 'encode')).toBe(
        'https%3A%2F%2Fisal.in%2Ftest%3Fquery%3Dhello%20world%26tag%3D%231'
      );
    });

    it('decodes percent-encoded URLs', () => {
      expect(processUrlEncode('hello%20world%21', 'decode')).toBe('hello world!');
    });
  });

  describe('generateUUIDs', () => {
    it('generates the specified count of valid UUID v4 strings', () => {
      const uuids = generateUUIDs(5);
      expect(uuids).toHaveLength(5);
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      uuids.forEach((id) => {
        expect(id).toMatch(uuidV4Regex);
      });
    });
  });

  describe('parseColor', () => {
    it('parses 6-character hex colors', () => {
      const result = parseColor('#f59e0b');
      expect(result).not.toBeNull();
      expect(result?.hex.toLowerCase()).toBe('#f59e0b');
      expect(result?.rgb).toContain('245, 158, 11');
    });

    it('parses 3-character shorthand hex colors', () => {
      const result = parseColor('#fff');
      expect(result).not.toBeNull();
      expect(result?.hex.toLowerCase()).toBe('#ffffff');
    });

    it('parses rgb() notation', () => {
      const result = parseColor('rgb(255, 0, 0)');
      expect(result).not.toBeNull();
      expect(result?.hex.toLowerCase()).toBe('#ff0000');
    });

    it('returns null for invalid color strings', () => {
      expect(parseColor('not-a-color-123')).toBeNull();
      expect(parseColor('')).toBeNull();
    });
  });

  describe('parseCsv and jsonToCsv', () => {
    it('parses comma-separated values into JSON rows and headers', () => {
      const csv = 'name,age,city\nAlice,30,Manila\nBob,25,Cebu';
      const result = parseCsv(csv, ',', true);
      expect(result.error).toBeUndefined();
      expect(result.headers).toEqual(['name', 'age', 'city']);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0]).toEqual({ name: 'Alice', age: 30, city: 'Manila' });
    });

    it('parses TSV (tab-separated values) correctly', () => {
      const tsv = 'id\tscore\n1\t99\n2\t85';
      const result = parseCsv(tsv, '\t', true);
      expect(result.headers).toEqual(['id', 'score']);
      expect(result.rows).toHaveLength(2);
    });

    it('converts JSON array of objects back to CSV format', () => {
      const jsonStr = JSON.stringify([
        { item: 'Coffee', price: 120 },
        { item: 'Tea', price: 90 },
      ]);
      const result = jsonToCsv(jsonStr, ',');
      expect(result.error).toBeUndefined();
      expect(result.csv).toContain('item,price');
      expect(result.csv).toContain('Coffee,120');
      expect(result.csv).toContain('Tea,90');
    });

    it('handles invalid JSON gracefully when converting to CSV', () => {
      const result = jsonToCsv('{ invalid json }', ',');
      expect(result.error).toBeDefined();
    });
  });

  describe('convertCssUnits', () => {
    it('converts 16px to 1rem with standard 16px base', () => {
      const result = convertCssUnits(16, 'px', 16);
      expect(result.rem).toBe(1);
      expect(result.px).toBe(16);
      expect(result.pt).toBe(12);
    });

    it('converts 2rem to 32px with standard 16px base', () => {
      const result = convertCssUnits(2, 'rem', 16);
      expect(result.px).toBe(32);
      expect(result.rem).toBe(2);
    });

    it('respects custom root font size (e.g. 10px base)', () => {
      const result = convertCssUnits(20, 'px', 10);
      expect(result.rem).toBe(2);
    });
  });

  describe('convertDataStorage', () => {
    it('calculates decimal and binary byte equivalents for 1 GB', () => {
      const result = convertDataStorage(1, 'GB');
      expect(result.bytes).toBe(1_000_000_000);
      expect(result.mb).toBe(1000);
      expect(result.kb).toBe(1_000_000);
      expect(result.gib).toBeCloseTo(0.9313, 3);
    });

    it('calculates binary units correctly for 1 GiB', () => {
      const result = convertDataStorage(1, 'GiB');
      expect(result.bytes).toBe(1024 * 1024 * 1024);
      expect(result.mib).toBe(1024);
    });
  });

  describe('md5 checksum', () => {
    it('computes standard MD5 test vector for empty string', () => {
      expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('computes standard MD5 test vector for "The quick brown fox jumps over the lazy dog"', () => {
      expect(md5('The quick brown fox jumps over the lazy dog')).toBe('9e107d9d372bb6826bd81d3542a419d6');
    });
  });
});
