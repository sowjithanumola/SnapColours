import React from 'react';
import { Lock, Unlock, Copy, Edit2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ColorItem, DisplayFormat, getWcagRating } from '../utils/colorUtils';

interface PaletteCanvasProps {
  palette: ColorItem[];
  displayFormat: DisplayFormat;
  copiedId: string | null;
  onToggleLock: (index: number) => void;
  onOpenColorEditor: (index: number) => void;
  onCopyColor: (item: ColorItem) => void;
  onMoveColor: (fromIndex: number, toIndex: number) => void;
}

export const PaletteCanvas: React.FC<PaletteCanvasProps> = ({
  palette,
  displayFormat,
  copiedId,
  onToggleLock,
  onOpenColorEditor,
  onCopyColor,
  onMoveColor,
}) => {
  const getDisplayValue = (item: ColorItem) => {
    switch (displayFormat) {
      case 'rgb':
        return item.rgb;
      case 'hsl':
        return item.hsl;
      case 'hex':
      default:
        return item.hex;
    }
  };

  return (
    <main
      className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden select-none bg-zinc-950"
      aria-label="Color Palette Generator"
    >
      {palette.map((item, index) => {
        const rating = getWcagRating(
          item.textColor === '#FFFFFF' ? item.contrastWithWhite : item.contrastWithBlack
        );
        const displayValue = getDisplayValue(item);
        const isCopied = copiedId === item.id;

        return (
          <section
            key={item.id}
            style={{ backgroundColor: item.hex, color: item.textColor }}
            className="group relative flex-1 flex flex-row md:flex-col justify-between items-center p-4 md:p-6 transition-colors duration-150 ease-out border-b md:border-b-0 md:border-r border-black/10 last:border-none focus-within:z-10"
            aria-label={`Color swatch ${index + 1}: ${item.name}, ${item.hex}`}
          >
            {/* Top Bar: Index & WCAG Badge */}
            <div className="w-full flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider opacity-60">
                  0{index + 1}
                </span>
                {item.isLocked && (
                  <span
                    className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/20 backdrop-blur-xs font-medium"
                    title="Color is locked from generation"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </span>
                )}
              </div>

              {/* WCAG Contrast Metric */}
              <div
                className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-black/15 backdrop-blur-xs opacity-75 group-hover:opacity-100 transition-opacity"
                title={`WCAG Contrast: ${
                  item.textColor === '#FFFFFF' ? item.contrastWithWhite : item.contrastWithBlack
                }:1 with ${item.textColor === '#FFFFFF' ? 'White' : 'Black'} text`}
              >
                <span>{rating.level}</span>
                <span className="ml-1 opacity-70">
                  {item.textColor === '#FFFFFF' ? item.contrastWithWhite : item.contrastWithBlack}:1
                </span>
              </div>
            </div>

            {/* Middle Bar: Interactive Action Controls */}
            <div className="my-auto flex flex-row md:flex-col items-center gap-2 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-150 pointer-events-auto">
              {/* Lock/Unlock Toggle */}
              <button
                onClick={() => onToggleLock(index)}
                className="relative p-2.5 rounded-md bg-black/20 hover:bg-black/35 backdrop-blur-md transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                title={`${item.isLocked ? 'Unlock color' : 'Lock color'} (Shortcut: ${index + 1})`}
                aria-label={`${item.isLocked ? 'Unlock color' : 'Lock color'} swatch ${index + 1}`}
              >
                {item.isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4 opacity-75" />
                )}
                <span className="sr-only">Key {index + 1}</span>
              </button>

              {/* Manual Color Editor & Picker */}
              <button
                onClick={() => onOpenColorEditor(index)}
                className="p-2.5 rounded-md bg-black/20 hover:bg-black/35 backdrop-blur-md transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                title="Edit color value and shades"
                aria-label={`Edit color swatch ${index + 1}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Quick Copy */}
              <button
                onClick={() => onCopyColor(item)}
                className="p-2.5 rounded-md bg-black/20 hover:bg-black/35 backdrop-blur-md transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
                title={`Copy ${displayValue}`}
                aria-label={`Copy color code for swatch ${index + 1}`}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Reorder Buttons (Move Left/Right) */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  disabled={index === 0}
                  onClick={() => onMoveColor(index, index - 1)}
                  className={`p-1.5 rounded-md bg-black/20 hover:bg-black/35 backdrop-blur-md transition-all active:scale-95 ${
                    index === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100'
                  }`}
                  title="Move swatch left"
                  aria-label={`Move swatch ${index + 1} left`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === palette.length - 1}
                  onClick={() => onMoveColor(index, index + 1)}
                  className={`p-1.5 rounded-md bg-black/20 hover:bg-black/35 backdrop-blur-md transition-all active:scale-95 ${
                    index === palette.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  title="Move swatch right"
                  aria-label={`Move swatch ${index + 1} right`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Bar: Color Values & Copy Button */}
            <div className="w-full flex flex-col md:items-center text-left md:text-center pointer-events-auto">
              <button
                onClick={() => onCopyColor(item)}
                className="text-left md:text-center group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-md p-1 -m-1 transition-transform active:scale-98"
                title={`Click to copy ${displayValue}`}
              >
                <div className="font-mono font-bold tracking-tight text-lg md:text-xl tabular-nums leading-tight">
                  {displayValue}
                </div>
                <div className="text-xs font-medium opacity-75 mt-0.5 tracking-wide">
                  {item.name}
                </div>
              </button>
            </div>
          </section>
        );
      })}
    </main>
  );
};
