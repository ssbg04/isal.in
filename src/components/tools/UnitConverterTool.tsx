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
  ClipboardPaste,
  X,
  History,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
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

const COMMON_PAIRS: Record<UnitCategory, { label: string; from: string; to: string }[]> = {
  length: [
    { label: 'cm ⇄ ft', from: 'cm', to: 'ft' },
    { label: 'm ⇄ ft', from: 'm', to: 'ft' },
    { label: 'in ⇄ cm', from: 'in', to: 'cm' },
    { label: 'km ⇄ mi', from: 'km', to: 'mi' },
  ],
  mass: [
    { label: 'kg ⇄ lbs', from: 'kg', to: 'lb' },
    { label: 'g ⇄ oz', from: 'g', to: 'oz' },
    { label: 'lbs ⇄ kg', from: 'lb', to: 'kg' },
    { label: 'kg ⇄ st', from: 'kg', to: 'st' },
  ],
  temperature: [
    { label: '°C ⇄ °F', from: 'c', to: 'f' },
    { label: '°F ⇄ °C', from: 'f', to: 'c' },
    { label: '°C ⇄ K', from: 'c', to: 'k' },
  ],
  speed: [
    { label: 'km/h ⇄ mph', from: 'kmh', to: 'mph' },
    { label: 'mph ⇄ km/h', from: 'mph', to: 'kmh' },
    { label: 'm/s ⇄ km/h', from: 'ms', to: 'kmh' },
    { label: 'knots ⇄ km/h', from: 'kn', to: 'kmh' },
  ],
  area: [
    { label: 'm² ⇄ ft²', from: 'sqm', to: 'sqft' },
    { label: 'ha ⇄ acre', from: 'ha', to: 'ac' },
    { label: 'km² ⇄ mi²', from: 'sqkm', to: 'sqmi' },
  ],
  volume: [
    { label: 'L ⇄ gal', from: 'l', to: 'gal_us' },
    { label: 'mL ⇄ fl oz', from: 'ml', to: 'floz_us' },
    { label: 'cups ⇄ mL', from: 'cup_us', to: 'ml' },
    { label: 'm³ ⇄ L', from: 'cum', to: 'l' },
  ],
  time: [
    { label: 'hours ⇄ min', from: 'h', to: 'min' },
    { label: 'days ⇄ hours', from: 'd', to: 'h' },
    { label: 'min ⇄ sec', from: 'min', to: 's' },
    { label: 'weeks ⇄ days', from: 'wk', to: 'd' },
  ],
};

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
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [showCompareAll, setShowCompareAll] = useState<boolean>(true);
  const [recentPairs, setRecentPairs] = useState<{ category: UnitCategory; from: string; to: string; label: string }[]>(() => {
    try {
      const saved = localStorage.getItem('mc_recent_unit_pairs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // Save pair to recents when user changes units
  const recordRecentPair = (cat: UnitCategory, from: string, to: string) => {
    const fromDef = units.find((u) => u.id === from);
    const toDef = units.find((u) => u.id === to);
    if (!fromDef || !toDef) return;
    const label = `${fromDef.symbol} ⇄ ${toDef.symbol}`;
    setRecentPairs((prev) => {
      const filtered = prev.filter((p) => !(p.from === from && p.to === to && p.category === cat));
      const updated = [{ category: cat, from, to, label }, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('mc_recent_unit_pairs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSwapUnits = () => {
    setIsSwapping((prev) => !prev);
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
    recordRecentPair(activeCategory, toUnitId, temp);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const num = parseFloat(text.replace(/,/g, '').trim());
      if (!isNaN(num)) {
        setInputValue(num.toString());
      }
    } catch {}
  };

  const applyPair = (from: string, to: string) => {
    setFromUnitId(from);
    setToUnitId(to);
    recordRecentPair(activeCategory, from, to);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-neutral-200 dark:border-neutral-800">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                isActive
                  ? 'bg-sky-500 text-neutral-950 shadow-sm shadow-sky-500/25'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick-Pair Preset Chips & Recents */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
            Popular Pairs:
          </span>
          {(COMMON_PAIRS[activeCategory] || []).map((pair) => {
            const isMatch = fromUnitId === pair.from && toUnitId === pair.to;
            return (
              <button
                key={pair.label}
                type="button"
                onClick={() => applyPair(pair.from, pair.to)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition cursor-pointer border focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
                  isMatch
                    ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-xs'
                    : 'glass-panel border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:border-sky-500/40 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
              >
                {pair.label}
              </button>
            );
          })}
        </div>

        {recentPairs.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span>Recent:</span>
            {recentPairs.slice(0, 3).map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (activeCategory !== r.category) {
                    handleCategoryChange(r.category);
                  }
                  setTimeout(() => applyPair(r.from, r.to), 20);
                }}
                className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/10 text-neutral-700 dark:text-neutral-300 transition cursor-pointer border border-neutral-200/60 dark:border-white/5"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Dual-Panel Interactive Converter with Straddling Swap Button */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {/* 1. INPUT PANEL ("From") — Elevated Surface (Philippine Royal Blue Accent) */}
        <div className="p-5 sm:p-6 rounded-2xl glass-card border border-neutral-300/90 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/70 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px] text-blue-700 dark:text-blue-400 font-bold">
                <span>Input Value ("From")</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition text-[11px] font-medium cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    title="Clear input"
                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Input row */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0"
                  aria-label="Value to convert"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-neutral-950 dark:text-white text-xl sm:text-2xl font-mono tabular-nums font-semibold outline-none focus:border-blue-600"
                />
              </div>

              {/* Unit Selector */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Select Base Unit:
                </label>
                <select
                  value={fromUnitId}
                  onChange={(e) => {
                    setFromUnitId(e.target.value);
                    recordRecentPair(activeCategory, e.target.value, toUnitId);
                  }}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 text-sm font-semibold outline-none focus:border-blue-600 cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick value presets */}
          <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-neutral-200/60 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="text-[11px] font-medium">Quick values:</span>
            {[1, 5, 10, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setInputValue(val.toString())}
                className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Straddling Swap Button (Overlapping Horizontally on Desktop, Vertically on Mobile) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={handleSwapUnits}
            title="Swap input and output units"
            aria-label="Swap units"
            className="w-11 h-11 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 dark:hover:bg-amber-500 dark:hover:text-neutral-950 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <ArrowRightLeft
              className="w-5 h-5 transition-transform duration-300"
              style={{ transform: isSwapping ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>

        {/* 2. OUTPUT PANEL ("To") — Philippine Golden Sun Amber Surface */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 dark:border-amber-500/30 shadow-inner flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                <span>Converted Output ("To")</span>
              </span>
              <button
                type="button"
                onClick={() => directTarget && handleCopy(directTarget.formatted, 'direct')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
              >
                {copiedId === 'direct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'direct' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Readout Output Display */}
            <div className="space-y-3">
              <div
                onClick={() => directTarget && handleCopy(directTarget.formatted, 'direct')}
                title="Click to copy result"
                className="w-full bg-white/80 dark:bg-neutral-950/80 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-700 dark:text-amber-300 text-2xl sm:text-3xl font-mono tabular-nums font-extrabold select-all flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-neutral-950 transition"
              >
                <span className="truncate">{directTarget ? directTarget.formatted : '0'}</span>
                <span className="text-sm font-sans font-bold text-amber-600 dark:text-amber-400 shrink-0 pl-2">
                  {directTarget?.symbol}
                </span>
              </div>

              {/* Target Unit Selector */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Select Target Unit:
                </label>
                <select
                  value={toUnitId}
                  onChange={(e) => {
                    setToUnitId(e.target.value);
                    recordRecentPair(activeCategory, fromUnitId, e.target.value);
                  }}
                  className="w-full bg-white/90 dark:bg-neutral-900 border border-amber-500/30 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 text-sm font-semibold outline-none focus:border-amber-500 cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Equation summary */}
          <div className="pt-4 mt-4 border-t border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span className="font-mono text-[11px] truncate">
              {numValue} {fromUnitDef?.symbol} ={' '}
              <strong className="text-amber-700 dark:text-amber-300 font-bold">{directTarget?.formatted}</strong>{' '}
              {directTarget?.symbol}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">1:1 Direct</span>
          </div>
        </div>
      </div>

      {/* Decimal Precision Bar & 1-to-Many "Compare All" Pin Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-neutral-600 dark:text-neutral-400">
        <button
          type="button"
          onClick={() => setShowCompareAll((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-neutral-300 dark:border-white/10 hover:border-sky-500/50 text-neutral-800 dark:text-neutral-200 font-semibold cursor-pointer transition"
        >
          <Grid3X3 className="w-3.5 h-3.5 text-sky-500" />
          <span>Compare All Units ({allConversions.length})</span>
          {showCompareAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="font-medium">Decimals:</span>
          {[2, 4, 6].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrecision(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                precision === p
                  ? 'bg-sky-500 text-neutral-950 font-bold shadow-2xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 1-to-Many Equivalent Grid (Expanded by Default) */}
      {showCompareAll && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Multi-Unit Comparison Matrix</span>
            </h4>
            <span className="text-[11px] text-neutral-500 font-mono">
              Base: {numValue} {fromUnitDef?.symbol}
            </span>
          </div>

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
                      ? 'bg-blue-600/10 border-blue-600/40 shadow-xs'
                      : isTarget
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-xs'
                      : 'glass-card border-neutral-200 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {item.symbol}
                      </span>
                      {isSource && (
                        <span className="text-[9px] text-blue-700 dark:text-blue-300 font-bold px-1 rounded bg-blue-600/20 uppercase">
                          input
                        </span>
                      )}
                      {isTarget && (
                        <span className="text-[9px] text-amber-700 dark:text-amber-300 font-bold px-1 rounded bg-amber-500/20 uppercase">
                          target
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-mono font-bold text-neutral-950 dark:text-neutral-100 tabular-nums truncate mt-1 select-all">
                      {item.formatted}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.formatted, item.id)}
                    title={`Copy ${item.formatted}`}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer shrink-0"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contextual Trust & Status Footer */}
      <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>100% Client-Side Engine • Zero Server Latency</span>
        </div>
        <div className="font-mono text-[10px]">
          IEEE 754 High-Precision Math
        </div>
      </div>
    </div>
  );
};
