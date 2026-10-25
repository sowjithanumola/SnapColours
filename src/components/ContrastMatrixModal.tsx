import React from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  ColorItem,
  getContrastRatio,
  getWcagRating,
} from '../utils/colorUtils';

interface ContrastMatrixModalProps {
  palette: ColorItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ContrastMatrixModal: React.FC<ContrastMatrixModalProps> = ({
  palette,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contrast-matrix-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 id="contrast-matrix-title" className="text-sm font-semibold text-zinc-100">
              WCAG 2.1 Contrast Matrix & Accessibility Analysis
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Normal text requires 4.5:1 (AA) or 7:1 (AAA). Large text requires 3:1 (AA Large).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close contrast matrix"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Swatch Benchmark against Pure Black and White */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Color Benchmark vs Standard Neutrals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {palette.map((item, idx) => {
                const whiteRating = getWcagRating(item.contrastWithWhite);
                const blackRating = getWcagRating(item.contrastWithBlack);

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div
                          style={{ backgroundColor: item.hex }}
                          className="w-3.5 h-3.5 rounded-sm border border-zinc-700"
                        />
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          0{idx + 1} {item.hex}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mb-2">
                        {item.name}
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono border-t border-zinc-900 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">vs White:</span>
                        <span
                          className={`font-semibold ${
                            whiteRating.aaNormal ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {item.contrastWithWhite}:1 ({whiteRating.level})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">vs Black:</span>
                        <span
                          className={`font-semibold ${
                            blackRating.aaNormal ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {item.contrastWithBlack}:1 ({blackRating.level})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5x5 Pairwise Matrix */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Palette Inter-Color Contrast Grid
            </h3>
            <div className="overflow-x-auto border border-zinc-800 rounded-md">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800">
                    <th className="p-2 text-zinc-500 font-mono">Bg \ Text</th>
                    {palette.map((col, idx) => (
                      <th key={col.id} className="p-2 text-center font-mono">
                        <div className="flex items-center justify-center gap-1">
                          <div
                            style={{ backgroundColor: col.hex }}
                            className="w-2.5 h-2.5 rounded-xs"
                          />
                          <span className="text-zinc-300">0{idx + 1}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {palette.map((bgItem, rIdx) => (
                    <tr key={bgItem.id} className="border-b border-zinc-800/60 bg-zinc-950/40">
                      <td className="p-2 font-mono text-zinc-300 bg-zinc-950 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div
                            style={{ backgroundColor: bgItem.hex }}
                            className="w-2.5 h-2.5 rounded-xs"
                          />
                          <span>0{rIdx + 1} {bgItem.hex}</span>
                        </div>
                      </td>
                      {palette.map((textItem, cIdx) => {
                        if (rIdx === cIdx) {
                          return (
                            <td key={textItem.id} className="p-2 text-center text-zinc-600 font-mono bg-zinc-900/40">
                              -
                            </td>
                          );
                        }

                        const ratio = Number(
                          getContrastRatio(bgItem.luminance, textItem.luminance).toFixed(2)
                        );
                        const rating = getWcagRating(ratio);

                        return (
                          <td
                            key={textItem.id}
                            style={{ backgroundColor: bgItem.hex, color: textItem.hex }}
                            className="p-2 text-center font-mono font-medium transition-colors"
                          >
                            <div className="font-bold">{ratio}:1</div>
                            <div className="text-[10px] opacity-80">{rating.level}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive UI Mockup Simulation */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Real-World Interface Preview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Primary Swatch Base */}
              <div
                style={{
                  backgroundColor: palette[0].hex,
                  color: palette[0].textColor,
                }}
                className="p-5 rounded-md border border-white/10 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      backgroundColor: palette[1].hex,
                      color: palette[1].textColor,
                    }}
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
                  >
                    FEATURED
                  </span>
                  <span className="text-xs opacity-75">Production Preview</span>
                </div>
                <h4 className="text-lg font-bold">Accessible UI Component Design</h4>
                <p className="text-xs opacity-85 leading-relaxed">
                  Testing how elements visually interact in real application layouts. The card background uses Swatch 1 ({palette[0].hex}) with automated high-contrast text.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    style={{
                      backgroundColor: palette[2].hex,
                      color: palette[2].textColor,
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-xs"
                  >
                    Primary Action
                  </button>
                  <button
                    style={{
                      backgroundColor: palette[3].hex,
                      color: palette[3].textColor,
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-md shadow-xs"
                  >
                    Secondary
                  </button>
                </div>
              </div>

              {/* Card 2: Inverted Swatch Base */}
              <div
                style={{
                  backgroundColor: palette[4].hex,
                  color: palette[4].textColor,
                }}
                className="p-5 rounded-md border border-black/10 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      backgroundColor: palette[3].hex,
                      color: palette[3].textColor,
                    }}
                    className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded"
                  >
                    METRIC
                  </span>
                  <span className="text-xs opacity-75">Complementary Flow</span>
                </div>
                <h4 className="text-lg font-bold">Reading Legibility Audit</h4>
                <p className="text-xs opacity-85 leading-relaxed">
                  Swatch 5 ({palette[4].hex}) acts as the anchor field. Visual hierarchy remains balanced across both dark and light value steps.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    style={{
                      backgroundColor: palette[1].hex,
                      color: palette[1].textColor,
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-md shadow-xs"
                  >
                    Explore Theme
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Computed using WCAG 2.1 relative luminance formulas</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
