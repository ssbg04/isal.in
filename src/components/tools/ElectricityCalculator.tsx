import React, { useState, useMemo } from 'react';
import {
  Zap,
  Split,
  Tv,
  Wind,
  Refrigerator,
  Monitor,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  calculateSubMeterBill,
  calculateApplianceCost,
  type SubMeterInputs,
  type ApplianceUsageInputs,
} from '../../services/calculatorService';

export const ElectricityCalculator: React.FC = () => {
  const [tab, setTab] = useState<'submeter' | 'appliance'>('submeter');

  // Submeter state
  const [mainBillAmount, setMainBillAmount] = useState<string>('4850');
  const [masterKwh, setMasterKwh] = useState<string>('380');
  const [subPrevKwh, setSubPrevKwh] = useState<string>('1240');
  const [subPresKwh, setSubPresKwh] = useState<string>('1365');
  const [commonAreaPercent, setCommonAreaPercent] = useState<string>('0');
  const [copied, setCopied] = useState<boolean>(false);

  // Appliance state
  const [wattage, setWattage] = useState<string>('800');
  const [hoursPerDay, setHoursPerDay] = useState<string>('8');
  const [daysPerMonth, setDaysPerMonth] = useState<string>('30');
  const [electricityRate, setElectricityRate] = useState<string>('12.50');

  const subMeterInputs: SubMeterInputs = useMemo(() => {
    return {
      totalMainBillAmount: parseFloat(mainBillAmount) || 0,
      totalMasterMeterKwh: parseFloat(masterKwh) || 0,
      subMeterPreviousKwh: parseFloat(subPrevKwh) || 0,
      subMeterPresentKwh: parseFloat(subPresKwh) || 0,
      commonAreaChargePercent: parseFloat(commonAreaPercent) || 0,
    };
  }, [mainBillAmount, masterKwh, subPrevKwh, subPresKwh, commonAreaPercent]);

  const subMeterResult = useMemo(() => {
    return calculateSubMeterBill(subMeterInputs);
  }, [subMeterInputs]);

  const applianceInputs: ApplianceUsageInputs = useMemo(() => {
    return {
      wattage: parseFloat(wattage) || 0,
      hoursPerDay: parseFloat(hoursPerDay) || 0,
      daysPerMonth: parseInt(daysPerMonth, 10) || 30,
      ratePerKwh: parseFloat(electricityRate) || 0,
    };
  }, [wattage, hoursPerDay, daysPerMonth, electricityRate]);

  const applianceResult = useMemo(() => {
    return calculateApplianceCost(applianceInputs);
  }, [applianceInputs]);

  const formatPHP = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleCopySubmeterReceipt = () => {
    const text = `⚡ ELECTRICITY SUB-METER STATEMENT ⚡
Sub-meter Reading:
• Previous: ${subMeterInputs.subMeterPreviousKwh} kWh
• Present: ${subMeterInputs.subMeterPresentKwh} kWh
• Total Consumed: ${subMeterResult.subMeterKwhConsumed} kWh

Rate Calculation:
• Master Bill: ${formatPHP(subMeterInputs.totalMainBillAmount)} / ${subMeterInputs.totalMasterMeterKwh} kWh
• Effective Rate: ₱${subMeterResult.effectiveRatePerKwh.toFixed(4)} / kWh
${subMeterResult.commonAreaAmount > 0 ? `• Common Area Share: ${formatPHP(subMeterResult.commonAreaAmount)}\n` : ''}
TOTAL DUE: ${formatPHP(subMeterResult.totalTenantDue)}
Please settle with landlord. Thank you!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const appliancePresets = [
    { label: 'Inverter Aircon (1HP)', watts: 800, hours: 8, icon: Wind },
    { label: 'Window Aircon (Non-inv)', watts: 1400, hours: 8, icon: Wind },
    { label: 'Refrigerator (2-Door)', watts: 150, hours: 24, icon: Refrigerator },
    { label: 'Desk Fan (16")', watts: 55, hours: 12, icon: Wind },
    { label: 'Gaming PC + Monitor', watts: 350, hours: 6, icon: Monitor },
    { label: 'Smart TV (50" LED)', watts: 95, hours: 5, icon: Tv },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setTab('submeter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'submeter'
              ? 'bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Sub-Meter Bill Splitter (Apartments & Rentals)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('appliance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            tab === 'appliance'
              ? 'bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/20'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Appliance Running Cost Calculator</span>
        </button>
      </div>

      {tab === 'submeter' ? (
        <div className="space-y-6">
          {/* Submeter Hero Banner */}
          <div className="bg-gradient-to-br from-amber-950/40 via-neutral-900/80 to-neutral-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl shadow-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Tenant Sub-Meter Computation
                </span>
                <h2 className="text-xs font-semibold text-neutral-300 mt-2 uppercase tracking-wider">
                  Total Sub-Meter Amount Due
                </h2>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight mt-1">
                  {formatPHP(subMeterResult.totalTenantDue)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Tenant consumed{' '}
                  <strong className="text-neutral-200 font-mono">{subMeterResult.subMeterKwhConsumed} kWh</strong> @{' '}
                  <span className="text-amber-300 font-mono">₱{subMeterResult.effectiveRatePerKwh.toFixed(4)}/kWh</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <button
                  type="button"
                  onClick={handleCopySubmeterReceipt}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-xs font-medium text-neutral-200 border border-neutral-700/60 transition-all active:scale-95 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Receipt' : 'Copy SMS / Messenger Slip'}</span>
                </button>
                <div className="text-[11px] text-neutral-400">
                  Landlord / Master Remainder:{' '}
                  <span className="font-mono text-neutral-300 font-semibold">
                    {formatPHP(subMeterResult.landlordMainRemainderAmount)}
                  </span>
                </div>
              </div>
            </div>

            {!subMeterResult.isValid && subMeterResult.message && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/70 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{subMeterResult.message}</span>
              </div>
            )}
          </div>

          {/* Submeter Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Total Main Electric Bill (₱)</span>
                <span className="text-[10px] text-neutral-500">Meralco</span>
              </label>
              <input
                type="number"
                value={mainBillAmount}
                onChange={(e) => setMainBillAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Total Master Meter (kWh)</span>
                <span className="text-[10px] text-neutral-500">Main</span>
              </label>
              <input
                type="number"
                value={masterKwh}
                onChange={(e) => setMasterKwh(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Sub-Meter Previous Reading</span>
                <span className="text-[10px] text-neutral-500">kWh</span>
              </label>
              <input
                type="number"
                value={subPrevKwh}
                onChange={(e) => setSubPrevKwh(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Sub-Meter Present Reading</span>
                <span className="text-[10px] text-neutral-500">kWh</span>
              </label>
              <input
                type="number"
                value={subPresKwh}
                onChange={(e) => setSubPresKwh(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Optional Common Area Split (%)</span>
                <span className="text-[10px] text-neutral-500">hallway, pumps, shared WiFi</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={commonAreaPercent}
                onChange={(e) => setCommonAreaPercent(e.target.value)}
                placeholder="0"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Explanation Card */}
          <div className="p-4 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex items-start gap-3 text-xs text-neutral-400">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-200">How Sub-meter Billing Works: </span>
              <span>
                The blended effective rate is calculated as (Total Main Bill ₱ ÷ Total Master kWh). This accurately includes generation charges, transmission, distribution, system loss, and VAT evenly across all tenants without overcharging.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Appliance Cost Banner */}
          <div className="bg-gradient-to-br from-amber-950/40 via-neutral-900/80 to-neutral-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl shadow-amber-950/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Monthly Operating Cost
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight mt-1">
                  {formatPHP(applianceResult.monthlyCost)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  {applianceResult.monthlyKwh} kWh / month ({daysPerMonth} days)
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Daily Cost
                </div>
                <div className="text-2xl font-bold text-neutral-100 font-mono mt-1">
                  {formatPHP(applianceResult.dailyCost)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  {applianceResult.dailyKwh} kWh / day ({hoursPerDay} hrs/day)
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Annual Estimated Cost
                </div>
                <div className="text-2xl font-bold text-neutral-300 font-mono mt-1">
                  {formatPHP(applianceResult.yearlyCost)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Rate @ ₱{parseFloat(electricityRate || '0').toFixed(2)}/kWh
                </div>
              </div>
            </div>
          </div>

          {/* Appliance Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Appliance Power (Watts)</label>
              <input
                type="number"
                value={wattage}
                onChange={(e) => setWattage(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Hours Used per Day</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Days per Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={daysPerMonth}
                onChange={(e) => setDaysPerMonth(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Electricity Rate (₱ / kWh)</label>
              <input
                type="number"
                step="0.1"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Appliance Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Quick Appliance Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {appliancePresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setWattage(preset.watts.toString());
                      setHoursPerDay(preset.hours.toString());
                    }}
                    className="p-3 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 text-left transition-all hover:border-amber-500/40 group"
                  >
                    <Icon className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-semibold text-neutral-200 truncate">{preset.label}</div>
                    <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                      {preset.watts}W • {preset.hours}h/d
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
