/**
 * LocalStorage and Persistence Layer for SnapColor
 */

import { HarmonyMode } from './colorUtils';

export interface SavedPalette {
  id: string;
  name: string;
  colors: string[]; // 5 hex codes
  createdAt: number;
  harmony?: HarmonyMode;
}

const STORAGE_KEY = 'snapcolor_saved_palettes_v1';

const DEFAULT_PRESET_PALETTES: SavedPalette[] = [
  {
    id: 'preset-1',
    name: 'Nordic Slate & Amber',
    colors: ['#0F172A', '#334155', '#F59E0B', '#F8FAFC', '#E2E8F0'],
    createdAt: Date.now() - 86400000 * 3,
    harmony: 'complementary',
  },
  {
    id: 'preset-2',
    name: 'Emerald Coastline',
    colors: ['#064E3B', '#059669', '#34D399', '#A7F3D0', '#ECFDF5'],
    createdAt: Date.now() - 86400000 * 2,
    harmony: 'monochromatic',
  },
  {
    id: 'preset-3',
    name: 'Sunset Terracotta',
    colors: ['#7C2D12', '#C2410C', '#FB923C', '#FDE047', '#FEF08A'],
    createdAt: Date.now() - 86400000 * 1,
    harmony: 'analogous',
  },
  {
    id: 'preset-4',
    name: 'Deep Oceanic Triad',
    colors: ['#1E3A8A', '#2563EB', '#0D9488', '#F59E0B', '#FBBF24'],
    createdAt: Date.now(),
    harmony: 'triadic',
  },
];

/**
 * Get all saved palettes from LocalStorage
 */
export function getSavedPalettes(): SavedPalette[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial presets on first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_PALETTES));
      return DEFAULT_PRESET_PALETTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_PRESET_PALETTES;
  } catch (err) {
    console.error('Failed to read saved palettes from localStorage', err);
    return DEFAULT_PRESET_PALETTES;
  }
}

/**
 * Save new palette to LocalStorage
 */
export function savePaletteToStorage(
  name: string,
  colors: string[],
  harmony?: HarmonyMode
): SavedPalette {
  const palettes = getSavedPalettes();
  const newPalette: SavedPalette = {
    id: `palette-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || `Palette ${palettes.length + 1}`,
    colors: colors.slice(0, 5),
    createdAt: Date.now(),
    harmony,
  };

  const updated = [newPalette, ...palettes];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save palette to localStorage', err);
  }

  return newPalette;
}

/**
 * Rename an existing saved palette
 */
export function renamePaletteInStorage(id: string, newName: string): boolean {
  try {
    const palettes = getSavedPalettes();
    const index = palettes.findIndex(p => p.id === id);
    if (index === -1) return false;

    palettes[index].name = newName.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    return true;
  } catch (err) {
    console.error('Failed to rename palette', err);
    return false;
  }
}

/**
 * Delete a saved palette from LocalStorage
 */
export function deletePaletteFromStorage(id: string): boolean {
  try {
    const palettes = getSavedPalettes();
    const filtered = palettes.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete palette', err);
    return false;
  }
}
