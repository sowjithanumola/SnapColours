import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ColorItem,
  HarmonyMode,
  DisplayFormat,
  generateFiveColorPalette,
  buildColorItem,
  getPaletteFromUrl,
  getPaletteShareUrl,
} from './utils/colorUtils';
import { getSavedPalettes } from './utils/storageUtils';
import { Header } from './components/Header';
import { PaletteCanvas } from './components/PaletteCanvas';
import { ControlBar } from './components/ControlBar';
import { Toast } from './components/Toast';
import { ColorPickerModal } from './components/ColorPickerModal';
import { ExportModal } from './components/ExportModal';
import { SavedPalettesDrawer } from './components/SavedPalettesDrawer';
import { GradientStudioModal } from './components/GradientStudioModal';
import { ContrastMatrixModal } from './components/ContrastMatrixModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SavePaletteModal } from './components/SavePaletteModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';

const DEFAULT_HEX_CODES = ['#0F172A', '#1E3A8A', '#0D9488', '#F59E0B', '#F8FAFC'];

export default function App() {
  // Initialize Palette (from URL if present, or curated default)
  const [palette, setPalette] = useState<ColorItem[]>(() => {
    const urlHexes = getPaletteFromUrl();
    if (urlHexes && urlHexes.length === 5) {
      return urlHexes.map((hex, idx) => buildColorItem(hex, `c-${idx + 1}-init`, false));
    }
    return DEFAULT_HEX_CODES.map((hex, idx) => buildColorItem(hex, `c-${idx + 1}-init`, false));
  });

  const [paletteName, setPaletteName] = useState<string>('Custom Palette');
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('random');
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>('hex');

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<ColorItem[][]>([palette]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'generator' | 'gradients' | 'contrast'>('generator');

  // Modals & Drawers State
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Quick Action Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [savedCount, setSavedCount] = useState<number>(() => getSavedPalettes().length);

  // Keep ref of open modals so keyboard shortcuts don't fire while typing in an input
  const anyModalOpen =
    isSavedOpen ||
    isExportOpen ||
    isShortcutsOpen ||
    isSaveModalOpen ||
    isPrivacyOpen ||
    isTermsOpen ||
    editingIndex !== null;

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Sync saved count
  const refreshSavedCount = useCallback(() => {
    setSavedCount(getSavedPalettes().length);
  }, []);

  // Update history stack
  const pushToHistory = useCallback((newPalette: ColorItem[]) => {
    setHistory((prev) => {
      const slice = prev.slice(0, historyIndex + 1);
      return [...slice, newPalette];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Generate new palette
  const handleGenerate = useCallback(() => {
    const next = generateFiveColorPalette(palette, harmonyMode);
    setPalette(next);
    pushToHistory(next);
  }, [palette, harmonyMode, pushToHistory]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPalette(history[prevIdx]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPalette(history[nextIdx]);
    }
  }, [historyIndex, history]);

  // Toggle color lock
  const handleToggleLock = useCallback((index: number) => {
    setPalette((prev) => {
      const next = [...prev];
      const target = next[index];
      next[index] = { ...target, isLocked: !target.isLocked };
      return next;
    });
  }, []);

  // Update specific color from manual editor
  const handleUpdateColor = useCallback((index: number, updatedItem: ColorItem) => {
    setPalette((prev) => {
      const next = [...prev];
      next[index] = updatedItem;
      pushToHistory(next);
      return next;
    });
    showToast(`Updated Swatch 0${index + 1} to ${updatedItem.hex}`);
  }, [pushToHistory, showToast]);

  // Move color swatch left or right
  const handleMoveColor = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= 5) return;
    setPalette((prev) => {
      const next = [...prev];
      const item = next.splice(fromIndex, 1)[0];
      next.splice(toIndex, 0, item);
      pushToHistory(next);
      return next;
    });
  }, [pushToHistory]);

  // Copy single color
  const handleCopyColor = useCallback((item: ColorItem) => {
    let copyText = item.hex;
    if (displayFormat === 'rgb') copyText = item.rgb;
    if (displayFormat === 'hsl') copyText = item.hsl;

    navigator.clipboard.writeText(copyText);
    setCopiedId(item.id);
    showToast(`Copied ${copyText} to clipboard`);
    setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1800);
  }, [displayFormat, showToast]);

  // Copy full palette
  const handleCopyFullPalette = useCallback(() => {
    const text = palette.map((c) => c.hex).join(', ');
    navigator.clipboard.writeText(text);
    showToast('Copied full palette HEX codes');
  }, [palette, showToast]);

  // Load palette from saved list
  const handleLoadPalette = useCallback((colors: string[], name: string) => {
    const loaded = colors.map((hex, idx) => buildColorItem(hex, `c-${idx + 1}-${Date.now()}`, false));
    setPalette(loaded);
    setPaletteName(name);
    pushToHistory(loaded);
    showToast(`Loaded "${name}"`);
  }, [pushToHistory, showToast]);

  // Share palette URL
  const handleShare = useCallback(() => {
    const url = getPaletteShareUrl(palette);
    navigator.clipboard.writeText(url);
    showToast('Share link copied to clipboard');
  }, [palette, showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Escape always closes any open modal
      if (e.key === 'Escape') {
        setIsSavedOpen(false);
        setIsExportOpen(false);
        setIsShortcutsOpen(false);
        setIsSaveModalOpen(false);
        setIsPrivacyOpen(false);
        setIsTermsOpen(false);
        setEditingIndex(null);
        return;
      }

      // If user is typing in an input or modal is open, skip generation shortcuts
      if (isInputActive || anyModalOpen) {
        return;
      }

      // Space: Generate
      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
        return;
      }

      // Numbers 1-5: Lock swatch
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        handleToggleLock(idx);
        return;
      }

      // C: Copy full palette
      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleCopyFullPalette();
        }
        return;
      }

      // S: Save
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsSaveModalOpen(true);
        }
        return;
      }

      // E: Export
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setIsExportOpen(true);
        return;
      }

      // G: Gradients
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setActiveTab('gradients');
        return;
      }

      // ?: Help shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    anyModalOpen,
    handleGenerate,
    handleToggleLock,
    handleCopyFullPalette,
    handleUndo,
    handleRedo,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onShare={handleShare}
        savedCount={savedCount}
      />

      {/* Main Canvas Area */}
      <PaletteCanvas
        palette={palette}
        displayFormat={displayFormat}
        copiedId={copiedId}
        onToggleLock={handleToggleLock}
        onOpenColorEditor={(idx) => setEditingIndex(idx)}
        onCopyColor={handleCopyColor}
        onMoveColor={handleMoveColor}
      />

      {/* Bottom Control Bar */}
      <ControlBar
        harmonyMode={harmonyMode}
        setHarmonyMode={setHarmonyMode}
        displayFormat={displayFormat}
        setDisplayFormat={setDisplayFormat}
        onGenerate={handleGenerate}
        onSaveCurrent={() => setIsSaveModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />

      {/* Manual Color Picker & Swatch Editor Modal */}
      {editingIndex !== null && (
        <ColorPickerModal
          colorItem={palette[editingIndex]}
          index={editingIndex}
          isOpen={true}
          onClose={() => setEditingIndex(null)}
          onSave={handleUpdateColor}
        />
      )}

      {/* Multi-Format Export Modal */}
      {isExportOpen && (
        <ExportModal
          palette={palette}
          paletteName={paletteName}
          isOpen={true}
          onClose={() => setIsExportOpen(false)}
          onToast={showToast}
        />
      )}

      {/* Saved Palettes Drawer */}
      {isSavedOpen && (
        <SavedPalettesDrawer
          isOpen={true}
          onClose={() => {
            setIsSavedOpen(false);
            refreshSavedCount();
          }}
          onLoadPalette={handleLoadPalette}
          onToast={showToast}
        />
      )}

      {/* CSS Gradient Studio Modal / Tab */}
      {activeTab === 'gradients' && (
        <GradientStudioModal
          palette={palette}
          isOpen={true}
          onClose={() => setActiveTab('generator')}
          onToast={showToast}
        />
      )}

      {/* WCAG Contrast Matrix Modal / Tab */}
      {activeTab === 'contrast' && (
        <ContrastMatrixModal
          palette={palette}
          isOpen={true}
          onClose={() => setActiveTab('generator')}
        />
      )}

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      {isShortcutsOpen && (
        <ShortcutsModal
          isOpen={true}
          onClose={() => setIsShortcutsOpen(false)}
        />
      )}

      {/* Bookmark / Save Palette Modal */}
      {isSaveModalOpen && (
        <SavePaletteModal
          palette={palette}
          harmonyMode={harmonyMode}
          isOpen={true}
          onClose={() => setIsSaveModalOpen(false)}
          onSaved={(name) => {
            setPaletteName(name);
            refreshSavedCount();
            showToast(`Saved "${name}" to favorites`);
          }}
        />
      )}

      {/* Legal & Compliance: Privacy Policy Modal */}
      {isPrivacyOpen && (
        <PrivacyModal
          isOpen={true}
          onClose={() => setIsPrivacyOpen(false)}
        />
      )}

      {/* Legal & Compliance: Terms and Conditions Modal */}
      {isTermsOpen && (
        <TermsModal
          isOpen={true}
          onClose={() => setIsTermsOpen(false)}
        />
      )}
    </div>
  );
}
