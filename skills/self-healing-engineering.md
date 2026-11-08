# Engineering Skill: Self-Healing Engineering & Autonomous Recovery

## Purpose
Defines the autonomous protocol for detecting, isolating, diagnosing, and repairing compilation, runtime, and test failures without unsafe self-modification.

## When to Activate
Activate immediately upon encountering any test failure, linter error, build issue, or runtime regression.

## Required Context
- Error logs from `oxlint`, `vitest`, `tsc`, and `vite build`.
- Git branch history and working tree diffs.

## The 10-Step Self-Healing Loop
1. **Detect**: Intercept failure output with exact error code and file location.
2. **Capture**: Extract the minimal reproducible failure log.
3. **Reproduce**: Run the specific targeted command (e.g. `npx vitest run src/services/calculatorService.test.ts`).
4. **Diagnose**: Analyze root cause (type mismatch, missing export, runtime null pointer, unhandled promise).
5. **Formulate Minimal Fix**: Identify the most focused, surgical modification to correct the defect.
6. **Apply Repair**: Modify the target file using `edit_file`.
7. **Add Regression Guard**: Ensure a test case specifically validates the fixed edge case.
8. **Targeted Verification**: Re-run the failing test/command to verify the fix works.
9. **Full Pipeline Verification**: Execute `npm run check` to confirm no collateral damage.
10. **Document Resolution**: Note the issue, root cause, and verified resolution.

## Recovery Guardrails
- Maximum 3 repair attempts on a single failure path before stepping back to re-evaluate architectural assumptions.
- Never delete or disable a failing test to force a green build.
- Never weaken TypeScript compiler flags or disable linter rules.
- Never execute destructive git commands (`git reset --hard`, `git clean -fd`) without user confirmation.
