import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import {
  ColorItem,
  isValidHex,
  normalizeHex,
  hexToRgb,
  rgbToHsl,
  hslToHex,
  getRelativeLuminance,
  getContrastRatio,
  getWcagRating,
  buildColorItem,
} from '../utils/colorUtils';

interface ColorPickerModalProps {
  colorItem: ColorItem | null;
  index: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (index: number, updatedItem: ColorItem) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  colorItem,
  index,
  isOpen,
  onClose,
  onSave,
}) => {
  const [hexInput, setHexInput] = useState<string>(colorItem?.hex || '#000000');
  const [hexError, setHexError] = useState<string | null>(null);
  const [hsl, setHsl] = useState<{ h: number; s: number; l: number }>({ h: 0, s: 0, l: 0 });

  useEffect(() => {
    if (colorItem) {
      setHexInput(colorItem.hex);
      setHexError(null);
      const rgb = hexToRgb(colorItem.hex);
      const calculatedHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHsl(calculatedHsl);
    }
  }, [colorItem]);

  // Generate 7 tints (towards white) and 7 shades (towards black)
  const tintsAndShades = React.useMemo(() => {
    const steps = [15, 25, 35, 45, 55, 65, 75, 85, 95];
    return steps.map((l) => hslToHex(hsl.h, hsl.s, l));
  }, [hsl.h, hsl.s]);

  if (!isOpen || !colorItem || index === null) return null;

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      setHexError(null);
      const normalized = normalizeHex(value);
      const rgb = hexToRgb(normalized);
      const calculatedHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHsl(calculatedHsl);
    } else {
      setHexError('Please enter a valid 3 or 6 digit hex code');
    }
  };

  const handleHslChange = (key: 'h' | 's' | 'l', value: number) => {
    const updated = { ...hsl, [key]: value };
    setHsl(updated);
    const newHex = hslToHex(updated.h, updated.s, updated.l);
    setHexInput(newHex);
    setHexError(null);
  };

  const handleApply = () => {
    if (!isValidHex(hexInput)) {
      setHexError('Invalid hex code');
      return;
    }
    const normalized = normalizeHex(hexInput);
    const updated = buildColorItem(normalized, colorItem.id, colorItem.isLocked);
    onSave(index, updated);
    onClose();
  };


  // Current contrast calculations
  const currentHex = isValidHex(hexInput) ? normalizeHex(hexInput) : colorItem.hex;
  const currentRgb = hexToRgb(currentHex);
  const currentLum = getRelativeLuminance(currentRgb.r, currentRgb.g, currentRgb.b);
  const contrastWhite = Number(getContrastRatio(currentLum, 1.0).toFixed(2));
  const contrastBlack = Number(getContrastRatio(currentLum, 0.0).toFixed(2));
  const ratingWhite = getWcagRating(contrastWhite);
  const ratingBlack = getWcagRating(contrastBlack);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: currentHex }}
              className="w-4 h-4 rounded-sm border border-zinc-700"
            />
            <h2 id="editor-title" className="text-sm font-semibold text-zinc-100">
              Edit Swatch 0{index + 1}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Visual Swatch Preview Box */}
          <div
            style={{ backgroundColor: currentHex }}
            className="w-full h-24 rounded-md border border-zinc-700/50 flex flex-col justify-end p-3 transition-colors relative"
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  color: contrastWhite >= contrastBlack ? '#FFFFFF' : '#000000',
                }}
                className="font-mono text-base font-bold drop-shadow-xs"
              >
                {currentHex}
              </span>
              <label className="cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md bg-black/30 text-white backdrop-blur-xs hover:bg-black/50 transition-colors">
                Native Picker
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Hex Input Form */}
          <div>
            <label htmlFor="hex-code-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              HEX Code
            </label>
            <div className="relative">
              <input
                id="hex-code-input"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInputChange(e.target.value)}
                maxLength={7}
                placeholder="#3B82F6"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-md text-sm font-mono text-zinc-100 focus:outline-none uppercase"
              />
            </div>
            {hexError && (
              <p className="text-xs text-rose-400 mt-1">{hexError}</p>
            )}
          </div>

          {/* HSL Sliders */}
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Hue</span>
                <span className="font-mono text-zinc-200">{hsl.h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hsl.h}
                onChange={(e) => handleHslChange('h', Number(e.target.value))}
                className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Saturation</span>
                <span className="font-mono text-zinc-200">{hsl.s}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.s}
                onChange={(e) => handleHslChange('s', Number(e.target.value))}
                className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Lightness</span>
                <span className="font-mono text-zinc-200">{hsl.l}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={hsl.l}
                onChange={(e) => handleHslChange('l', Number(e.target.value))}
                className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded"
              />
            </div>
          </div>

          {/* Tints & Shades Quick Select */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="block text-xs font-medium text-zinc-400 mb-2">
              Tints & Shades (Click to pick)
            </span>
            <div className="grid grid-cols-9 gap-1 h-8">
              {tintsAndShades.map((stepHex) => (
                <button
                  key={stepHex}
                  type="button"
                  style={{ backgroundColor: stepHex }}
                  onClick={() => handleHexInputChange(stepHex)}
                  className="w-full h-full rounded-sm hover:scale-105 active:scale-95 transition-transform border border-black/20"
                  title={`Select shade ${stepHex}`}
                />
              ))}
            </div>
          </div>

          {/* WCAG Contrast Ratings */}
          <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-md">
              <div className="text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
                <span>Vs Pure White (#FFF)</span>
                <span className={`font-mono text-xs font-bold ${ratingWhite.aaNormal ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {ratingWhite.level}
                </span>
              </div>
              <div className="font-mono text-sm font-semibold text-zinc-200">
                {contrastWhite}:1
              </div>
            </div>

            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-md">
              <div className="text-[11px] text-zinc-400 mb-1 flex items-center justify-between">
                <span>Vs Pure Black (#000)</span>
                <span className={`font-mono text-xs font-bold ${ratingBlack.aaNormal ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {ratingBlack.level}
                </span>
              </div>
              <div className="font-mono text-sm font-semibold text-zinc-200">
                {contrastBlack}:1
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!!hexError}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              hexError
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Color</span>
          </button>
        </div>
      </div>
    </div>
  );
};
