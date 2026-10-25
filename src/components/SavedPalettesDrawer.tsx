import React, { useState } from 'react';
import { X, Trash2, Edit3, Check, FolderOpen, Bookmark, Download, Upload } from 'lucide-react';
import { SavedPalette, deletePaletteFromStorage, renamePaletteInStorage, getSavedPalettes } from '../utils/storageUtils';

interface SavedPalettesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPalette: (colors: string[], name: string) => void;
  onToast: (msg: string) => void;
}

export const SavedPalettesDrawer: React.FC<SavedPalettesDrawerProps> = ({
  isOpen,
  onClose,
  onLoadPalette,
  onToast,
}) => {
  const [palettes, setPalettes] = useState<SavedPalette[]>(() => getSavedPalettes());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const refreshList = () => {
    setPalettes(getSavedPalettes());
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete palette "${name}"?`)) {
      deletePaletteFromStorage(id);
      refreshList();
      onToast(`Deleted "${name}"`);
    }
  };

  const handleStartRename = (palette: SavedPalette) => {
    setEditingId(palette.id);
    setEditNameInput(palette.name);
  };

  const handleSaveRename = (id: string) => {
    if (editNameInput.trim()) {
      renamePaletteInStorage(id, editNameInput.trim());
      setEditingId(null);
      refreshList();
      onToast('Palette renamed');
    }
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(palettes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snapcolor_palettes_backup_${Date.now()}.json`);
    downloadAnchor.click();
    onToast('Exported backup JSON');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contents = e.target?.result as string;
        const parsed = JSON.parse(contents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with existing
          const current = getSavedPalettes();
          const combined = [...parsed, ...current];
          // Deduplicate by ID
          const seen = new Set();
          const deduped = combined.filter((p) => {
            const duplicate = seen.has(p.id);
            seen.add(p.id);
            return !duplicate;
          });
          localStorage.setItem('snapcolor_saved_palettes_v1', JSON.stringify(deduped));
          refreshList();
          onToast(`Imported ${parsed.length} palettes`);
        } else {
          onToast('Invalid JSON file format');
        }
      } catch {
        onToast('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const filtered = palettes.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-palettes-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <h2 id="saved-palettes-title" className="text-sm font-semibold text-zinc-100">
              Saved Palettes ({palettes.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            aria-label="Close saved palettes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search saved palettes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 w-64"
          />

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="sr-only"
              />
            </label>

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors"
              title="Download backup JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
          </div>
        </div>

        {/* Palettes List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              {searchQuery ? 'No palettes matched your search query.' : 'No saved palettes yet. Click "Save" on the bottom bar to keep palettes here.'}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-950 border border-zinc-800 rounded-md hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* 5-Color Mini Strip */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <input
                          type="text"
                          value={editNameInput}
                          onChange={(e) => setEditNameInput(e.target.value)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-medium text-zinc-100 focus:outline-none w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300 rounded"
                          title="Save name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-200">
                          {item.name}
                        </span>
                        {item.harmony && (
                          <span className="text-[10px] text-zinc-500 capitalize">
                            · {item.harmony}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Visual Strip */}
                  <div className="flex h-10 w-full rounded-md overflow-hidden border border-zinc-800 shadow-xs">
                    {item.colors.map((hex, cIdx) => (
                      <div
                        key={cIdx}
                        style={{ backgroundColor: hex }}
                        className="flex-1 flex items-end justify-center pb-1 text-[9px] font-mono opacity-80"
                        title={hex}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 sm:self-center shrink-0">
                  <button
                    onClick={() => {
                      onLoadPalette(item.colors, item.name);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
                    title="Load this palette into canvas"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => handleStartRename(item)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Rename palette"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition-colors"
                    title="Delete palette"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 text-right">
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
