import React, { useState, useEffect } from 'react';
import { X, Bookmark, Check } from 'lucide-react';
import { ColorItem, HarmonyMode } from '../utils/colorUtils';
import { savePaletteToStorage } from '../utils/storageUtils';

interface SavePaletteModalProps {
  palette: ColorItem[];
  harmonyMode: HarmonyMode;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (name: string) => void;
}

export const SavePaletteModal: React.FC<SavePaletteModalProps> = ({
  palette,
  harmonyMode,
  isOpen,
  onClose,
  onSaved,
}) => {
  const defaultName = `${palette[0]?.name || 'Palette'} & ${palette[2]?.name || palette[1]?.name || 'Tones'}`;
  const [name, setName] = useState<string>(defaultName);

  useEffect(() => {
    setName(`${palette[0]?.name || 'Palette'} & ${palette[2]?.name || palette[1]?.name || 'Tones'}`);
  }, [palette]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'My Custom Palette';
    const hexColors = palette.map((c) => c.hex);
    savePaletteToStorage(finalName, hexColors, harmonyMode);
    onSaved(finalName);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-palette-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <h2 id="save-palette-title" className="text-sm font-semibold text-zinc-100">
              Save to Favorites
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close save dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* 5-Color Mini Strip */}
          <div className="flex h-12 w-full rounded-md overflow-hidden border border-zinc-800 shadow-sm">
            {palette.map((item) => (
              <div
                key={item.id}
                style={{ backgroundColor: item.hex }}
                className="flex-1"
                title={`${item.name} (${item.hex})`}
              />
            ))}
          </div>

          <div>
            <label htmlFor="palette-name-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Palette Name
            </label>
            <input
              id="palette-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nordic Twilight"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded-md text-sm text-zinc-100 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Algorithm: <strong className="text-zinc-200 capitalize">{harmonyMode}</strong></span>
            <span>Saved in LocalStorage</span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-zinc-950 rounded-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Palette</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
