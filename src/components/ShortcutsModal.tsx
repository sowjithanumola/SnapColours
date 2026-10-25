import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Generate new palette (retains locked colors)' },
    { key: '1 - 5', desc: 'Toggle lock on color swatches 1 through 5' },
    { key: 'C', desc: 'Copy current palette hex codes to clipboard' },
    { key: 'S', desc: 'Save current palette to favorites' },
    { key: 'E', desc: 'Open export modal (CSS, SCSS, Tailwind, JSON, PNG)' },
    { key: 'G', desc: 'Open CSS Gradient studio' },
    { key: 'Ctrl + Z', desc: 'Undo palette generation' },
    { key: 'Ctrl + Y', desc: 'Redo palette generation' },
    { key: '?', desc: 'Toggle this keyboard shortcut guide' },
    { key: 'Esc', desc: 'Close open dialogs or return to canvas' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-emerald-400" />
            <h2 id="shortcuts-title" className="text-sm font-semibold text-zinc-100">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close shortcuts guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 divide-y divide-zinc-800/80">
          {shortcuts.map((item) => (
            <div key={item.key} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <span className="text-zinc-300">{item.desc}</span>
              <kbd className="px-2 py-1 font-mono text-[11px] font-semibold text-zinc-200 bg-zinc-950 border border-zinc-700 rounded shadow-xs whitespace-nowrap ml-4">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">Fast workflow for high-volume color iteration</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
