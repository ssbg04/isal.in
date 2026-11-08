# Engineering Skill: Security Hardening

## Purpose
Establishes defensive coding practices against client-side attacks, malicious file payloads, Cross-Site Scripting (XSS), path traversal, and ZIP memory exhaustion.

## When to Activate
Activate when reviewing file input handlers, archive extraction/compression logic, Content Security Policy (CSP), HTML/SVG rendering, or third-party dependencies.

## Required Context
- OWASP Client-Side Security Best Practices.
- Content Security Policy Level 3 specifications.
- `vercel.json` HTTP headers and CSP directives.

## Methodology & Engineering Standards
1. **Filename Sanitization**:
   - Filenames from user uploads or archive entries must be strictly sanitized before writing or downloading:
     ```ts
     export function sanitizeFilename(name: string): string {
       return name
         .replace(/[/\\?%*:|"<>]/g, '_')
         .replace(/\.\.+/g, '.')
         .trim() || 'converted-file';
     }
     ```
   - Strip directory traversal sequences (`../`, `..\`) when unzipping user archives.

2. **Cross-Site Scripting (XSS) Prevention**:
   - Never use `dangerouslySetInnerHTML` with unsanitized user content.
   - For Markdown previews, escape HTML entities or sanitize elements before rendering.
   - User-supplied SVG files must be parsed via `DOMParser` with `<script>` tags, inline event attributes (`onload`, `onerror`), and external resource references stripped, or displayed via `<img>` tags which disable script execution.

3. **Archive & Memory Bounds**:
   - Enforce file size caps before reading files into memory (e.g. 25MB single file, 50MB batch total).
   - Defend against ZIP bombs: verify total uncompressed byte size before expanding archives.

4. **Content Security Policy (CSP)**:
   - Eliminate `'unsafe-eval'` whenever possible.
   - Restrict `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`.
   - Maintain strict `script-src` and `connect-src` limited to verified domains (Vercel, Google AdSense).

## Verification Checklist
- [ ] Filenames tested against path traversal attacks (`../../etc/passwd`).
- [ ] SVG files with `<script>alert(1)</script>` tested and neutralized.
- [ ] Security headers verified via security audit inspection.
