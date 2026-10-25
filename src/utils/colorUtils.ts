/**
 * Color math and manipulation engine for SnapColor
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorItem {
  id: string;
  hex: string;
  rgb: string;
  hsl: string;
  isLocked: boolean;
  name: string;
  luminance: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
  textColor: string; // '#000000' or '#FFFFFF'
}

export type HarmonyMode = 'random' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic';

export type DisplayFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Validate hex code (supports 3 or 6 chars, with or without #)
 */
export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

/**
 * Normalize hex string to uppercase 6-character format with leading '#'
 */
export function normalizeHex(hex: string): string {
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  return ('#' + clean.slice(0, 6)).toUpperCase();
}

/**
 * Convert Hex to RGB
 */
export function hexToRgb(hex: string): RgbColor {
  const norm = normalizeHex(hex);
  const r = parseInt(norm.slice(1, 3), 16) || 0;
  const g = parseInt(norm.slice(3, 5), 16) || 0;
  const b = parseInt(norm.slice(5, 7), 16) || 0;
  return { r, g, b };
}

/**
 * Convert RGB to Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HslColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)) * 60;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / delta + 2) * 60;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hNorm = ((h % 360) + 360) % 360 / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let tAdj = t;
    if (tAdj < 0) tAdj += 1;
    if (tAdj > 1) tAdj -= 1;
    if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
    if (tAdj < 1 / 2) return q;
    if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, hNorm) * 255);
  const b = Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255);

  return { r, g, b };
}

/**
 * Convert HSL to Hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Calculate WCAG 2.1 relative luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const transformChannel = (channel: number) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const rLin = transformChannel(r);
  const gLin = transformChannel(g);
  const bLin = transformChannel(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calculate WCAG contrast ratio between two relative luminances
 */
export function getContrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Determine WCAG compliance level
 */
export function getWcagRating(ratio: number): {
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
} {
  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;

  let level: 'AAA' | 'AA' | 'AA Large' | 'Fail' = 'Fail';
  if (aaaNormal) level = 'AAA';
  else if (aaNormal) level = 'AA';
  else if (aaLarge) level = 'AA Large';

  return { aaNormal, aaLarge, aaaNormal, level };
}

/**
 * Curated list of named reference colors for accurate naming
 */
const COLOR_NAMES: Array<{ name: string; r: number; g: number; b: number }> = [
  { name: 'Pure Black', r: 0, g: 0, b: 0 },
  { name: 'Dark Slate', r: 15, g: 23, b: 42 },
  { name: 'Midnight Charcoal', r: 30, g: 41, b: 59 },
  { name: 'Gunmetal', r: 51, g: 65, b: 85 },
  { name: 'Cool Slate', r: 100, g: 116, b: 139 },
  { name: 'Silver Ash', r: 148, g: 163, b: 184 },
  { name: 'Platinum', r: 226, g: 232, b: 240 },
  { name: 'Pure White', r: 255, g: 255, b: 255 },
  { name: 'Crimson Wine', r: 136, g: 19, b: 55 },
  { name: 'Ruby Scarlet', r: 225, g: 29, b: 72 },
  { name: 'Vibrant Coral', r: 244, g: 63, b: 94 },
  { name: 'Rose Petal', r: 251, g: 113, b: 133 },
  { name: 'Dusty Blush', r: 253, g: 164, b: 175 },
  { name: 'Burnt Ochre', r: 154, g: 52, b: 18 },
  { name: 'Sunset Terracotta', r: 234, g: 88, b: 12 },
  { name: 'Amber Orange', r: 249, g: 115, b: 22 },
  { name: 'Warm Apricot', r: 251, g: 146, b: 60 },
  { name: 'Deep Gold', r: 180, g: 83, b: 9 },
  { name: 'Bright Marigold', r: 217, g: 119, b: 6 },
  { name: 'Solar Amber', r: 245, g: 158, b: 11 },
  { name: 'Sunbeam Yellow', r: 251, g: 191, b: 36 },
  { name: 'Pale Canary', r: 254, g: 240, b: 138 },
  { name: 'Forest Moss', r: 20, g: 83, b: 45 },
  { name: 'Hunter Emerald', r: 22, g: 101, b: 52 },
  { name: 'Deep Emerald', r: 21, g: 128, b: 61 },
  { name: 'Fresh Jade', r: 16, g: 185, b: 129 },
  { name: 'Mint Green', r: 52, g: 211, b: 153 },
  { name: 'Soft Seafoam', r: 167, g: 243, b: 208 },
  { name: 'Deep Teal', r: 15, g: 118, b: 110 },
  { name: 'Ocean Cyan', r: 14, g: 165, b: 233 },
  { name: 'Sky Azure', r: 56, g: 189, b: 248 },
  { name: 'Glacier Blue', r: 186, g: 230, b: 253 },
  { name: 'Deep Navy', r: 30, g: 58, b: 138 },
  { name: 'Royal Cobalt', r: 29, g: 78, b: 216 },
  { name: 'Vibrant Ultramarine', r: 37, g: 99, b: 235 },
  { name: 'Electric Azure', r: 59, g: 130, b: 246 },
  { name: 'Cerulean Mist', r: 147, g: 197, b: 253 },
  { name: 'Deep Plum', r: 88, g: 28, b: 135 },
  { name: 'Midnight Violet', r: 109, g: 40, b: 217 },
  { name: 'Royal Purple', r: 126, g: 34, b: 206 },
  { name: 'Soft Lavender', r: 192, g: 132, b: 252 },
  { name: 'Lilac Mist', r: 233, g: 213, b: 255 },
  { name: 'Deep Berry', r: 112, g: 26, b: 117 },
  { name: 'Magenta Rose', r: 192, g: 38, b: 211 },
  { name: 'Orchid Pink', r: 232, g: 121, b: 249 },
  { name: 'Warm Taupe', r: 120, g: 113, b: 108 },
  { name: 'Muted Sand', r: 168, g: 162, b: 158 },
  { name: 'Pebble Stone', r: 214, g: 211, b: 209 },
  { name: 'Warm Cream', r: 245, g: 245, b: 244 },
];

