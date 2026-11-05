import { describe, expect, it } from 'vitest';
import {
  calculateBmi,
  calculateMortgage,
  calculatePagIbigContribution,
  calculatePhilHealthContribution,
  calculatePhilippineGwa,
  calculatePhilippineTax,
  calculateSssContribution,
} from './calculatorService';

describe('PH statutory contributions', () => {
  it('SSS floors and caps', () => {
    expect(calculateSssContribution(3000)).toBe(180);
    expect(calculateSssContribution(100000)).toBe(1350);
  });

  it('PhilHealth employee share is 2.5% within ₱10k–₱100k', () => {
    expect(calculatePhilHealthContribution(5000)).toBe(250);
    expect(calculatePhilHealthContribution(40000)).toBe(1000);
    expect(calculatePhilHealthContribution(500000)).toBe(2500);
  });

  it('Pag-IBIG is 1% at ≤₱1,500, else 2% capped at ₱200', () => {
    expect(calculatePagIbigContribution(1500)).toBe(15);
    expect(calculatePagIbigContribution(5000)).toBe(100);
    expect(calculatePagIbigContribution(50000)).toBe(200);
  });
});

describe('calculatePhilippineTax (TRAIN 2023+)', () => {
  it('is tax-exempt under ₱250k annual taxable', () => {
    const r = calculatePhilippineTax({ monthlyBasicSalary: 20000 });
    expect(r.monthlyWithholdingTax).toBe(0);
  });

  it('computes ₱50,000/mo correctly (20% bracket)', () => {
    const r = calculatePhilippineTax({ monthlyBasicSalary: 50000 });
    expect(r.totalMonthlyContributions).toBe(2800);
    expect(r.taxableAnnualIncome).toBe(566400);
    expect(r.annualWithholdingTax).toBe(55780);
    expect(r.monthlyWithholdingTax).toBe(4648);
    expect(r.monthlyNetPay).toBe(50000 - 2800 - 4648);
  });

  it('applies top 35% bracket', () => {
    const r = calculatePhilippineTax({
      monthlyBasicSalary: 1_000_000,
      isCustomContributions: true,
      customSss: 0,
      customPhilHealth: 0,
      customPagIbig: 0,
    });
    expect(r.annualWithholdingTax).toBe(2202500 + (12_000_000 - 8_000_000) * 0.35);
  });

  it('treats negative salary as zero', () => {
    expect(calculatePhilippineTax({ monthlyBasicSalary: -5 }).grossMonthly).toBe(0);
  });
});

describe('calculateMortgage', () => {
  it('matches standard amortization formula', () => {
    const r = calculateMortgage({ principal: 1_000_000, annualInterestRate: 6, loanTermYears: 20 });
    expect(r.monthlyPayment).toBeCloseTo(7164.31, 2);
    expect(r.yearlySchedule).toHaveLength(20);
    expect(r.yearlySchedule.at(-1)!.remainingBalance).toBe(0);
  });

  it('handles 0% interest', () => {
    const r = calculateMortgage({ principal: 120_000, annualInterestRate: 0, loanTermYears: 1 });
    expect(r.monthlyPayment).toBe(10_000);
    expect(r.totalInterest).toBe(0);
  });

  it('returns zeros when down payment covers principal', () => {
    expect(calculateMortgage({ principal: 100, annualInterestRate: 5, loanTermYears: 5, downPayment: 200 }).monthlyPayment).toBe(0);
  });
});

describe('calculateBmi', () => {
  it('metric WHO classification', () => {
    const r = calculateBmi({ system: 'metric', heightCm: 170, weightKg: 70 })!;
    expect(r.bmi).toBe(24.2);
    expect(r.classification).toBe('Normal Weight');
  });

  it('Asian cutoff flags 24.2 as overweight', () => {
    expect(calculateBmi({ system: 'metric', heightCm: 170, weightKg: 70, isAsianCriteria: true })!.classification).toBe(
      'Overweight (Pre-obese)'
    );
  });

  it('imperial equals metric', () => {
    const r = calculateBmi({ system: 'imperial', heightFeet: 5, heightInches: 7, weightLbs: 154 })!;
    expect(r.bmi).toBeCloseTo(24.1, 1);
  });

  it('rejects invalid input', () => {
    expect(calculateBmi({ system: 'metric', heightCm: 0, weightKg: 70 })).toBeNull();
  });
});

describe('calculatePhilippineGwa', () => {
  const c = (units: number, grade: number) => ({ id: String(Math.random()), courseCode: 'X', units, grade });

  it('weights grades by units', () => {
    const r = calculatePhilippineGwa([c(3, 1.0), c(3, 1.5)]);
    expect(r.gwa).toBe(1.25);
    expect(r.latinHonorsStanding).toBe('Magna Cum Laude Standing');
  });

  it('failed units block honors', () => {
    const r = calculatePhilippineGwa([c(3, 1.0), c(3, 1.0), c(1, 5.0)]);
    expect(r.failedUnits).toBe(1);
    expect(r.latinHonorsStanding).toMatch(/Ineligible/);
  });

  it('empty list', () => {
    expect(calculatePhilippineGwa([]).gwa).toBe(0);
  });
});

