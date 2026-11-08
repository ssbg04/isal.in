# Engineering Skill: Testing & Regression Prevention

## Purpose
Governs unit testing, automated assertions, regression suites, and CI/CD verification protocols using Vitest and Oxlint.

## When to Activate
Activate before and after any code modification to ensure new functionality is validated and no regressions occur.

## Required Context
- Vitest configuration (`vite.config.ts`).
- Oxlint configuration (`.oxlintrc.json`).
- `npm run check` pipeline script (`lint`, `test`, `build`).

## Methodology & Engineering Standards
1. **Test Structure**:
   - Locate test files adjacent to the source or inside service folders: `[name].test.ts`.
   - Organize tests with descriptive `describe` and `it` blocks:
     ```ts
     describe('calculatePhilippineTax', () => {
       it('exempts annual income below ₱250,000 from withholding tax', () => { ... });
     });
     ```

2. **Edge Case Coverage**:
   - Positive tests: standard valid inputs.
   - Negative tests: malformed strings, out-of-range values, empty inputs.
   - Boundary tests: values at cutoffs (0, max limits, bracket thresholds).

3. **Deterministic & Fast Execution**:
   - Tests must run locally without external network access.
   - Entire test suite must execute in under 3 seconds.

4. **Self-Verification Protocol**:
   - Never consider a task done without running:
     ```bash
     npm run check
     ```

## Verification Checklist
- [ ] 100% of tests pass consistently.
- [ ] Oxlint reports 0 warnings and 0 errors.
- [ ] TypeScript compilation (`tsc -b`) succeeds cleanly.
