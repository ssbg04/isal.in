// Specialized Calculators: Philippines Income Tax, Mortgage & Loan, Electricity & Sub-meter, BMI, and Philippine GPA / GWA

// ==========================================
// 1. PHILIPPINE INCOME TAX (TRAIN LAW 2023+)
// ==========================================

export interface PhilippineTaxInputs {
  monthlyBasicSalary: number;
  taxYear?: '2023-present' | '2018-2022';
  otherNonTaxableAllowances?: number;
  otherTaxableIncome?: number;
  isCustomContributions?: boolean;
  customSss?: number;
  customPhilHealth?: number;
  customPagIbig?: number;
}

export interface PhilippineTaxBreakdown {
  grossMonthly: number;
  annualGross: number;
  // Mandatory contributions (Monthly)
  sssContribution: number;
  philHealthContribution: number;
  pagIbigContribution: number;
  totalMonthlyContributions: number;
  // Taxable income
  taxableMonthlyIncome: number;
  taxableAnnualIncome: number;
  // Tax computation
  monthlyWithholdingTax: number;
  annualWithholdingTax: number;
  effectiveTaxRate: number;
  // Net Take-Home Pay
  monthlyNetPay: number;
  semiMonthlyNetPay: number; // Cutoff 15th and 30th
  annualNetPay: number;
  taxBracketDescription: string;
}

/** Compute SSS Employee share based on regular SSS contribution table (2024 max MSC ₱30,000) */
export function calculateSssContribution(monthlySalary: number): number {
  if (monthlySalary < 4250) return 180;
  if (monthlySalary >= 29750) return 1350; // 4.5% of max MSC 30,000
  // Standard bracket increment: 500 step increments
  const msc = Math.min(30000, Math.max(4000, Math.floor((monthlySalary + 250) / 500) * 500));
  return Math.round(msc * 0.045);
}

/** Compute PhilHealth Employee share (2024: 5% total split 50/50, min floor ₱10k, max ceiling ₱100k) */
export function calculatePhilHealthContribution(monthlySalary: number): number {
  const cappedSalary = Math.min(100000, Math.max(10000, monthlySalary));
  return Math.round((cappedSalary * 0.05) / 2); // 2.5% employee share
}

/** Compute Pag-IBIG (HDMF) Employee share (2% of salary, capped at ₱200/mo) */
export function calculatePagIbigContribution(monthlySalary: number): number {
  if (monthlySalary <= 1500) {
    return Math.round(monthlySalary * 0.01);
  }
  return Math.min(200, Math.round(monthlySalary * 0.02));
}

/**
 * Computes Philippine Personal Withholding Tax based on RA 10963 (TRAIN Law)
 * Revised graduated tax rates effective January 1, 2023 onwards.
 */
