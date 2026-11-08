import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageConversion } from './naturalLanguageService';

describe('parseNaturalLanguageConversion', () => {
  it('parses natural length queries like "100 km to miles"', () => {
    const result = parseNaturalLanguageConversion('100 km to miles');
    expect(result).not.toBeNull();
    expect(result?.toolId).toBe('length-convert');
    expect(result?.categoryName).toBe('Length');
    expect(result?.inputValue).toBe(100);
    expect(parseFloat(result?.outputValue || '0')).toBeCloseTo(62.137, 2);
  });

  it('parses CSS unit queries like "24px to rem"', () => {
    const result = parseNaturalLanguageConversion('24px to rem');
    expect(result).not.toBeNull();
    expect(result?.toolId).toBe('unit-convert');
    expect(result?.inputValue).toBe(24);
    expect(parseFloat(result?.outputValue || '0')).toBe(1.5);
  });

  it('parses digital storage queries like "500 MB to GB"', () => {
    const result = parseNaturalLanguageConversion('500 MB to GB');
    expect(result).not.toBeNull();
    expect(result?.toolId).toBe('unit-convert');
    expect(result?.inputValue).toBe(500);
    expect(parseFloat(result?.outputValue || '0')).toBeCloseTo(0.4883, 3);
  });

  it('parses mass queries like "70 kg to lbs"', () => {
    const result = parseNaturalLanguageConversion('70 kg to lbs');
    expect(result).not.toBeNull();
    expect(result?.toolId).toBe('mass-convert');
    expect(result?.categoryName).toBe('Mass');
    expect(result?.inputValue).toBe(70);
    expect(parseFloat(result?.outputValue || '0')).toBeCloseTo(154.32, 1);
  });

  it('returns null for regular text or non-conversion queries', () => {
    expect(parseNaturalLanguageConversion('hello world')).toBeNull();
    expect(parseNaturalLanguageConversion('convert something')).toBeNull();
    expect(parseNaturalLanguageConversion('')).toBeNull();
    expect(parseNaturalLanguageConversion('   ')).toBeNull();
  });
});
