# Engineering Skill: Browser File Processing & Media APIs

## Purpose
Governs client-side file transformation using HTML5 Canvas, WebAssembly, Web Audio, Video snapshots, and PDF compilation.

## When to Activate
Activate when modifying or adding image, audio, video, or PDF conversion capabilities.

## Required Context
- HTML5 Canvas API and `createImageBitmap()`.
- Web Audio API (`AudioContext`, `OfflineAudioContext`, WAV encoding).
- HTML5 `<video>` element snapshot extraction.
- `pdf-lib` document assembly and `pdfjs-dist` page rasterization.

## Methodology & Engineering Standards
1. **Image Conversion**:
   - Prefer `createImageBitmap()` over `HTMLImageElement` for asynchronous, off-thread image decoding.
   - For WebP/JPEG compression, use `canvas.toBlob(callback, mimeType, quality)`.
   - Preserve aspect ratios when resizing: calculate scale factor `Math.min(maxWidth / width, maxHeight / height)`.

2. **Audio Processing**:
   - Use `OfflineAudioContext` for non-realtime fast audio decoding and resampling.
   - For WAV encoding, generate standard RIFF header chunks with correct PCM bit depth (16-bit) and sample rates (44.1kHz or 48kHz).

3. **PDF Generation**:
   - Use `pdf-lib` to create PDF documents client-side.
   - Embed images as JPEG or PNG using `pdfDoc.embedJpg()` / `pdfDoc.embedPng()`.
   - Compute page dimensions dynamically based on image DPI or standard A4/Letter margins.

4. **Error Handling**:
   - Catch corrupted file headers and unsupported codecs gracefully.
   - Display clear, actionable feedback when an image cannot be parsed.

## Verification Checklist
- [ ] Conversion outputs tested across Safari, Chrome, Firefox, and Edge.
- [ ] Alpha transparency preserved when converting to PNG or WebP.
- [ ] Downloaded output files open without corruption in native viewers.