export function calculatePhilippineTax(inputs: PhilippineTaxInputs): PhilippineTaxBreakdown {
  const salary = Math.max(0, inputs.monthlyBasicSalary || 0);
  const allowances = Math.max(0, inputs.otherNonTaxableAllowances || 0);
  const otherTaxable = Math.max(0, inputs.otherTaxableIncome || 0);

  const sss = inputs.isCustomContributions && inputs.customSss !== undefined
    ? inputs.customSss
    : calculateSssContribution(salary);

  const philHealth = inputs.isCustomContributions && inputs.customPhilHealth !== undefined
    ? inputs.customPhilHealth
    : calculatePhilHealthContribution(salary);

  const pagIbig = inputs.isCustomContributions && inputs.customPagIbig !== undefined
    ? inputs.customPagIbig
    : calculatePagIbigContribution(salary);

  const totalMonthlyContributions = sss + philHealth + pagIbig;

  const grossMonthly = salary + allowances + otherTaxable;
  const annualGross = grossMonthly * 12;

  // Taxable monthly income is basic salary + other taxable - statutory contributions
  const taxableMonthlyIncome = Math.max(0, salary + otherTaxable - totalMonthlyContributions);
  const taxableAnnualIncome = taxableMonthlyIncome * 12;

  let annualTax = 0;
  let taxBracketDesc = '₱0 - ₱250,000 (0% Tax-Exempt)';

  if (taxableAnnualIncome <= 250000) {
    annualTax = 0;
    taxBracketDesc = 'Not over ₱250,000: 0% Tax Exempt';
  } else if (taxableAnnualIncome <= 400000) {
    annualTax = (taxableAnnualIncome - 250000) * 0.15;
    taxBracketDesc = '₱250,000 to ₱400,000: 15% of excess over ₱250,000';
  } else if (taxableAnnualIncome <= 800000) {
    annualTax = 22500 + (taxableAnnualIncome - 400000) * 0.20;
    taxBracketDesc = '₱400,000 to ₱800,000: ₱22,500 + 20% of excess over ₱400,000';
  } else if (taxableAnnualIncome <= 2000000) {
    annualTax = 102500 + (taxableAnnualIncome - 800000) * 0.25;
    taxBracketDesc = '₱800,000 to ₱2,000,000: ₱102,500 + 25% of excess over ₱800,000';
  } else if (taxableAnnualIncome <= 8000000) {
    annualTax = 402500 + (taxableAnnualIncome - 2000000) * 0.30;
    taxBracketDesc = '₱2,000,000 to ₱8,000,000: ₱402,500 + 30% of excess over ₱2,000,000';
  } else {
    annualTax = 2202500 + (taxableAnnualIncome - 8000000) * 0.35;
    taxBracketDesc = 'Over ₱8,000,000: ₱2,202,500 + 35% of excess over ₱8,000,000';
  }

  const monthlyWithholdingTax = Math.round(annualTax / 12);
  const monthlyNetPay = grossMonthly - totalMonthlyContributions - monthlyWithholdingTax;
  const semiMonthlyNetPay = Math.round((monthlyNetPay / 2) * 100) / 100;
  const annualNetPay = monthlyNetPay * 12;
  const effectiveTaxRate = grossMonthly > 0 ? (monthlyWithholdingTax / grossMonthly) * 100 : 0;

  return {
    grossMonthly,
    annualGross,
    sssContribution: sss,
    philHealthContribution: philHealth,
    pagIbigContribution: pagIbig,
    totalMonthlyContributions,
    taxableMonthlyIncome,
    taxableAnnualIncome,
    monthlyWithholdingTax,
    annualWithholdingTax: Math.round(annualTax),
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    monthlyNetPay,
    semiMonthlyNetPay,
    annualNetPay,
    taxBracketDescription: taxBracketDesc,
  };
}

// ==========================================
// 2. MORTGAGE & LOAN AMORTIZATION
// ==========================================

export interface MortgageInputs {
  principal: number;
  annualInterestRate: number; // e.g. 6.5 for 6.5%
  loanTermYears: number; // e.g. 20
  downPayment?: number;
}

export interface AmortizationScheduleRow {
  period: number; // Year or Month
  label: string;
  payment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  interestPercentage: number;
  yearlySchedule: AmortizationScheduleRow[];
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const rawPrincipal = Math.max(0, inputs.principal - (inputs.downPayment || 0));
  const rate = Math.max(0, inputs.annualInterestRate) / 100;
  const termYears = Math.max(1, inputs.loanTermYears);
  const totalMonths = termYears * 12;

