import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, ChevronDown, X, Clock } from 'lucide-react';

export interface UnitOption {
  id: string;
  name: string;
  symbol: string;
}

interface SearchableUnitSelectProps {
  value: string;
  options: UnitOption[];
  onChange: (value: string) => void;
  recentUnitIds?: string[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export const SearchableUnitSelect: React.FC<SearchableUnitSelectProps> = ({
  value,
  options,
  onChange,
  recentUnitIds = [],
  placeholder = 'Search unit or symbol...',
  ariaLabel = 'Select unit',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedUnit = useMemo(() => {
    return options.find((u) => u.id === value) || options[0];
  }, [options, value]);

  // Filtered unit options
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        opt.symbol.toLowerCase().includes(q) ||
        opt.id.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  // Recent options that exist in current options list
  const recentOptions = useMemo(() => {
    if (!recentUnitIds || recentUnitIds.length === 0) return [];
    return recentUnitIds
      .map((id) => options.find((o) => o.id === id))
      .filter((opt): opt is UnitOption => opt !== undefined)
      .slice(0, 4);
  }, [recentUnitIds, options]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Auto focus input on open and reset highlight
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLButtonElement>('[data-unit-item]');
      const activeEl = items[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (unitId: string) => {
    onChange(unitId);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].id);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-neutral-50 dark:bg-[#11131a] border border-neutral-300 dark:border-white/10 hover:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-neutral-100 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer transition flex items-center justify-between gap-2 shadow-xs group"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
            {selectedUnit ? selectedUnit.symbol : '—'}
          </span>
          <span className="truncate text-xs sm:text-sm font-medium">
            {selectedUnit ? selectedUnit.name : 'Select Unit'}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 group-hover:text-amber-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#12141c] border border-neutral-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          {/* Top Search Input */}
          <div className="p-2.5 border-b border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-[#0c0e15]/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setHighlightedIndex(0);
                  searchInputRef.current?.focus();
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Recent Chips (Only shown when not actively filtering) */}
          {!searchQuery && recentOptions.length > 0 && (
            <div className="px-3 pt-2 pb-1.5 border-b border-neutral-200/60 dark:border-white/5 bg-neutral-100/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-500 mb-1.5">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Recent</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-medium border transition cursor-pointer ${
                      opt.id === value
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-white dark:bg-[#171a24] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-white/10 hover:border-amber-500/30 hover:text-amber-600 dark:hover:text-amber-300'
                    }`}
                  >
                    {opt.symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Units Scrollable List */}
          <div
            ref={listRef}
            className="max-h-60 sm:max-h-64 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                No units match "<span className="text-neutral-300 font-medium">{searchQuery}</span>"
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.id === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={opt.id}
                    data-unit-item
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold'
                        : isHighlighted
                        ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded font-mono text-xs font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                        {opt.symbol}
                      </span>
                      <span className="truncate">{opt.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
