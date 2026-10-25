import React, { useState } from 'react';
import { X, Copy, Check, Download, Image as ImageIcon, Link as LinkIcon, Code } from 'lucide-react';
import {
  ColorItem,
  exportToCssVariables,
  exportToScss,
  exportToTailwind,
  exportToJson,
  exportToPng,
  getPaletteShareUrl,
} from '../utils/colorUtils';

interface ExportModalProps {
  palette: ColorItem[];
  paletteName: string;
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type ExportTab = 'css' | 'scss' | 'tailwind' | 'json' | 'png' | 'share';

export const ExportModal: React.FC<ExportModalProps> = ({
  palette,
  paletteName,
  isOpen,
  onClose,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  if (!isOpen) return null;

  const getExportContent = (): string => {
    switch (activeTab) {
      case 'css':
        return exportToCssVariables(palette, paletteName);
      case 'scss':
        return exportToScss(palette, paletteName);
      case 'tailwind':
        return exportToTailwind(palette, paletteName);
      case 'json':
        return exportToJson(palette, paletteName);
      case 'share':
        return getPaletteShareUrl(palette);
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const content = getExportContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    onToast('Export content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCodeFile = () => {
    const content = getExportContent();
    let filename = `${paletteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    let mimeType = 'text/plain';

    if (activeTab === 'css') {
      filename += '.css';
      mimeType = 'text/css';
    } else if (activeTab === 'scss') {
      filename += '.scss';
      mimeType = 'text/x-scss';
    } else if (activeTab === 'tailwind') {
      filename += '-tailwind.js';
      mimeType = 'application/javascript';
    } else if (activeTab === 'json') {
      filename += '.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    onToast(`Downloaded ${filename}`);
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      await exportToPng(palette, paletteName);
      onToast('PNG image downloaded successfully');
    } catch (err) {
      console.error(err);
      onToast('Failed to export PNG');
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-zinc-400" />
            <h2 id="export-dialog-title" className="text-sm font-semibold text-zinc-100">
              Export Palette: {paletteName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-5 pt-3 border-b border-zinc-800 bg-zinc-950 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'css', label: 'CSS Variables' },
            { id: 'scss', label: 'SCSS' },
            { id: 'tailwind', label: 'Tailwind' },
            { id: 'json', label: 'JSON' },
            { id: 'png', label: 'PNG Image', icon: ImageIcon },
            { id: 'share', label: 'Share Link', icon: LinkIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ExportTab);
                setCopied(false);
              }}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 min-h-[280px] flex flex-col">
          {activeTab === 'png' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-950 border border-zinc-800 rounded-md">
              {/* Swatch mini preview */}
              <div className="flex h-16 w-full max-w-md rounded-md overflow-hidden border border-zinc-800 shadow-md">
                {palette.map((item) => (
                  <div key={item.id} style={{ backgroundColor: item.hex }} className="flex-1" />
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">High Resolution 1200x630 PNG</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Rendered locally via HTML5 canvas with complete color names, HEX codes, and WCAG compliance metrics.
                </p>
              </div>
              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPng ? 'Rendering...' : 'Download PNG Card'}</span>
              </button>
            </div>
          ) : activeTab === 'share' ? (
            <div className="flex-1 flex flex-col justify-center space-y-4 bg-zinc-950 border border-zinc-800 rounded-md p-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Shareable URL</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Anyone opening this link will immediately load these exact 5 colors into their SnapColor studio.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPaletteShareUrl(palette)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono text-zinc-200 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <pre className="flex-1 p-4 bg-zinc-950 border border-zinc-800 rounded-md font-mono text-xs text-zinc-300 overflow-x-auto max-h-[300px] leading-relaxed">
                <code>{getExportContent()}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab !== 'png' && activeTab !== 'share' && (
          <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Ready to import into frontend frameworks
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCodeFile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
