# Engineering Skill: Performance Optimization & Resource Management

## Purpose
Establishes techniques for reducing initial bundle weight, accelerating conversion throughput, preventing main-thread locks, and optimizing client memory.

## When to Activate
Activate when analyzing bundle size, optimizing image/media transcoding, resolving UI lag, or managing high-volume batch operations.

## Required Context
- Rollup/Vite code chunking mechanisms.
- Web Worker asynchronous processing.
- Browser memory garbage collection lifecycle.

## Methodology & Engineering Standards
1. **Vendor Chunk Splitting**:
   - Split large third-party vendor libraries in `vite.config.ts`:
     - `pdf-lib` and `pdfjs-dist` into dedicated document chunks.
     - `jszip` and `js-yaml` into separate utility chunks.
     - `react` and `react-dom` into the core framework chunk.
   - Ensures users downloading a simple unit converter never download megabytes of PDF rendering code.

2. **Web Workers & Asynchronous Compute**:
   - Long-running calculations or hashing (SHA-256 on a 50MB file) should yield execution periodically via `setTimeout(..., 0)` or Web Workers to keep 60fps frame rate.
   - For animated GIF creation (`gifenc`) and video snapshot extraction, process frames incrementally.

3. **Memory & Buffer Transfers**:
   - Use `ArrayBuffer.transfer()` or transferable objects in worker messages where supported.
   - Avoid duplicating multi-megabyte binary strings in memory. Prefer `Uint8Array` views over copies.

4. **Batch Processing Concurrency**:
   - Do not process 50 files concurrently, which can crash low-RAM mobile browsers.
   - Process batches in a controlled queue with concurrency limit (e.g. 2 concurrent conversions for free MVP).

## Verification Checklist
- [ ] Measure production build chunk sizes with `npm run build`.
- [ ] Verify UI remains responsive during active batch file processing.
- [ ] Heap allocations return to baseline after file downloads complete.
