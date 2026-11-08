# Engineering Skill: Privacy Engineering & Data Protection

## Purpose
Guarantees 100% client-side data sovereignty, zero server uploads, clean browser storage hygiene, and strict telemetry boundaries.

## When to Activate
Activate during audits of file processing routines, telemetry events, local storage persistence, or third-party script integrations.

## Required Context
- Isalin's core promise: "100% private in-browser conversions with zero server uploads".
- Republic Act No. 10173 (Philippine Data Privacy Act of 2012), GDPR, CCPA.
- Browser sandbox execution models.

## Methodology & Engineering Standards
1. **Zero-Upload Execution**:
   - All conversions must use in-memory buffers (`ArrayBuffer`, `Uint8Array`, `Blob`, `ImageData`).
   - Never dispatch `fetch()` or `XMLHttpRequest()` containing user input payload, file names, or conversion results.
   - Any third-party dependency must be vetted to confirm it contains zero telemetry or remote phone-home calls.

2. **Memory & Object URL Lifecycle**:
   - Every `URL.createObjectURL(blob)` must have a deterministic cleanup path.
   - In React components, revoke object URLs in `useEffect` cleanup functions or immediately after triggering client download.
   - Nullify file references in state when files are cleared to allow garbage collection.

3. **Storage Hygiene**:
   - User files must never be persisted in unencrypted `localStorage` without explicit user intent.
   - Conversion history (`mc_history`) should only store metadata (file type, timestamp, format target) unless text snippets are explicitly saved with clear "Clear History" controls.
   - Sensitive calculations (salary, tax, mortgage) must remain in memory and vanish upon page reload.

4. **Telemetry & Advertising Boundaries**:
   - Vercel Analytics must track only route changes and page performance. No custom events containing file names or user queries.
   - Google AdSense must never receive conversion payload or file characteristics.

## Verification Checklist
- [ ] Network tab audit: zero outbound POST/PUT requests carrying user data during conversion.
- [ ] Heap snapshot: object URLs properly released without memory accumulation.
- [ ] Privacy policy accurately matches actual data practices.
