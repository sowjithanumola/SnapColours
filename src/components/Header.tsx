import React from 'react';
import { Download, Sliders, Layers, Bookmark, HelpCircle, Share2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'generator' | 'gradients' | 'contrast';
  setActiveTab: (tab: 'generator' | 'gradients' | 'contrast') => void;
  onOpenSaved: () => void;
  onOpenExport: () => void;
  onOpenShortcuts: () => void;
  onShare: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSaved,
  onOpenExport,
  onOpenShortcuts,
  onShare,
  savedCount,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Zone 1: Single Brand Wordmark with SVG Four-Color Icon */}
      <div className="flex items-center gap-2.5 shrink-0">
        <svg className="w-6 h-6 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7.5" fill="#F43F5E" />
          <circle cx="21" cy="11" r="7.5" fill="#F59E0B" />
          <circle cx="11" cy="21" r="7.5" fill="#10B981" />
          <circle cx="21" cy="21" r="7.5" fill="#0EA5E9" />
        </svg>
        <span className="text-base font-bold tracking-tight text-zinc-100 whitespace-nowrap">
          SnapColor
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-1 md:gap-2">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'generator'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Palette</span>
        </button>

        <button
          onClick={() => setActiveTab('gradients')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'gradients'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Gradients</span>
        </button>

        <button
          onClick={() => setActiveTab('contrast')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'contrast'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <span>WCAG Contrast</span>
        </button>

        <button
          onClick={onOpenSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition-colors whitespace-nowrap"
          title="View saved palettes"
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved</span>
          {savedCount > 0 && (
            <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 text-[11px] font-mono rounded">
              {savedCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Primary Action & Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onShare}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors"
          title="Share palette URL"
          aria-label="Share palette link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors"
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-white rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
