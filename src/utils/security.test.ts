import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from './security';

describe('sanitizeFilename', () => {
  it('preserves clean filenames', () => {
    expect(sanitizeFilename('photo.webp')).toBe('photo.webp');
    expect(sanitizeFilename('my-document_2026.pdf')).toBe('my-document_2026.pdf');
  });

  it('neutralizes directory traversal patterns by stripping paths', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('system32');
  });

  it('replaces reserved special characters with underscores', () => {
    expect(sanitizeFilename('file*name:with?illegal<chars>.png')).toBe('file_name_with_illegal_chars_.png');
  });

  it('provides safe fallback for empty or malformed strings', () => {
    expect(sanitizeFilename('')).toBe('converted-file');
    expect(sanitizeFilename('   ')).toBe('converted-file');
    expect(sanitizeFilename('....')).toBe('converted-file');
  });
});