  if (rawPrincipal <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      principal: 0,
      interestPercentage: 0,
      yearlySchedule: [],
    };
  }

  const monthlyRate = rate / 12;
  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = rawPrincipal / totalMonths;
  } else {
    monthlyPayment =
      (rawPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = Math.max(0, totalPayment - rawPrincipal);
  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  // Build yearly schedule
  const yearlySchedule: AmortizationScheduleRow[] = [];
  let balance = rawPrincipal;

  for (let year = 1; year <= termYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      const interestPart = balance * monthlyRate;
      const principalPart = monthlyPayment - interestPart;
      yearInterest += interestPart;
      yearPrincipal += principalPart;
      balance = Math.max(0, balance - principalPart);
    }

    yearlySchedule.push({
      period: year,
      label: `Year ${year}`,
      payment: Math.round(monthlyPayment * 12),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      remainingBalance: Math.round(balance),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principal: rawPrincipal,
    interestPercentage: Math.round(interestPercentage * 10) / 10,
    yearlySchedule,
  };
}

// ==========================================
// 3. ELECTRICITY & SUB-METER CALCULATOR
// ==========================================

export interface SubMeterInputs {
  totalMainBillAmount: number; // ₱ bill from Meralco / electric coop
  totalMasterMeterKwh: number; // Master meter total kWh
  subMeterPreviousKwh: number;
  subMeterPresentKwh: number;
  commonAreaChargePercent?: number; // Optional shared common area % (e.g. 0%, 5%, 10%)
}

export interface SubMeterResult {
  effectiveRatePerKwh: number;
  subMeterKwhConsumed: number;
  subMeterTenantAmount: number;
  commonAreaAmount: number;
  totalTenantDue: number;
  landlordMainRemainderAmount: number;
  isValid: boolean;
  message?: string;
}

export function calculateSubMeterBill(inputs: SubMeterInputs): SubMeterResult {
  const bill = Math.max(0, inputs.totalMainBillAmount);
  const masterKwh = Math.max(0, inputs.totalMasterMeterKwh);
  const prev = Math.max(0, inputs.subMeterPreviousKwh);
  const pres = Math.max(0, inputs.subMeterPresentKwh);
  const commonPct = Math.max(0, inputs.commonAreaChargePercent || 0) / 100;

  if (pres < prev) {
    return {
      effectiveRatePerKwh: 0,
      subMeterKwhConsumed: 0,
      subMeterTenantAmount: 0,
      commonAreaAmount: 0,
      totalTenantDue: 0,
      landlordMainRemainderAmount: bill,
      isValid: false,
      message: 'Present reading cannot be less than previous reading.',
    };
  }

  const subMeterKwh = pres - prev;

  if (masterKwh <= 0) {
    return {
      effectiveRatePerKwh: 0,
      subMeterKwhConsumed: subMeterKwh,
      subMeterTenantAmount: 0,
      commonAreaAmount: 0,
      totalTenantDue: 0,
      landlordMainRemainderAmount: bill,
      isValid: false,
      message: 'Total master meter kWh must be greater than zero.',
    };
  }

  // Effective blended rate = Total Bill / Total Master kWh
  const effectiveRate = bill / masterKwh;
  const tenantBase = subMeterKwh * effectiveRate;
  const commonCharge = tenantBase * commonPct;
  const totalTenantDue = Math.round((tenantBase + commonCharge) * 100) / 100;
  const landlordRemainder = Math.max(0, Math.round((bill - totalTenantDue) * 100) / 100);

  return {
    effectiveRatePerKwh: Math.round(effectiveRate * 10000) / 10000,
    subMeterKwhConsumed: Math.round(subMeterKwh * 100) / 100,
    subMeterTenantAmount: Math.round(tenantBase * 100) / 100,
    commonAreaAmount: Math.round(commonCharge * 100) / 100,
    totalTenantDue,
    landlordMainRemainderAmount: landlordRemainder,
    isValid: true,
  };
}

export interface ApplianceUsageInputs {
  wattage: number; // Watts
  hoursPerDay: number;
  daysPerMonth?: number;
  ratePerKwh: number; // ₱/kWh (default ~12.00 in PH Meralco)
}

export interface ApplianceUsageResult {
  dailyKwh: number;
  dailyCost: number;
  monthlyKwh: number;
  monthlyCost: number;
  yearlyCost: number;
}

export function calculateApplianceCost(inputs: ApplianceUsageInputs): ApplianceUsageResult {
  const watts = Math.max(0, inputs.wattage);
  const hours = Math.min(24, Math.max(0, inputs.hoursPerDay));
  const days = Math.min(31, Math.max(1, inputs.daysPerMonth || 30));
  const rate = Math.max(0, inputs.ratePerKwh);

  const dailyKwh = (watts * hours) / 1000;
  const dailyCost = dailyKwh * rate;
  const monthlyKwh = dailyKwh * days;
  const monthlyCost = monthlyKwh * rate;
  const yearlyCost = monthlyCost * 12;

  return {
    dailyKwh: Math.round(dailyKwh * 1000) / 1000,
    dailyCost: Math.round(dailyCost * 100) / 100,
    monthlyKwh: Math.round(monthlyKwh * 100) / 100,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    yearlyCost: Math.round(yearlyCost * 100) / 100,
  };
}

// ==========================================
// 4. BMI (BODY MASS INDEX) CALCULATOR
// ==========================================

export interface BmiInputs {
  system: 'metric' | 'imperial';
  heightCm?: number; // Metric
  weightKg?: number; // Metric
  heightFeet?: number; // Imperial
  heightInches?: number; // Imperial
  weightLbs?: number; // Imperial
  isAsianCriteria?: boolean; // WHO Asian cutoff (23+ overweight)
}

export interface BmiResult {
  bmi: number;
  classification: string;
  categoryColor: string;
  categoryDescription: string;
  healthyWeightRange: string;
  bmiPrime: number;
  ponderalIndex: number;
}

export function calculateBmi(inputs: BmiInputs): BmiResult | null {
  let heightMeters = 0;
  let weightKg = 0;

  if (inputs.system === 'metric') {
    if (!inputs.heightCm || !inputs.weightKg || inputs.heightCm <= 0 || inputs.weightKg <= 0) {
      return null;
    }
    heightMeters = inputs.heightCm / 100;
    weightKg = inputs.weightKg;
  } else {
    const totalInches = (inputs.heightFeet || 0) * 12 + (inputs.heightInches || 0);
    if (totalInches <= 0 || !inputs.weightLbs || inputs.weightLbs <= 0) {
      return null;
    }
    heightMeters = totalInches * 0.0254;
    weightKg = inputs.weightLbs * 0.45359237;
  }

  if (heightMeters <= 0 || weightKg <= 0) return null;

  const bmi = weightKg / (heightMeters * heightMeters);
  const bmiPrime = bmi / 25;
  const ponderalIndex = weightKg / Math.pow(heightMeters, 3);

  // Healthy weight range (BMI 18.5 - 24.9)
  const minHealthyKg = 18.5 * (heightMeters * heightMeters);
  const maxHealthyKg = 24.9 * (heightMeters * heightMeters);

  let healthyWeightRange = '';
  if (inputs.system === 'metric') {
    healthyWeightRange = `${minHealthyKg.toFixed(1)} kg – ${maxHealthyKg.toFixed(1)} kg`;
  } else {
    const minLbs = minHealthyKg / 0.45359237;
    const maxLbs = maxHealthyKg / 0.45359237;
    healthyWeightRange = `${minLbs.toFixed(1)} lbs – ${maxLbs.toFixed(1)} lbs`;
  }

  // Classification (Standard WHO vs Asian Cutoffs)
  let classification = '';
  let categoryColor = '';
  let categoryDescription = '';

  if (inputs.isAsianCriteria) {
    if (bmi < 18.5) {
      classification = 'Underweight';
      categoryColor = 'text-sky-500 bg-sky-500/10 border-sky-500/30';
      categoryDescription = 'Higher risk of nutritional deficiency and osteoporosis.';
    } else if (bmi < 23.0) {
      classification = 'Normal Weight';
      categoryColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      categoryDescription = 'Healthy weight range according to Asian population cutoffs.';
    } else if (bmi < 27.5) {
      classification = 'Overweight (Pre-obese)';
      categoryColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      categoryDescription = 'Increased risk of type 2 diabetes and hypertension.';
    } else {
      classification = 'Obese';
      categoryColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      categoryDescription = 'High risk of cardiovascular and metabolic disorders.';
    }
  } else {
    if (bmi < 18.5) {
      classification = 'Underweight';
      categoryColor = 'text-sky-500 bg-sky-500/10 border-sky-500/30';
      categoryDescription = 'Below standard healthy body mass index.';
    } else if (bmi < 25.0) {
      classification = 'Normal Weight';
      categoryColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      categoryDescription = 'Ideal weight range for low health risks.';
    } else if (bmi < 30.0) {
      classification = 'Overweight';
      categoryColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      categoryDescription = 'Above standard healthy weight.';
    } else if (bmi < 35.0) {
      classification = 'Obese Class I';
      categoryColor = 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      categoryDescription = 'Moderate obesity with health risks.';
    } else if (bmi < 40.0) {
      classification = 'Obese Class II';
      categoryColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      categoryDescription = 'Severe obesity.';
    } else {
      classification = 'Obese Class III';
      categoryColor = 'text-purple-500 bg-purple-500/10 border-purple-500/30';
      categoryDescription = 'Very severe / morbid obesity.';
    }
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    classification,
    categoryColor,
    categoryDescription,
    healthyWeightRange,
    bmiPrime: Math.round(bmiPrime * 100) / 100,
    ponderalIndex: Math.round(ponderalIndex * 10) / 10,
  };
}

// ==========================================
// 5. PHILIPPINE GPA / GWA CALCULATOR
// ==========================================

export interface CourseEntry {
  id: string;
  courseCode: string;
  units: number;
  grade: number; // e.g. 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 5.00
}

export interface PhilippineGwaResult {
  gwa: number; // General Weighted Average
  totalUnits: number;
  totalGradePoints: number;
  passedUnits: number;
  failedUnits: number;
  latinHonorsStanding: string;
  adjectiveRating: string;
  colorClass: string;
}

/**
 * Standard Philippine Higher Education Grading System:
 * 1.00 is highest (Excellent), 3.00 is Passing, 5.00 is Failing.
 * Lower number = higher academic achievement!
 */
export function calculatePhilippineGwa(courses: CourseEntry[]): PhilippineGwaResult {
  const validCourses = courses.filter((c) => c.units > 0 && !isNaN(c.grade));
  if (validCourses.length === 0) {
    return {
      gwa: 0,
      totalUnits: 0,
      totalGradePoints: 0,
      passedUnits: 0,
      failedUnits: 0,
      latinHonorsStanding: 'None',
      adjectiveRating: 'No valid courses entered',
      colorClass: 'text-neutral-400',
    };
  }

  let totalUnits = 0;
  let totalGradePoints = 0;
  let passedUnits = 0;
  let failedUnits = 0;

  for (const course of validCourses) {
    const units = course.units;
    const grade = course.grade;
    totalUnits += units;
    totalGradePoints += units * grade;

    if (grade <= 3.0) {
      passedUnits += units;
    } else {
      failedUnits += units;
    }
  }

  const gwa = totalUnits > 0 ? totalGradePoints / totalUnits : 0;
  const roundedGwa = Math.round(gwa * 10000) / 10000;

  let adjectiveRating = '';
  let colorClass = '';

  if (roundedGwa <= 1.20) {
    adjectiveRating = 'Excellent / Outstanding (Summa Cum Laude caliber)';
    colorClass = 'text-amber-400';
  } else if (roundedGwa <= 1.45) {
    adjectiveRating = 'Superior (Magna Cum Laude caliber)';
    colorClass = 'text-emerald-400';
  } else if (roundedGwa <= 1.75) {
    adjectiveRating = 'Very Good (Cum Laude caliber)';
    colorClass = 'text-sky-400';
  } else if (roundedGwa <= 2.00) {
    adjectiveRating = 'Good (College Scholar / Dean’s List)';
    colorClass = 'text-blue-400';
  } else if (roundedGwa <= 2.50) {
    adjectiveRating = 'Satisfactory';
    colorClass = 'text-neutral-300';
  } else if (roundedGwa <= 3.00) {
    adjectiveRating = 'Passing';
    colorClass = 'text-yellow-500';
  } else {
    adjectiveRating = 'Failed / Probationary status';
    colorClass = 'text-rose-500';
  }

  // University of the Philippines / Standard PH Latin Honors Cutoffs
  let latinHonors = 'Regular Standing';
  if (failedUnits === 0) {
    if (roundedGwa >= 1.00 && roundedGwa <= 1.20) {
      latinHonors = 'Summa Cum Laude Standing';
    } else if (roundedGwa <= 1.45) {
      latinHonors = 'Magna Cum Laude Standing';
    } else if (roundedGwa <= 1.75) {
      latinHonors = 'Cum Laude Standing';
    } else if (roundedGwa <= 2.00) {
      latinHonors = "Dean's List / College Scholar";
    }
  } else {
    latinHonors = 'Ineligible for Honors due to failed units';
  }

  return {
    gwa: Math.round(gwa * 1000) / 1000,
    totalUnits,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
    passedUnits,
    failedUnits,
    latinHonorsStanding: latinHonors,
    adjectiveRating,
    colorClass,
  };
}