/**
 * Determine closest human-readable name for an RGB color
 */
export function getColorName(r: number, g: number, b: number): string {
  let minDistance = Infinity;
  let closestName = 'Custom Tone';

  for (const item of COLOR_NAMES) {
    // Weighted Euclidean distance for human perception
    const rDiff = r - item.r;
    const gDiff = g - item.g;
    const bDiff = b - item.b;
    const distance = 0.3 * (rDiff * rDiff) + 0.59 * (gDiff * gDiff) + 0.11 * (bDiff * bDiff);

    if (distance < minDistance) {
      minDistance = distance;
      closestName = item.name;
    }
  }

  return closestName;
}

/**
 * Build a full ColorItem object from a hex string
 */
export function buildColorItem(hex: string, id: string, isLocked: boolean = false): ColorItem {
  const norm = normalizeHex(hex);
  const { r, g, b } = hexToRgb(norm);
  const { h, s, l } = rgbToHsl(r, g, b);

  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  const lum = getRelativeLuminance(r, g, b);
  const whiteLum = 1.0;
  const blackLum = 0.0;

  const contrastWithWhite = Number(getContrastRatio(lum, whiteLum).toFixed(2));
  const contrastWithBlack = Number(getContrastRatio(lum, blackLum).toFixed(2));

  // Choose pure white or pure black depending on which achieves higher contrast
  const textColor = contrastWithWhite >= contrastWithBlack ? '#FFFFFF' : '#000000';
  const name = getColorName(r, g, b);

  return {
    id,
    hex: norm,
    rgb: rgbStr,
    hsl: hslStr,
    isLocked,
    name,
    luminance: Number(lum.toFixed(3)),
    contrastWithWhite,
    contrastWithBlack,
    textColor,
  };
}

/**
 * Generate 5 random or algorithmic colors based on harmony mode and existing locked swatches
 */
