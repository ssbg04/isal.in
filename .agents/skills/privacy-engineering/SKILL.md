---
name: privacy-engineering
description: Auditing and enforcing 100% client-side zero-upload privacy, memory lifecycle cleanup, and strict telemetry boundaries. Use when touching file conversions, browser storage, or third-party scripts.
---

# Privacy Engineering Skill

Use this skill when auditing or modifying file handling routines, network requests, object URLs, local storage, or analytics.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/privacy-engineering.md`.
2. Guarantee zero server uploads: user files, images, documents, and calculation parameters must never be transmitted off the client device.
3. Clean up every `URL.createObjectURL()` deterministically using `URL.revokeObjectURL()` to prevent memory accumulation.
4. Keep telemetry strictly limited to anonymized route visits via Vercel Analytics; never transmit file names or conversion inputs.
5. Provide user-controlled clearing for any data retained locally in `localStorage`.
