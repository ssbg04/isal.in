/**
 * Security utilities for in-browser file sanitization and object URL lifecycle management.
 */

/**
 * Strips path traversal sequences (../, ..\), control characters, and reserved system characters from filenames.
 */
export function sanitizeFilename(name: string, fallback = 'converted-file'): string {
  if (!name || typeof name !== 'string') return fallback;

  // Extract base filename if path separators are present
  const base = name.split(/[/\\]/).filter(Boolean).pop() || '';

  const cleaned = base
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/^\.+/, '') // remove leading dots
    .replace(/\.\.+/g, '.') // collapse multiple dots
    .replace(/^_+|_+$/g, '')
    .trim();

  return cleaned || fallback;
}

/**
 * Safely creates an Object URL.
 */
export function createSafeObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Safely revokes an Object URL to prevent browser memory leaks.
 */
export function revokeSafeObjectUrl(url: string | null | undefined): void {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore errors if already revoked
    }
  }
}