export function generateFiveColorPalette(
  currentPalette?: ColorItem[],
  mode: HarmonyMode = 'random'
): ColorItem[] {
  // If we have an existing palette, identify the locked colors
  const lockedIndices: number[] = [];
  let anchorColor: ColorItem | null = null;

  if (currentPalette && currentPalette.length === 5) {
    currentPalette.forEach((item, index) => {
      if (item.isLocked) {
        lockedIndices.push(index);
        if (!anchorColor) {
          anchorColor = item;
        }
      }
    });
  }

  // Anchor hue and saturation
  let baseHue = Math.floor(Math.random() * 360);
  let baseSat = Math.floor(Math.random() * 30) + 65; // 65-95%
  let baseLight = Math.floor(Math.random() * 30) + 40; // 40-70%

  if (anchorColor) {
    const anchorRgb = hexToRgb((anchorColor as ColorItem).hex);
    const anchorHsl = rgbToHsl(anchorRgb.r, anchorRgb.g, anchorRgb.b);
    baseHue = anchorHsl.h;
    baseSat = anchorHsl.s;
    baseLight = anchorHsl.l;
  }

  const generatedHexes: string[] = [];

  switch (mode) {
    case 'monochromatic': {
      // 5 steps of lightness across the same hue with subtle saturation variations
      const lightnessSteps = [18, 35, 52, 70, 88];
      for (let i = 0; i < 5; i++) {
        const sat = Math.max(25, Math.min(95, baseSat + (i % 2 === 0 ? 5 : -5)));
        generatedHexes.push(hslToHex(baseHue, sat, lightnessSteps[i]));
      }
      break;
    }

    case 'analogous': {
      // 5 adjacent hues on the color wheel: base-40, base-20, base, base+20, base+40
      const angleOffsets = [-40, -20, 0, 20, 40];
      const lightnessSteps = [35, 48, 58, 50, 42];
      for (let i = 0; i < 5; i++) {
        const hue = (baseHue + angleOffsets[i] + 360) % 360;
        const sat = Math.max(50, Math.min(90, baseSat + (i * 2)));
        generatedHexes.push(hslToHex(hue, sat, lightnessSteps[i]));
      }
      break;
    }

    case 'complementary': {
      // Base hue (0), complementary (+180), split accents, and light/dark anchors
      const complementHue = (baseHue + 180) % 360;
      generatedHexes.push(hslToHex(baseHue, Math.min(95, baseSat + 10), 32)); // Dark base
      generatedHexes.push(hslToHex(baseHue, baseSat, 56)); // Primary base
      generatedHexes.push(hslToHex((baseHue + 30) % 360, Math.max(30, baseSat - 20), 84)); // Tint accent
      generatedHexes.push(hslToHex(complementHue, baseSat, 54)); // Complement
      generatedHexes.push(hslToHex((complementHue + 20) % 360, Math.min(95, baseSat + 15), 36)); // Deep complement
      break;
    }

    case 'triadic': {
      // 3 equidistant hues: 0, 120, 240, plus 2 shades
      const hue1 = baseHue;
      const hue2 = (baseHue + 120) % 360;
      const hue3 = (baseHue + 240) % 360;
      generatedHexes.push(hslToHex(hue1, baseSat, 42));
      generatedHexes.push(hslToHex(hue1, Math.max(25, baseSat - 30), 82));
      generatedHexes.push(hslToHex(hue2, baseSat, 52));
      generatedHexes.push(hslToHex(hue3, Math.min(95, baseSat + 10), 50));
      generatedHexes.push(hslToHex(hue3, Math.min(90, baseSat + 5), 28));
      break;
    }

    case 'random':
    default: {
      // Curated vibrant high-contrast distribution
      // Pick 5 distinct points around the hue wheel with intentional lightness diversity
      const step = 360 / 5;
      const jitter = () => (Math.random() - 0.5) * 28;
      const lightDistribution = [28, 48, 62, 52, 78];
      // Shuffle lightness distribution
      const shuffledLights = [...lightDistribution].sort(() => Math.random() - 0.5);

      for (let i = 0; i < 5; i++) {
        const hue = Math.round((baseHue + (i * step) + jitter() + 360) % 360);
        const sat = Math.round(Math.max(55, Math.min(95, baseSat + jitter())));
        const light = shuffledLights[i];
        generatedHexes.push(hslToHex(hue, sat, light));
      }
      break;
    }
  }

  // Assemble the result, retaining locked colors in their exact positions
  return Array.from({ length: 5 }, (_, i) => {
    if (currentPalette && currentPalette[i] && currentPalette[i].isLocked) {
      return currentPalette[i];
    }
    const hex = generatedHexes[i];
    const id = currentPalette && currentPalette[i] ? currentPalette[i].id : `c-${i + 1}-${Date.now()}`;
    return buildColorItem(hex, id, false);
  });
}

/**
 * Generate CSS Custom Properties export string
 */
export function exportToCssVariables(palette: ColorItem[], paletteName: string = 'SnapColor Palette'): string {
  const lines = [
    `/* ${paletteName} */`,
    `:root {`,
    ...palette.map((item, idx) => `  --color-${idx + 1}: ${item.hex}; /* ${item.name} */`),
    `}`,
  ];
  return lines.join('\n');
}

