# Engineering Skill: Calculator Correctness & Statutory Rules

## Purpose
Establishes mathematical rigor, statutory legal alignment, and unit conversion precision across all calculation tools.

## When to Activate
Activate when reviewing, modifying, or extending financial, tax, mathematical, or scientific unit calculation logic.

## Required Context
- Republic Act No. 10963 (TRAIN Law) and BIR withholding tax schedules.
- Social Security System (SSS), PhilHealth, and Pag-IBIG circulars.
- NIST physical measurement standards.

## Methodology & Engineering Standards
1. **Philippine TRAIN Law Calculations**:
   - Tax Brackets:
     - ₱0 - ₱250,000 annually: 0% tax.
     - ₱250,001 - ₱400,000: 15% of excess over ₱250,000.
     - ₱400,001 - ₱800,000: ₱22,500 + 20% of excess over ₱400,000.
     - ₱800,001 - ₱2,000,000: ₱102,500 + 25% of excess over ₱800,000.
     - ₱2,000,001 - ₱8,000,000: ₱402,500 + 30% of excess over ₱2,000,000.
     - Over ₱8,000,000: ₱2,202,500 + 35% of excess over ₱8,000,000.
   - Non-Taxable Allowances: Mandated 13th month pay & bonuses up to ₱90,000 are deducted before calculating taxable income.
   - SSS, PhilHealth, Pag-IBIG: Ensure employee shares match current statutory deduction matrices and maximum salary credits.

2. **Loan Amortization**:
   - Standard amortization formula: `M = P * [r(1 + r)^n] / [(1 + r)^n - 1]`.
   - Prevent division by zero when interest rate is 0%.

3. **Floating Point Safety**:
   - Round financial results to 2 decimal places using `Math.round((val + Number.EPSILON) * 100) / 100` to prevent IEEE 754 precision artifacts.

4. **Transparent Disclaimers**:
   - Every financial and health calculator must feature a clear disclaimer that outputs are informational estimates and do not substitute for official professional counsel.

## Verification Checklist
- [ ] Unit tests cover minimum wage (₱0 tax), median salaries, and executive tiers.
- [ ] Boundary conditions tested at exact bracket cutoffs (e.g. ₱20,833.33/month).
- [ ] Disclaimers clearly visible in UI.
