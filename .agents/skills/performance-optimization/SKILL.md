---
name: performance-optimization
description: Minimizing initial bundle size, vendor chunk splitting, Web Worker compute offloading, and memory lifecycle management. Use when optimizing bundle sizes, conversion speed, or rendering performance.
---

# Performance Optimization Skill

Use this skill when auditing or improving application load times, chunk splitting, memory usage, or conversion throughput.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/performance-optimization.md`.
2. Keep the initial JS bundle lean by dynamically importing heavy libraries (`pdf-lib`, `jszip`, `js-yaml`) and lazy-loading specialized tools.
3. Process long-running or batch transformations asynchronously or via Web Workers to prevent UI frame drops.
4. Process batch files with controlled concurrency (e.g. 2 parallel conversions) to protect low-memory devices.
5. Report actual measured build metrics before and after changes.
