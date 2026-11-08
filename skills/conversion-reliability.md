# Engineering Skill: Conversion Reliability & Fault Tolerance

## Purpose
Ensures that all conversion processes are reliable, gracefully handle unexpected inputs, and recover seamlessly from failures without crashing the application.

## When to Activate
Activate during audits of error handling, file upload pipelines, batch queues, and edge case responses.

## Required Context
- Conversion services in `src/services/`.
- Error boundary architecture.

## Methodology & Engineering Standards
1. **Defensive Input Validation**:
   - Verify file type against magic bytes or supported MIME patterns before reading the entire stream.
   - Reject empty files (size == 0) and files exceeding maximum limits with immediate friendly messages.
   - Guard against invalid text encodings (UTF-8 replacement characters).

2. **Error Boundaries & Isolation**:
   - Wrap each active tool component in a React Error Boundary.
   - A crash in a single complex tool (e.g. video trimmer) must never crash the entire application or take down the navigation header.
   - Provide a "Reset Tool" button inside the error boundary fallback.

3. **Batch Resilience**:
   - In multi-file batch conversions, a single corrupted file must not abort the entire queue.
   - Mark the failed item with an error badge and continue processing remaining items.
   - Provide an individual retry button for failed batch items.

4. **Meaningful Error Messages**:
   - Avoid generic "Something went wrong" messages.
   - Provide context: "Unsupported audio codec in file.mp4. Please select an MP3, WAV, or WebM file."

## Verification Checklist
- [ ] Corrupted file uploads produce user-friendly error banners without crashing the app.
- [ ] Error boundaries display recovery options.
- [ ] Failed batch conversions do not halt remaining queue tasks.
