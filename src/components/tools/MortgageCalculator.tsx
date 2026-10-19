import React, { useState, useMemo } from 'react';
import {
  Home,
  Percent,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  PieChart,
} from 'lucide-react';
import {
  calculateMortgage,
  type MortgageInputs,
} from '../../services/calculatorService';

export const MortgageCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<string>('2500000');
  const [interestRate, setInterestRate] = useState<string>('6.25');
  const [termYears, setTermYears] = useState<string>('20');
  const [downPayment, setDownPayment] = useState<string>('250000');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const inputs: MortgageInputs = useMemo(() => {
    return {
      principal: parseFloat(principal) || 0,
      annualInterestRate: parseFloat(interestRate) || 0,
      loanTermYears: parseInt(termYears, 10) || 1,
      downPayment: parseFloat(downPayment) || 0,
    };
  }, [principal, interestRate, termYears, downPayment]);

  const result = useMemo(() => {
    return calculateMortgage(inputs);
  }, [inputs]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const setLoanPreset = (p: number, r: number, y: number, dp: number) => {
    setPrincipal(p.toString());
    setInterestRate(r.toString());
    setTermYears(y.toString());
    setDownPayment(dp.toString());
  };

  return (
    <div className="space-y-6">
      {/* Preset Loan Packages */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            <Home className="w-4 h-4 text-sky-400" />
            <span>Mortgage & Amortization Loan Calculator</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Calculate monthly amortization, total interest, and full payoff schedules for Pag-IBIG & bank housing loans.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-500">Presets:</span>
          <button
            type="button"
            onClick={() => setLoanPreset(2000000, 5.75, 20, 200000)}
            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Pag-IBIG (5.75% 20y)
          </button>
          <button
            type="button"
            onClick={() => setLoanPreset(4000000, 7.0, 15, 800000)}
            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Bank Loan (7.0% 15y)
          </button>
          <button
            type="button"
            onClick={() => setLoanPreset(1000000, 9.5, 5, 200000)}
            className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Auto Loan (9.5% 5y)
          </button>
        </div>
      </div>

      {/* Main Results Hero Card */}
      <div className="bg-gradient-to-br from-sky-950/40 via-neutral-900/80 to-neutral-950 border border-sky-500/30 rounded-3xl p-6 shadow-xl shadow-sky-950/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Monthly Amortization
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono tracking-tight mt-1">
              {formatCurrency(result.monthlyPayment)}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              For {termYears} years ({parseInt(termYears, 10) * 12} payments)
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Loan Repayment
            </div>
            <div className="text-2xl font-bold text-neutral-100 font-mono">
              {formatCurrency(result.totalPayment)}
            </div>
            <div className="text-xs text-neutral-400">
              Net Principal:{' '}
              <span className="font-mono text-neutral-300 font-semibold">{formatCurrency(result.principal)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Total Interest Paid
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {formatCurrency(result.totalInterest)}
            </div>
            <div className="text-xs text-neutral-400">
              Interest is{' '}
              <strong className="text-amber-300">{result.interestPercentage}%</strong> of total cost
            </div>
          </div>
        </div>

        {/* Principal vs Interest Visual Ratio */}
        <div className="mt-5 space-y-1.5">
          <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{
                width: `${result.totalPayment > 0 ? (result.principal / result.totalPayment) * 100 : 50}%`,
              }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 50}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>
                Principal: {result.totalPayment > 0 ? Math.round((result.principal / result.totalPayment) * 100) : 0}%
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Interest: {result.interestPercentage}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Input Parameters Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
            <span>Property Price / Principal</span>
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-neutral-400" />
            <span>Down Payment</span>
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-neutral-400" />
            <span>Interest Rate (%)</span>
          </label>
          <input
            type="number"
            step="0.05"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Loan Term (Years)</span>
          </label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-medium text-base focus:outline-none focus:border-sky-500"
          >
            {[1, 2, 3, 5, 10, 15, 20, 25, 30].map((yr) => (
              <option key={yr} value={yr}>
                {yr} {yr === 1 ? 'Year' : 'Years'} ({yr * 12} mos)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amortization Schedule Table Toggle */}
      <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900/40">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="w-full flex items-center justify-between p-4 text-xs font-semibold text-neutral-300 hover:bg-neutral-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            <span>Annual Amortization Breakdown Table ({result.yearlySchedule.length} years)</span>
          </div>
          {showSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSchedule && (
          <div className="overflow-x-auto border-t border-neutral-800 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-mono sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4">Annual Payment</th>
                  <th className="py-2.5 px-4">Principal Paid</th>
                  <th className="py-2.5 px-4">Interest Paid</th>
                  <th className="py-2.5 px-4">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.period} className="hover:bg-neutral-800/30">
                    <td className="py-2.5 px-4 font-semibold text-neutral-200">{row.label}</td>
                    <td className="py-2.5 px-4">{formatCurrency(row.payment)}</td>
                    <td className="py-2.5 px-4 text-sky-400">{formatCurrency(row.principalPaid)}</td>
                    <td className="py-2.5 px-4 text-amber-400">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-2.5 px-4">{formatCurrency(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
