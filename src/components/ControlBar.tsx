import React from 'react';
import { Shuffle, Bookmark, Undo2, Redo2, Shield, FileText } from 'lucide-react';
import { HarmonyMode, DisplayFormat } from '../utils/colorUtils';

interface ControlBarProps {
  harmonyMode: HarmonyMode;
  setHarmonyMode: (mode: HarmonyMode) => void;
  displayFormat: DisplayFormat;
  setDisplayFormat: (format: DisplayFormat) => void;
  onGenerate: () => void;
  onSaveCurrent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  harmonyMode,
  setHarmonyMode,
  displayFormat,
  setDisplayFormat,
  onGenerate,
  onSaveCurrent,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer className="h-16 md:h-14 border-t border-zinc-800 bg-zinc-950 px-4 md:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 select-none">
      {/* Left: History & Harmony Selector */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Undo generation (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo ? 'text-zinc-300 hover:text-white hover:bg-zinc-800' : 'text-zinc-600 cursor-not-allowed'
            }`}
            title="Redo generation (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Harmony Mode Dropdown */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="harmony-select" className="text-xs text-zinc-400 hidden lg:inline">
            Harmony:
          </label>
          <select
            id="harmony-select"
            value={harmonyMode}
            onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            <option value="random">Random Balance</option>
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="monochromatic">Monochromatic</option>
          </select>
        </div>

        {/* Display Format Segmented Control */}
        <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5">
          {(['hex', 'rgb', 'hsl'] as DisplayFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setDisplayFormat(fmt)}
              className={`px-2 py-1 text-[11px] font-mono font-medium rounded transition-colors uppercase ${
                displayFormat === fmt
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Primary Generate Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-md transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          title="Press Spacebar anytime to generate new unlocked colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Generate</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald-500/30 text-emerald-950 rounded border border-emerald-600/30">
            Space
          </kbd>
        </button>

        <button
          onClick={onSaveCurrent}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          title="Save palette to favorites (S)"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Right: Legal & Metadata Links (Launch Checklist Compliant) */}
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <button
          onClick={onOpenPrivacy}
          className="hover:text-zinc-300 transition-colors flex items-center gap-1"
        >
          <Shield className="w-3 h-3" />
          <span>Privacy</span>
        </button>
        <span aria-hidden="true" className="text-zinc-700">·</span>
        <button
          onClick={onOpenTerms}
          className="hover:text-zinc-300 transition-colors flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          <span>Terms</span>
        </button>
      </div>
    </footer>
  );
};
