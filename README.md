# SnapColor

SnapColor is a high-speed, client-side color palette generator and accessibility engineering suite built with React, TypeScript, Vite, and Tailwind CSS. It requires no external APIs, backends, authentication, or paid services.

![SnapColor Favicon](public/favicon.svg)

## Features

- **5-Color Palette Generation**: Algorithmic generation powered by color wheel mathematics.
  - **Complementary**: Base hue combined with its direct color wheel opposite and luminance accents.
  - **Analogous**: Adjacent hues within 40 degrees for cohesive branding.
  - **Triadic**: 120-degree balanced triads with coordinated shades.
  - **Monochromatic**: 5-step lightness distributions across identical hues.
  - **Random Balance**: Jittered distribution for spontaneous inspiration.
- **Color Locking**: Lock individual swatches with one click or key shortcuts `1` through `5`. Unlocked colors generate harmoniously around locked anchors.
- **Multi-Format Color Display & Copy**: Seamlessly switch between HEX, RGB, and HSL values. Click any swatch or label for instantaneous clipboard copying.
- **Manual Swatch Editor & Native Picker**: Direct HEX input with realtime validation, native color picker integration, HSL sliders, tints and shades strips, and live contrast benchmarks.
- **Favorites & LocalStorage Persistence**: Save custom palettes locally under `snapcolor_saved_palettes_v1`. Open, rename, delete, backup as JSON, or import previous backups.
- **CSS Gradient Studio**: Interactive generator supporting Linear (0 to 360 degrees), Radial, and Conic gradients with customizable color stops and CSS code export.
- **WCAG 2.1 AA Contrast Engine**: Real-time relative luminance calculation for text legibility vs pure black and pure white, plus an exhaustive 5x5 pairwise contrast matrix and real-world UI preview.
- **Export Formats**:
  - CSS Custom Properties (`:root { --color-1: ... }`)
  - SCSS Variables (`$color-1: ...`)
  - Tailwind CSS Configuration snippets
  - Structured JSON
  - High-Resolution 1200x630 PNG card rendered client-side via HTML5 Canvas
  - Shareable URL with encoded color params
- **Keyboard Shortcuts**: Designed for rapid iteration (`Space`, `1-5`, `C`, `S`, `E`, `G`, `Ctrl+Z`, `Ctrl+Y`).
- **Accessibility & Performance**: Visible focus indicators, semantic ARIA markup, zero external tracking, and full `prefers-reduced-motion` compliance.

## Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Space` | Generate new palette (retains locked colors) |
| `1` - `5` | Toggle lock on swatch 1 through 5 |
| `C` | Copy all palette hex codes to clipboard |
| `S` | Save current palette to favorites |
| `E` | Open export modal (CSS, SCSS, Tailwind, JSON, PNG) |
| `G` | Open CSS Gradient studio |
| `Ctrl + Z` | Undo palette generation |
| `Ctrl + Y` | Redo palette generation |
| `?` | Toggle keyboard shortcuts modal |
| `Esc` | Close any open modal dialog |

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/snapcolor.git

# Navigate into the project directory
cd snapcolor

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The app will be accessible at `http://localhost:3000`.

### Production Build

```bash
# Type check and build minified production bundle
npm run build

# Preview production build locally
npm run preview
```

## Deployment

### Vercel Deployment

SnapColor is pre-configured for free static hosting on Vercel:

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Keep the default settings (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
5. Click **Deploy**.

The bundled `vercel.json` ensures all route requests and static assets like `favicon.svg` are served with proper caching and single-page application rewrites.

### Custom Domain Configuration

To connect your custom domain on Vercel:
1. Navigate to **Project Settings > Domains** in your Vercel dashboard.
2. Enter your custom domain (e.g., `snapcolor.app` or `colors.yourdomain.com`).
3. Add the required DNS records at your domain registrar:
   - For apex domain (`example.com`): Type `A`, Name `@`, Value `76.76.21.21`
   - For subdomain (`colors.example.com`): Type `CNAME`, Name `colors`, Value `cname.vercel-dns.com`
4. Once DNS propagates, Vercel automatically provisions free SSL/TLS certificates.

## License

MIT License. Free for personal and commercial projects.
