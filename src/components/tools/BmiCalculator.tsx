import React, { useState, useMemo } from 'react';
import {
  Heart,
  Scale,
} from 'lucide-react';
import {
  calculateBmi,
  type BmiInputs,
} from '../../services/calculatorService';

export const BmiCalculator: React.FC = () => {
  const [system, setSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState<string>('170');
  const [weightKg, setWeightKg] = useState<string>('65');
  const [heightFeet, setHeightFeet] = useState<string>('5');
  const [heightInches, setHeightInches] = useState<string>('7');
  const [weightLbs, setWeightLbs] = useState<string>('143');
  const [isAsianCriteria, setIsAsianCriteria] = useState<boolean>(true);

  const inputs: BmiInputs = useMemo(() => {
    return {
      system,
      heightCm: parseFloat(heightCm) || 0,
      weightKg: parseFloat(weightKg) || 0,
      heightFeet: parseFloat(heightFeet) || 0,
      heightInches: parseFloat(heightInches) || 0,
      weightLbs: parseFloat(weightLbs) || 0,
      isAsianCriteria,
    };
  }, [system, heightCm, weightKg, heightFeet, heightInches, weightLbs, isAsianCriteria]);

  const result = useMemo(() => {
    return calculateBmi(inputs);
  }, [inputs]);

  // Metric to Imperial sync helpers
  const handleSystemChange = (nextSys: 'metric' | 'imperial') => {
    if (nextSys === 'imperial' && system === 'metric') {
      const cm = parseFloat(heightCm) || 170;
      const kg = parseFloat(weightKg) || 65;
      const totalInches = cm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inc = Math.round(totalInches % 12);
      const lbs = Math.round(kg * 2.20462);
      setHeightFeet(ft.toString());
      setHeightInches(inc.toString());
      setWeightLbs(lbs.toString());
    } else if (nextSys === 'metric' && system === 'imperial') {
      const ft = parseFloat(heightFeet) || 5;
      const inc = parseFloat(heightInches) || 7;
      const lbs = parseFloat(weightLbs) || 143;
      const totalInches = ft * 12 + inc;
      const cm = Math.round(totalInches * 2.54);
      const kg = Math.round(lbs * 0.453592);
      setHeightCm(cm.toString());
      setWeightKg(kg.toString());
    }
    setSystem(nextSys);
  };

  return (
    <div className="space-y-6">
      {/* Top Options & Asian Cutoff Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSystemChange('metric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              system === 'metric'
                ? 'bg-rose-500 text-neutral-950 font-bold shadow-sm shadow-rose-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Metric (cm, kg)
          </button>
          <button
            type="button"
            onClick={() => handleSystemChange('imperial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              system === 'imperial'
                ? 'bg-rose-500 text-neutral-950 font-bold shadow-sm shadow-rose-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Imperial (ft/in, lbs)
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAsianCriteria}
            onChange={(e) => setIsAsianCriteria(e.target.checked)}
            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-neutral-950 border-neutral-700"
          />
          <span className="flex items-center gap-1 font-medium">
            <span>Asian / Filipino WHO Population Thresholds</span>
            <span className="text-[10px] text-neutral-500">(Overweight ≥ 23)</span>
          </span>
        </label>
      </div>

      {/* Main Results Hero Card */}
      {result ? (
        <div className="bg-gradient-to-br from-rose-950/40 via-neutral-900/80 to-neutral-950 border border-rose-500/30 rounded-3xl p-6 shadow-xl shadow-rose-950/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Body Mass Index (BMI)</span>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-neutral-100 font-mono tracking-tight mt-1 flex items-baseline gap-2">
                <span>{result.bmi.toFixed(1)}</span>
                <span className="text-sm font-sans font-normal text-neutral-400">kg/m²</span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${result.categoryColor}`}
                >
                  {result.classification}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Healthy Target Weight
              </div>
              <div className="text-xl font-bold text-neutral-100 font-mono">
                {result.healthyWeightRange}
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                {result.categoryDescription}
              </p>
            </div>

            <div className="space-y-3 bg-neutral-950/50 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">BMI Prime (vs 25):</span>
                <span className="font-mono text-neutral-200 font-semibold">{result.bmiPrime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Ponderal Index:</span>
                <span className="font-mono text-neutral-200 font-semibold">{result.ponderalIndex} kg/m³</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Standard:</span>
                <span className="font-mono text-rose-400 font-semibold">
                  {isAsianCriteria ? 'Asian Cutoff' : 'Standard WHO'}
                </span>
              </div>
            </div>
          </div>

          {/* Color Spectrum Gauge */}
          <div className="mt-6 space-y-2">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-800">
              <div className="h-full bg-sky-500 w-[20%]" title="Underweight (<18.5)" />
              <div className="h-full bg-emerald-500 w-[30%]" title="Normal (18.5-24.9)" />
              <div className="h-full bg-amber-500 w-[25%]" title="Overweight (25-29.9)" />
              <div className="h-full bg-rose-500 w-[25%]" title="Obese (≥30)" />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>Underweight (&lt;18.5)</span>
              <span>Normal ({isAsianCriteria ? '18.5-22.9' : '18.5-24.9'})</span>
              <span>Overweight ({isAsianCriteria ? '23-27.4' : '25-29.9'})</span>
              <span>Obese (&ge;{isAsianCriteria ? '27.5' : '30'})</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-neutral-400 bg-neutral-900/40 rounded-3xl border border-neutral-800">
          Please enter valid height and weight measurements.
        </div>
      )}

      {/* Inputs Form */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
          <Scale className="w-4 h-4 text-rose-400" />
          <span>Body Measurements</span>
        </h3>

        {system === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Height (cm)</span>
                <span className="font-mono text-neutral-500 text-[11px]">{heightCm} cm</span>
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-rose-500"
              />
              <input
                type="range"
                min="100"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                <span>Weight (kg)</span>
                <span className="font-mono text-neutral-500 text-[11px]">{weightKg} kg</span>
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="65"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-rose-500"
              />
              <input
                type="range"
                min="30"
                max="180"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full accent-rose-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Height (Feet)</label>
              <input
                type="number"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                placeholder="5"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Height (Inches)</label>
              <input
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                placeholder="7"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Weight (Pounds / lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                placeholder="143"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 font-mono text-base focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
