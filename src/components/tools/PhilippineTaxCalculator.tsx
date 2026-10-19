import React, { useState, useMemo } from 'react';
import {
  Coins,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Copy,
  Check,
  TrendingDown,
  Info,
  Calendar,
} from 'lucide-react';
import {
  calculatePhilippineTax,
  type PhilippineTaxInputs,
} from '../../services/calculatorService';

export const PhilippineTaxCalculator: React.FC = () => {
  const [basicSalary, setBasicSalary] = useState<string>('45000');
  const [allowances, setAllowances] = useState<string>('2000');
  const [otherTaxable, setOtherTaxable] = useState<string>('0');
  const [copied, setCopied] = useState<boolean>(false);

  const parsedInputs: PhilippineTaxInputs = useMemo(() => {
    return {
      monthlyBasicSalary: parseFloat(basicSalary) || 0,
      otherNonTaxableAllowances: parseFloat(allowances) || 0,
      otherTaxableIncome: parseFloat(otherTaxable) || 0,
    };
  }, [basicSalary, allowances, otherTaxable]);

  const tax = useMemo(() => {
    return calculatePhilippineTax(parsedInputs);
  }, [parsedInputs]);

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleCopySummary = () => {
    const text = `--- Philippine Payslip Breakdown (TRAIN Law) ---
Monthly Basic: ${formatPHP(tax.grossMonthly)}
SSS Contribution: ${formatPHP(tax.sssContribution)}
PhilHealth (2.5%): ${formatPHP(tax.philHealthContribution)}
Pag-IBIG (HDMF): ${formatPHP(tax.pagIbigContribution)}
Total Contributions: ${formatPHP(tax.totalMonthlyContributions)}
Taxable Income: ${formatPHP(tax.taxableMonthlyIncome)}
Withholding Tax: ${formatPHP(tax.monthlyWithholdingTax)} (${tax.effectiveTaxRate}% eff.)
-----------------------------------------------
NET TAKE-HOME PAY:
Semi-Monthly (15th/30th): ${formatPHP(tax.semiMonthlyNetPay)}
Monthly Net Pay: ${formatPHP(tax.monthlyNetPay)}
Annual Net Pay: ${formatPHP(tax.annualNetPay)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setSalaryPreset = (amount: number) => {
    setBasicSalary(amount.toString());
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Take-Home Pay Card */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-neutral-900/80 to-neutral-950 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-emerald-950/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TRAIN Law (2023+ Updated Rates)
              </span>
              <span className="text-xs text-neutral-400">RA 10963 Revised Schedule</span>
            </div>
            <h2 className="text-sm font-semibold text-neutral-300 mt-2 uppercase tracking-wider">
              Estimated Monthly Net Take-Home Pay
            </h2>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight mt-1">
              {formatPHP(tax.monthlyNetPay)}
            </div>
            <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                Semi-Monthly Cutoff (15th / 30th):{' '}
                <strong className="text-neutral-200 font-mono">{formatPHP(tax.semiMonthlyNetPay)}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700/60 transition-all active:scale-95 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Breakdown' : 'Copy Payslip Slip'}</span>
            </button>
            <div className="text-[11px] text-neutral-400">
              Annual Net: <span className="font-mono text-neutral-300 font-semibold">{formatPHP(tax.annualNetPay)}</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio: Net Pay vs Taxes & Deductions */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>
              Take-Home:{' '}
              <strong className="text-emerald-400">
                {tax.grossMonthly > 0 ? Math.round((tax.monthlyNetPay / tax.grossMonthly) * 100) : 100}%
              </strong>
            </span>
            <span>
              Total Deductions:{' '}
              <strong className="text-rose-400">
                {formatPHP(tax.totalMonthlyContributions + tax.monthlyWithholdingTax)}
              </strong>
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${tax.grossMonthly > 0 ? (tax.monthlyNetPay / tax.grossMonthly) * 100 : 100}%`,
              }}
            />
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{
                width: `${tax.grossMonthly > 0 ? (tax.totalMonthlyContributions / tax.grossMonthly) * 100 : 0}%`,
              }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{
                width: `${tax.grossMonthly > 0 ? (tax.monthlyWithholdingTax / tax.grossMonthly) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-neutral-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Net Pay
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Contributions (SSS/PhilHealth/HDMF)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> BIR Withholding Tax
            </span>
          </div>
        </div>
      </div>

      {/* Salary & Income Input Fields */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Compensation Inputs</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Monthly Basic Salary (₱)</label>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              De Minimis / Non-taxable Allowances (₱)
            </label>
            <input
              type="number"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Other Taxable Income / Overtime (₱)</label>
            <input
              type="number"
              value={otherTaxable}
              onChange={(e) => setOtherTaxable(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-500">Quick Salaries:</span>
          {[20000, 30000, 45000, 60000, 85000, 120000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setSalaryPreset(amt)}
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              ₱{(amt / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>

      {/* Itemized Deductions & Contributions Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SSS */}
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>SSS (Employee)</span>
            </span>
            <span className="text-[10px] font-mono bg-sky-950/60 text-sky-400 px-1.5 py-0.5 rounded border border-sky-800/40">
              4.5% MSC
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-neutral-100 mt-2">
            {formatPHP(tax.sssContribution)}
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Based on maximum ₱30k Monthly Salary Credit.
          </p>
        </div>

        {/* PhilHealth */}
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>PhilHealth (2.5%)</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">
              5% Total
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-neutral-100 mt-2">
            {formatPHP(tax.philHealthContribution)}
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Floor ₱10k, Ceiling ₱100k split with employer.
          </p>
        </div>

        {/* Pag-IBIG */}
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Pag-IBIG (HDMF)</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-950/60 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/40">
              ₱200 Max
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-neutral-100 mt-2">
            {formatPHP(tax.pagIbigContribution)}
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            2% monthly contribution up to 2024 cap.
          </p>
        </div>

        {/* BIR Withholding Tax */}
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>BIR Tax (Monthly)</span>
            </span>
            <span className="text-[10px] font-mono bg-rose-950/60 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800/40">
              {tax.effectiveTaxRate}% eff.
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-2">
            {formatPHP(tax.monthlyWithholdingTax)}
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Annual Tax: {formatPHP(tax.annualWithholdingTax)}
          </p>
        </div>
      </div>

      {/* Tax Bracket Explanation Footer */}
      <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex items-start gap-3 text-xs text-neutral-400">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-neutral-200">Applicable BIR Tax Bracket: </span>
          <span>{tax.taxBracketDescription}</span>
          <div className="mt-1 text-[11px] text-neutral-500">
            Note: 13th month pay and other benefits up to ₱90,000 are legally exempt from Philippine withholding tax under the TRAIN Law.
          </div>
        </div>
      </div>
    </div>
  );
};
