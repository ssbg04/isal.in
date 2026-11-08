---
name: self-healing-engineering
description: Controlled autonomous diagnostic and recovery loop for test, compiler, linter, and runtime failures. Use when diagnosing build failures, fixing regressions, or recovering from broken tool states.
---

# Self-Healing Engineering Skill

Use this skill when diagnosing and repairing build, test, or runtime failures autonomously.

## Core Directives
1. Reference the comprehensive engineering guide: `skills/self-healing-engineering.md`.
2. Execute the 10-step recovery cycle: Detect -> Capture -> Reproduce -> Diagnose -> Minimal Repair -> Regression Guard -> Targeted Verification -> Full Pipeline Verification -> Document.
3. Never suppress errors, weaken compiler flags, or delete failing tests to pass CI/CD.
4. Bound repair attempts to 3 iterations before re-evaluating architectural assumptions.
5. Always verify complete recovery using `npm run check`.
