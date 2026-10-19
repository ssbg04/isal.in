import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Ruler,
  Scale,
  Maximize2,
  Box,
  Thermometer,
  Gauge,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  type UnitCategory,
  CATEGORY_UNIT_MAP,
  convertUnitToAll,
} from '../../services/unitConversionService';

const CATEGORY_TABS: { id: UnitCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'length', label: 'Length', icon: Ruler },
  { id: 'mass', label: 'Mass & Weight', icon: Scale },
  { id: 'area', label: 'Area', icon: Maximize2 },
  { id: 'volume', label: 'Volume', icon: Box },
  { id: 'temperature', label: 'Temperature', icon: Thermometer },
  { id: 'speed', label: 'Speed', icon: Gauge },
  { id: 'time', label: 'Time', icon: Clock },
];

interface UnitConverterToolProps {
  initialCategory?: UnitCategory;
  onCategoryChange?: (category: UnitCategory) => void;
}

export const UnitConverterTool: React.FC<UnitConverterToolProps> = ({
  initialCategory = 'length',
  onCategoryChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>(initialCategory);
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>(() => {
    const list = CATEGORY_UNIT_MAP[initialCategory] || [];
    return list[0]?.id || '';
  });
  const [toUnitId, setToUnitId] = useState<string>(() => {
    const list = CATEGORY_UNIT_MAP[initialCategory] || [];
    return list[1]?.id || list[0]?.id || '';
  });
  const [precision, setPrecision] = useState<number>(4);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const units = useMemo(() => CATEGORY_UNIT_MAP[activeCategory] || [], [activeCategory]);

  const handleCategoryChange = (cat: UnitCategory) => {
    setActiveCategory(cat);
    const newUnits = CATEGORY_UNIT_MAP[cat] || [];
    if (newUnits.length > 0) {
      setFromUnitId(newUnits[0].id);
      setToUnitId(newUnits[1] ? newUnits[1].id : newUnits[0].id);
    }
    onCategoryChange?.(cat);
  };

  const numValue = useMemo(() => {
    const parsed = parseFloat(inputValue);
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  // All conversions
  const allConversions = useMemo(() => {
    return convertUnitToAll(activeCategory, numValue, fromUnitId, precision);
  }, [activeCategory, numValue, fromUnitId, precision]);

  // Specific direct conversion
  const directTarget = useMemo(() => {
    return allConversions.find((item) => item.id === toUnitId) || allConversions[0];
  }, [allConversions, toUnitId]);

  const fromUnitDef = useMemo(() => {
    return units.find((u) => u.id === fromUnitId) || units[0];
  }, [units, fromUnitId]);

  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200 dark:border-neutral-800">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500 text-neutral-950 font-semibold shadow-sm shadow-sky-500/25'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Converter Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 shadow-inner">
        {/* Input Column */}
        <div className="md:col-span-5 space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Input Value & Unit</span>
            <span className="text-[11px] text-neutral-500 lowercase">from</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="0"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-neutral-100 text-lg font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-200 text-sm font-medium focus:outline-none focus:border-sky-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol} — {u.name}
                </option>
              ))}
            </select>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-500">Presets:</span>
            {[1, 5, 10, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setInputValue(val.toString())}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-2 flex justify-center py-2 md:py-0">
          <button
            type="button"
            onClick={handleSwapUnits}
            title="Swap Units"
            className="p-3 rounded-xl bg-neutral-800/90 hover:bg-sky-500 hover:text-neutral-950 text-neutral-300 transition-all border border-neutral-700/60 shadow-sm active:scale-95"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Target Output Column */}
        <div className="md:col-span-5 space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Converted Target</span>
            <span className="text-[11px] text-neutral-500 lowercase">to</span>
          </label>
          <div className="flex gap-2">
            <div className="relative w-full">
              <input
                type="text"
                readOnly
                value={directTarget ? directTarget.formatted : '0'}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sky-400 text-lg font-mono font-semibold select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => directTarget && handleCopy(directTarget.formatted, 'direct')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
                title="Copy result"
              >
                {copiedId === 'direct' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-neutral-200 text-sm font-medium focus:outline-none focus:border-sky-500"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol} — {u.name}
                </option>
              ))}
            </select>
          </div>
          {/* Direct summary */}
          <div className="text-[11px] text-neutral-400 truncate pt-1">
            {numValue} {fromUnitDef?.symbol} = <span className="text-sky-400 font-semibold">{directTarget?.formatted}</span> {directTarget?.symbol}
          </div>
        </div>
      </div>

      {/* Precision Controls */}
      <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Real-time all-units matrix below</span>
        </span>
        <div className="flex items-center gap-2">
          <span>Decimals:</span>
          {[2, 4, 6].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrecision(p)}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                precision === p ? 'bg-sky-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* All Units Comparison Matrix Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          All Equivalent Values ({allConversions.length} units)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allConversions.map((item) => {
            const isSource = item.id === fromUnitId;
            const isTarget = item.id === toUnitId;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isSource
                    ? 'bg-sky-950/20 border-sky-500/40 shadow-sm shadow-sky-500/10'
                    : isTarget
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-neutral-900/40 border-neutral-800/70 hover:border-neutral-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-neutral-200 truncate">{item.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">
                      {item.symbol}
                    </span>
                    {isSource && (
                      <span className="text-[10px] text-sky-400 font-medium px-1 rounded bg-sky-900/50">source</span>
                    )}
                    {isTarget && (
                      <span className="text-[10px] text-amber-400 font-medium px-1 rounded bg-amber-900/50">target</span>
                    )}
                  </div>
                  <div className="text-sm font-mono font-medium text-neutral-100 truncate mt-1">
                    {item.formatted}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.formatted, item.id)}
                  title="Copy value"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors shrink-0"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
