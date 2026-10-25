import React, { useState } from 'react';
import { X, Copy, Check, Sliders, Maximize2, Minimize2 } from 'lucide-react';
import { ColorItem } from '../utils/colorUtils';

interface GradientStudioModalProps {
  palette: ColorItem[];
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type GradientType = 'linear' | 'radial' | 'conic';

export const GradientStudioModal: React.FC<GradientStudioModalProps> = ({
  palette,
  isOpen,
  onClose,
  onToast,
}) => {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState<number>(90);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1, 2, 3, 4]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleIndex = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      if (selectedIndices.length <= 2) {
        onToast('Gradient requires at least 2 color stops');
        return;
      }
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx].sort((a, b) => a - b));
    }
  };

  const activeColors = selectedIndices.map((i) => palette[i].hex);

  // Generate CSS string
  const getCssString = (): string => {
    const stops = activeColors.join(', ');
    if (type === 'linear') {
      return `background: linear-gradient(${angle}deg, ${stops});`;
    } else if (type === 'radial') {
      return `background: radial-gradient(circle, ${stops});`;
    } else {
      return `background: conic-gradient(from ${angle}deg, ${stops});`;
    }
  };

  const getPreviewStyle = (): React.CSSProperties => {
    const stops = activeColors.join(', ');
    if (type === 'linear') {
      return { background: `linear-gradient(${angle}deg, ${stops})` };
    } else if (type === 'radial') {
      return { background: `radial-gradient(circle, ${stops})` };
    } else {
      return { background: `conic-gradient(from ${angle}deg, ${stops})` };
    }
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(getCssString());
    setCopied(true);
    onToast('Gradient CSS copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gradient-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
    >
      <div
        className={`w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col transition-all ${
          isFullscreen ? 'h-full max-w-none' : 'max-w-3xl max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 id="gradient-title" className="text-sm font-semibold text-zinc-100">
              CSS Gradient Studio
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              aria-label="Close gradient studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto">
          {/* Live Gradient Preview Canvas */}
          <div
            style={getPreviewStyle()}
            className="w-full min-h-[220px] flex-1 rounded-md border border-zinc-800 shadow-inner flex items-end justify-end p-4 transition-all"
          >
            <button
              onClick={handleCopyCss}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-black/50 text-white backdrop-blur-md hover:bg-black/70 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy CSS'}</span>
            </button>
          </div>

          {/* Controls Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 bg-zinc-950 p-4 border border-zinc-800 rounded-md">
            {/* Type Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Gradient Type
              </label>
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1">
                {(['linear', 'radial', 'conic'] as GradientType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-1 text-xs font-medium rounded capitalize transition-colors ${
                      type === t ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Angle Controls */}
            {type !== 'radial' && (
              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1.5">
                  <span>Angle</span>
                  <span className="font-mono text-zinc-200">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded mt-2"
                />
                <div className="flex justify-between gap-1 mt-2">
                  {[0, 45, 90, 135, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setAngle(deg)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        angle === deg ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stop Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Included Color Stops
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                {palette.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleIndex(idx)}
                      style={{ backgroundColor: item.hex }}
                      className={`flex-1 h-8 rounded-md transition-all flex items-center justify-center border ${
                        isSelected
                          ? 'border-white ring-2 ring-emerald-400/50 scale-100'
                          : 'opacity-30 border-zinc-700 scale-95'
                      }`}
                      title={`${item.name} (${item.hex})`}
                    >
                      {isSelected && (
                        <span
                          style={{ color: item.textColor }}
                          className="text-[10px] font-mono font-bold"
                        >
                          {idx + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Generated Code Display */}
          <div className="shrink-0">
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Generated CSS Code
            </label>
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-emerald-400 overflow-x-auto flex items-center justify-between">
              <code>{getCssString()}</code>
              <button
                onClick={handleCopyCss}
                className="ml-3 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded transition-colors shrink-0"
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-2 shrink-0">
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
