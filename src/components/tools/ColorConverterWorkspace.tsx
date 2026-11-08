import React, { useState } from 'react';
import { Palette, Copy, Check } from 'lucide-react';
import { parseColor, type ColorFormats } from '../../services/conversionService';

interface ColorConverterWorkspaceProps {
  onHistoryAdd?: (summary: string) => void;
}

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Slate', hex: '#475569' },
];

export const ColorConverterWorkspace: React.FC<ColorConverterWorkspaceProps> = ({ onHistoryAdd }) => {
  const [colorInput, setColorInput] = useState<string>('#F59E0B');
  const [colorData, setColorData] = useState<ColorFormats | null>(() => parseColor('#F59E0B'));
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleColorChange = (newVal: string) => {
    setColorInput(newVal);
    const parsed = parseColor(newVal);
    if (parsed) {
      setColorData(parsed);
      onHistoryAdd?.(`Color: ${parsed.hex}`);
    }
  };

  const copyColor = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  return (
    <div className="mt-5 space-y-5">
      {/* Visual Swatch & Native Color Picker */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60">
        <div className="relative group shrink-0">
          <button
            type="button"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border-2 border-white dark:border-neutral-800 transition-transform group-hover:scale-105 cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-500"
            style={{ backgroundColor: colorData?.hex || '#F59E0B' }}
            onClick={() => document.getElementById('native-color-picker')?.click()}
            aria-label="Open native visual color picker"
          >
            <Palette className="w-6 h-6 text-white drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity" />
          </button>
          <input
            id="native-color-picker"
            type="color"
            value={colorData?.hex || '#F59E0B'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2 flex-1 w-full text-center sm:text-left">
          <label htmlFor="color-text-input" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Color Input (HEX, RGB, or HSL)
          </label>
          <input
            id="color-text-input"
            type="text"
            value={colorInput}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="e.g. #F59E0B, rgb(245, 158, 11), or hsl(38, 92%, 50%)"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Click the color swatch to open the visual picker, or type any color code.
          </p>
        </div>
      </div>

      {/* Quick Palette Presets */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
          Quick Presets
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => handleColorChange(preset.hex)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: preset.hex }} />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Converted Format Grid */}
      {colorData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { label: 'HEX', val: colorData.hex },
            { label: 'RGB', val: colorData.rgb },
            { label: 'HSL', val: colorData.hsl },
            { label: 'CMYK', val: colorData.cmyk },
          ].map((fmt) => (
            <div
              key={fmt.label}
              className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {fmt.label}
                </span>
                <p className="font-mono text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {fmt.val}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyColor(fmt.val, fmt.label)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label={`Copy ${fmt.label} value`}
              >
                {copiedFormat === fmt.label ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