/**
 * Generate SCSS variables export string
 */
export function exportToScss(palette: ColorItem[], paletteName: string = 'SnapColor Palette'): string {
  const lines = [
    `// ${paletteName}`,
    ...palette.map((item, idx) => `$color-${idx + 1}: ${item.hex}; // ${item.name}`),
  ];
  return lines.join('\n');
}

/**
 * Generate Tailwind configuration snippet
 */
export function exportToTailwind(palette: ColorItem[], paletteName: string = 'snapcolor'): string {
  const slug = paletteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `// Tailwind config snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        '${slug}': {
${palette.map((item, idx) => `          '${(idx + 1) * 100}': '${item.hex}', // ${item.name}`).join('\n')}
        }
      }
    }
  }
};`;
}

/**
 * Generate JSON export string
 */
export function exportToJson(palette: ColorItem[], paletteName: string = 'SnapColor Palette'): string {
  const data = {
    paletteName,
    created: new Date().toISOString(),
    colors: palette.map((item, idx) => ({
      index: idx + 1,
      name: item.name,
      hex: item.hex,
      rgb: item.rgb,
      hsl: item.hsl,
      luminance: item.luminance,
      wcag: {
        contrastWithWhite: item.contrastWithWhite,
        contrastWithBlack: item.contrastWithBlack,
        whiteRating: getWcagRating(item.contrastWithWhite).level,
        blackRating: getWcagRating(item.contrastWithBlack).level,
      },
    })),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Generate high-resolution PNG of the 5-color palette using HTML Canvas
 */
export function exportToPng(palette: ColorItem[], paletteName: string = 'SnapColor Palette'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const width = 1200;
      const height = 630;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Background
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, width, height);

      // Header Brand
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 30px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText('SnapColor', 50, 60);

      // Palette Name & Date
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 18px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(paletteName, 220, 60);

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      ctx.font = '400 15px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(dateStr, width - 50, 60);
      ctx.textAlign = 'left';

      // 5 Color Swatch Strips
      const swatchTop = 95;
      const swatchHeight = 440;
      const swatchWidth = (width - 100) / 5;

      palette.forEach((item, index) => {
        const x = 50 + index * swatchWidth;

        // Fill swatch block
        ctx.fillStyle = item.hex;
        ctx.fillRect(x, swatchTop, swatchWidth, swatchHeight);

        // Subdued border
        ctx.strokeStyle = '#18181B';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, swatchTop, swatchWidth, swatchHeight);

        // Information card at bottom of swatch
        const infoY = swatchTop + swatchHeight - 110;
        ctx.fillStyle = item.textColor === '#000000' ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.35)';
        ctx.fillRect(x + 10, infoY, swatchWidth - 20, 95);

        // Swatch details
        ctx.fillStyle = item.textColor;
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.fillText(item.hex, x + 20, infoY + 30);

        ctx.font = '600 14px "Plus Jakarta Sans", system-ui, sans-serif';
        // Truncate name if too long
        let displayColorName = item.name;
        if (displayColorName.length > 18) {
          displayColorName = displayColorName.slice(0, 16) + '...';
        }
        ctx.fillText(displayColorName, x + 20, infoY + 54);

        ctx.font = '400 12px "JetBrains Mono", monospace';
        ctx.fillText(item.rgb, x + 20, infoY + 76);
      });

      // Footer
      ctx.fillStyle = '#64748B';
      ctx.font = '400 13px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText('Generated with SnapColor Palette Studio', 50, height - 35);

      ctx.textAlign = 'right';
      ctx.fillText('WCAG 2.1 Compliant Engine', width - 50, height - 35);

      // Trigger download
      const link = document.createElement('a');
      const filename = `${paletteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_palette.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate URL search string for sharing
 */
export function getPaletteShareUrl(palette: ColorItem[]): string {
  const hexList = palette.map(c => c.hex.replace('#', '')).join('-');
  const url = new URL(window.location.href);
  url.searchParams.set('colors', hexList);
  return url.toString();
}

/**
 * Parse URL query parameters to retrieve colors if present
 */
export function getPaletteFromUrl(): string[] | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const colorsParam = params.get('colors');
    if (!colorsParam) return null;

    const hexParts = colorsParam.split('-');
    if (hexParts.length === 5 && hexParts.every(h => isValidHex(h))) {
      return hexParts.map(h => normalizeHex(h));
    }
    return null;
  } catch {
    return null;
  }
}
