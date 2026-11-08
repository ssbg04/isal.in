---
name: security-hardening
description: Defensive coding against XSS, path traversal, archive expansion bombs, and CSP misconfigurations. Use when reviewing file uploads, archive extractions, SVG/HTML rendering, or HTTP security headers.
---

# Security Hardening Skill

Use this skill when auditing or improving application security, file processing, or deployment configurations.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/security-hardening.md`.
2. Sanitize all download and extracted filenames to eliminate directory traversal sequences (`../`, `..\`).
3. Neutralize script execution in uploaded SVGs and Markdown previews.
4. Enforce strict Content Security Policy (CSP) in `vercel.json`; eliminate `'unsafe-eval'` unless strictly necessary.
5. Bound file sizes and batch sizes before reading data into browser memory.
