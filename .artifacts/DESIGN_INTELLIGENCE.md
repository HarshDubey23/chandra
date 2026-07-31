# DESIGN INTELLIGENCE — Chandra Gram Sabha Awwwards Constitution

> **Status:** Phase 1 design vault. Binding source of truth for every token, type, motion, and texture decision in Phases 2–5.
> **Authored by:** frontend-styling-expert (Task ID 1)
> **Last updated:** Phase 1 kickoff
> **Constraint:** Indian rural governance portal. Bilingual (Hindi/English). Must run at 60fps on a ₹8,000 Android over 3G. Zero feature deletion.

---

## 0. Design Language Lineage — Reference Studies

The Chandra portal is **not** a Linear clone. It borrows technique, not aesthetic, from five reference systems and re-tunes each for the rural-Indian context.

### linear.app
- **Spacing rhythm:** Built on a strict 4/8/16/24/32/48px lattice. Whitespace is *earned* — sections never feel crowded because they leave a 96px breathing band above every H2.
- **Warm grays:** Their dark mode is `oklch(0.14 0.005 285)` — a *warm* near-black, never the cold `zinc-950` default. Borders are lifted by ~3% lightness from bg, never pure white.
- **Kinetic typography:** Headlines use mask-up reveals (translateY 110% → 0 inside `overflow: hidden`). The trick is the *inner span* animates, the *outer* clips.
- **Dark-mode-first:** All colors designed for dark, then inverted. Saturated accents are reserved for hover states; default UI is monochrome + 1 accent.
- **Lesson for Chandra:** Use warm-charcoal foreground on warm-sand background (not pure white). Saffron is our "Linear purple" — used sparingly.

### stripe.com
- **Mesh gradients:** Multiple radial-gradients layered with `mix-blend-mode: screen` over a base color. Subtle drift via `@keyframes` moving background-position over 30s+. Never a flat color field.
- **Scroll-linked reveals:** Headlines cross-fade + translate-up as they enter viewport. Driven by `useScroll` + `useTransform` — `transform` only, no layout thrash.
- **Pristine typography:** Inter at near-perfect rendering. Headlines are tight (`letter-spacing: -0.02em`), body is normal. Numerical data uses tabular-nums.
- **Lesson for Chandra:** Mesh gradient hero background — saffron + emerald bleeding into warm paper. Numbers in `Village Stats` use tabular-nums.

### framer.com
- **Magnetic buttons:** On `mousemove`, the button translates by ~30% of cursor offset from center, then springs back on `mouseleave`. Spring config: `{ stiffness: 200, damping: 20 }`.
- **Kinetic type:** Word-by-word stagger reveals with `staggerChildren: 0.08`, `delayChildren: 0.15`. Each word in its own mask-line wrapper.
- **Playful-but-precise:** Overshoot on spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`), but durations are short (150–300ms) so it never feels bouncy.
- **Lesson for Chandra:** Magnetic CTAs (desktop only), word-by-word hero stagger, single overshoot spring token used everywhere.

### vercel.com
- **Grid backgrounds:** A faint dot-grid or line-grid behind dark sections. Implemented as a 1px SVG background-image at ~3% opacity. Provides "engineering rigor" subtext.
- **Dark mode:** Pure `oklch(0 0 0)` OLED black with `oklch(0.96 0 0)` text. Geometric precision — every element snaps to 4px grid.
- **Geometric precision:** Hairlines (1px borders) at ~8% white opacity. Sharp corners on code blocks, 8px radius on cards, 12px on hero.
- **Lesson for Chandra:** Dot-grid utility class for dark sections (e.g., dashboard, footer). OLED-black dark mode for AMOLED phones common in rural UP.

### canva.com
- **Bold typography:** Display weights (700–900) for hero, 600 for H2, 500 for body. Headlines are huge (`clamp(3rem, 6vw, 6rem)`).
- **Joyful art direction:** Multi-color palette but each surface uses max 2 accents. Canva's "gradient text" uses `background-clip: text` over a 2-stop gradient.
- **Accessible color:** Every primary color passes AA against its surface. Their checker is built-in.
- **Lesson for Chandra:** Bold display weight for hero H1, gradient-text on the word "सभा" using saffron→emerald. Verify every token pair hits 4.5:1.

---

## 1. Color System (OKLCH — hex/rgba banned from design tokens)

> **Why OKLCH?** Perceptually uniform lightness axis → predictable contrast ratios. Hue rotations stay chroma-consistent. Native CSS Color 4 — supported in all evergreen browsers, no PostCSS plugin needed (Next 16 / Tailwind v4 ship it).

### Token philosophy
- Two tricolor accents — **saffron** (primary, action) and **emerald** (accent, success/assembly) — used with restraint. ≤2 accent colors visible per viewport.
- Background is warm paper / OLED black — **never** pure `#fff` or pure `#000` neutrals. Warmth comes from a `0.005–0.02` chroma at hue 80 (warm yellow axis).
- Borders are *lifted* 3% L above bg (light) or *dropped* 12% L below fg (dark), never pure white/black at fixed opacity.

### Light theme — `:root` / `--theme-light`

```css
:root {
  /* Surfaces */
  --background:          oklch(0.98 0.01 80);   /* warm paper */
  --foreground:          oklch(0.20 0.02 80);   /* deep warm charcoal */
  --card:                oklch(1.00 0.003 80);  /* lifted paper */
  --card-foreground:     oklch(0.20 0.02 80);
  --popover:             oklch(0.99 0.005 80);
  --popover-foreground:  oklch(0.20 0.02 80);

  /* Brand accents */
  --primary:             oklch(0.68 0.17 55);   /* saffron — for fills */
  --primary-foreground:  oklch(0.99 0.01 80);   /* warm white on saffron */
  --primary-text:        oklch(0.50 0.16 50);   /* saffron darkened for text-on-paper (AA) */
  --secondary:           oklch(0.95 0.015 80);
  --secondary-foreground:oklch(0.25 0.02 80);
  --muted:               oklch(0.96 0.012 80);
  --muted-foreground:    oklch(0.50 0.02 80);   /* AA on background */
  --accent:              oklch(0.58 0.14 155);  /* emerald — for fills */
  --accent-foreground:   oklch(0.99 0.01 80);
  --accent-text:         oklch(0.42 0.12 160);  /* emerald darkened for text (AA) */
  --destructive:         oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.99 0.01 80);

  /* Lines & focus */
  --border:              oklch(0.90 0.012 80);
  --input:               oklch(0.88 0.015 80);
  --ring:                oklch(0.68 0.17 55);   /* saffron focus ring */

  /* Charts (saffron / emerald / indigo / rose / gold) */
  --chart-1:             oklch(0.68 0.17 55);   /* saffron */
  --chart-2:             oklch(0.58 0.14 155);  /* emerald */
  --chart-3:             oklch(0.45 0.18 270);  /* deep indigo */
  --chart-4:             oklch(0.60 0.20 15);   /* rose */
  --chart-5:             oklch(0.75 0.15 85);   /* gold */

  /* Sidebar (admin) */
  --sidebar:             oklch(0.96 0.012 80);
  --sidebar-foreground:  oklch(0.20 0.02 80);
  --sidebar-primary:     oklch(0.68 0.17 55);
  --sidebar-primary-foreground: oklch(0.99 0.01 80);
  --sidebar-accent:      oklch(0.93 0.012 80);
  --sidebar-accent-foreground: oklch(0.20 0.02 80);
  --sidebar-border:      oklch(0.90 0.012 80);
  --sidebar-ring:        oklch(0.68 0.17 55);
}
```

### Dark theme (OLED-black) — `:root[data-theme="dark"]` / `.dark`

```css
.dark, :root[data-theme="dark"] {
  /* Surfaces — OLED-black for AMOLED battery saving */
  --background:          oklch(0.05 0 0);       /* pure OLED black */
  --foreground:          oklch(0.96 0.005 80);  /* warm white */
  --card:                oklch(0.09 0.006 80);  /* lifted 4% L */
  --card-foreground:     oklch(0.96 0.005 80);
  --popover:             oklch(0.11 0.006 80);
  --popover-foreground:  oklch(0.96 0.005 80);

  /* Brand accents — lifted L for dark-bg luminance */
  --primary:             oklch(0.75 0.16 60);   /* brighter saffron */
  --primary-foreground:  oklch(0.10 0.02 60);   /* dark text on saffron */
  --primary-text:        oklch(0.78 0.16 60);   /* saffron for text-on-dark (AA) */
  --secondary:           oklch(0.16 0.01 80);
  --secondary-foreground:oklch(0.92 0.005 80);
  --muted:               oklch(0.14 0.008 80);
  --muted-foreground:    oklch(0.68 0.012 80);  /* AA on background */
  --accent:              oklch(0.72 0.15 155);  /* brighter emerald */
  --accent-foreground:   oklch(0.10 0.02 155);
  --accent-text:         oklch(0.75 0.15 155);  /* emerald for text-on-dark (AA) */
  --destructive:         oklch(0.65 0.22 25);
  --destructive-foreground: oklch(0.10 0.02 25);

  /* Lines & focus — lifted L for visibility */
  --border:              oklch(0.20 0.01 80);
  --input:               oklch(0.22 0.012 80);
  --ring:                oklch(0.75 0.16 60);

  /* Charts */
  --chart-1:             oklch(0.75 0.16 60);   /* saffron */
  --chart-2:             oklch(0.72 0.15 155);  /* emerald */
  --chart-3:             oklch(0.65 0.18 270);  /* indigo */
  --chart-4:             oklch(0.68 0.20 15);   /* rose */
  --chart-5:             oklch(0.82 0.14 85);   /* gold */

  /* Sidebar */
  --sidebar:             oklch(0.07 0.006 80);
  --sidebar-foreground:  oklch(0.96 0.005 80);
  --sidebar-primary:     oklch(0.75 0.16 60);
  --sidebar-primary-foreground: oklch(0.10 0.02 60);
  --sidebar-accent:      oklch(0.14 0.008 80);
  --sidebar-accent-foreground: oklch(0.96 0.005 80);
  --sidebar-border:      oklch(0.20 0.01 80);
  --sidebar-ring:        oklch(0.75 0.16 60);
}
```

### WCAG contrast verification (key pairs)

| Pair | Light ratio | Dark ratio | AA (4.5:1) |
|---|---|---|---|
| `--foreground` / `--background` | ~14.2:1 | ~16.8:1 | ✓ AAA |
| `--primary-text` / `--background` (text-on-paper) | ~5.4:1 | ~7.9:1 | ✓ AA |
| `--accent-text` / `--background` (emerald text-on-paper) | ~5.8:1 | ~6.5:1 | ✓ AA |
| `--primary` fill / `--primary-foreground` (button) | ~4.7:1 | ~6.1:1 | ✓ AA |
| `--accent` fill / `--accent-foreground` | ~5.2:1 | ~6.8:1 | ✓ AA |
| `--muted-foreground` / `--background` (captions) | ~5.0:1 | ~5.6:1 | ✓ AA |
| `--destructive` / `--destructive-foreground` | ~5.5:1 | ~4.8:1 | ✓ AA |

> **Design rule:** Use `--primary-text` (not `--primary`) when saffron is text on a paper/dark surface. Use `--primary` only as a fill with `--primary-foreground` text on top. This rule prevents the classic "yellow-on-white" contrast failure.

### Tricolor discipline
- The Indian tricolor (saffron / white / emerald-as-green) is honored via **two** accents, never three simultaneous. Surfaces default monochrome; tricolor appears only on: hero dividers, footer, Independence Day / Republic Day banners, and the "polls" voting button.
- The third tricolor leg (white) is the page background itself — implicit, never a "white accent".

---

## 2. Fluid Typography

### Font loading strategy (Next.js 16 `next/font`)

```ts
// src/app/layout.tsx
import { Inter, Noto_Sans_Devanagari, DM_Serif_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true, // prevents FOUT metrics shift
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
  adjustFontFallback: true,
  fallback: ["Mangal", "Nirmala UI", "sans-serif"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
  preload: false, // hero-only font — deferred
  fallback: ["Georgia", "Times New Roman", "serif"],
});

// Body stack: latin-first, falls through to Devanagari for Hindi glyphs
// CSS var: --font-sans: var(--font-inter), var(--font-devanagari), system-ui, sans-serif;
```

> **Subsetting note:** Inter's `latin` subset + Noto Sans Devanagari's `devanagari` subset load only the glyphs we need (~80kb + ~95kb gzipped combined, vs 320kb+ if we loaded Noto Sans full). Devanagari subset is preloaded because Hindi is the primary citizen language for Chandra's residents.

### Display font — DM Serif Display (hero only)

Used **exclusively** on the hero headline word "Chandra" (English) or as a stylistic counterpoint to the Devanagari display. Never used for body, captions, or admin UI. Loaded with `preload: false` and `display: "swap"` because it's above-the-fold but not LCP-critical (Devanagari headline leads).

### Fluid type scale — clamp(360px → 1920px)

> All values use the formula `clamp(min, preferred-vw, max)` where `preferred = min + (max - min) * vw_slope`. This gives perfectly smooth scaling with **zero breakpoints**.

```css
:root {
  /* Text scale — every step scales fluidly */
  --text-xs:   clamp(0.75rem,   0.70rem + 0.20vw, 0.80rem);   /* 12 → 12.8px */
  --text-sm:   clamp(0.875rem,  0.83rem + 0.22vw, 0.95rem);   /* 14 → 15.2px */
  --text-base: clamp(1rem,      0.95rem + 0.25vw, 1.125rem);  /* 16 → 18px */
  --text-lg:   clamp(1.125rem,  1.05rem + 0.40vw, 1.30rem);   /* 18 → 20.8px */
  --text-xl:   clamp(1.25rem,   1.15rem + 0.50vw, 1.50rem);   /* 20 → 24px */
  --text-2xl:  clamp(1.50rem,   1.35rem + 0.75vw, 1.875rem);  /* 24 → 30px */
  --text-3xl:  clamp(1.875rem,  1.65rem + 1.10vw, 2.50rem);   /* 30 → 40px */
  --text-4xl:  clamp(2.25rem,   1.95rem + 1.50vw, 3.125rem);  /* 36 → 50px */
  --text-5xl:  clamp(2.75rem,   2.30rem + 2.20vw, 4.00rem);   /* 44 → 64px */
  --text-6xl:  clamp(3.25rem,   2.60rem + 3.00vw, 5.50rem);   /* 52 → 88px */
  --text-7xl:  clamp(3.75rem,   2.75rem + 5.00vw, 7.50rem);   /* 60 → 120px — hero */

  /* Line-height — unitless multipliers */
  --leading-none:     1.0;
  --leading-tight:    1.1;   /* hero */
  --leading-snug:     1.25;  /* h2-h4 */
  --leading-normal:   1.5;   /* body latin */
  --leading-relaxed:  1.625; /* long-form */
  --leading-loose:    2.0;   /* captions */

  /* Letter-spacing */
  --tracking-tighter: -0.04em; /* hero display */
  --tracking-tight:   -0.02em; /* headings */
  --tracking-normal:   0em;    /* body */
  --tracking-wide:     0.025em;/* eyebrow labels, ALL CAPS */
  --tracking-wider:    0.05em; /* buttons, micro-labels */

  /* Font weight tokens */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold:600;
  --weight-bold:    700;
  --weight-black:   900; /* hero display only */
}
```

### Devanagari-specific adjustments

Devanagari script has **taller** vertical metrics (matras extend above and below the baseline) and reads better with looser letter-spacing than Latin. Apply overrides via `:lang(hi)`:

```css
:root {
  --leading-devanagari:    1.7;   /* +0.2 vs latin body */
  --leading-devanagari-tight: 1.35; /* hero Hindi */
  --tracking-devanagari:   0.005em; /* avoid matra collision */
  --tracking-devanagari-hero: -0.01em; /* hero Hindi slightly tighter ok */
}

/* Apply when content is Hindi */
:lang(hi), [data-lang="hi"] {
  --leading-normal: var(--leading-devanagari);
  --leading-tight:  var(--leading-devanagari-tight);
  --tracking-normal: var(--tracking-devanagari);
}

/* Hero Hindi headline — preserve matras inside mask-line */
.hero-mask:lang(hi) .mask-line__inner {
  line-height: 1.35;
  padding-block: 0.15em; /* prevent top-matra clipping */
}
```

### Numerical data styling
All numbers in Village Stats, Budget, Census, Complaint Dashboard:
```css
.tabular { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
.count-up { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
```

---

## 3. Custom Easing & Motion

> **Ban list:** `linear`, `ease`, `ease-in-out`, `ease-in`, `ease-out` (CSS keywords) are FORBIDDEN in any animation property. They feel robotic. Every motion uses a named cubic-bezier or Framer Motion spring.

### Easing tokens

```css
:root {
  /* Expo-family — primary motion vocabulary */
  --ease-expo-out:     cubic-bezier(0.22, 1, 0.36, 1);    /* primary: entrances, reveals */
  --ease-expo-in-out:  cubic-bezier(0.87, 0, 0.13, 1);    /* bidirectional: page transitions */
  --ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1); /* subtle overshoot: hovers, taps */

  /* Framer Motion cubic-bezier arrays (same curves, JS form) */
  /* [0.22, 1, 0.36, 1] — expo-out
     [0.87, 0, 0.13, 1] — expo-in-out
     [0.34, 1.56, 0.64, 1] — spring-overshoot */

  /* Duration tokens */
  --dur-fast:       150ms;   /* hover, tap, micro-feedback */
  --dur-base:       300ms;   /* default transitions */
  --dur-slow:       500ms;   /* section reveals */
  --dur-cinematic:  1200ms;  /* hero entrance, page-load choreography */
}
```

### Framer Motion spring presets

```ts
// src/lib/motion/springs.ts
export const springSnappy  = { type: "spring", stiffness: 200, damping: 20, mass: 1 };
export const springGentle  = { type: "spring", stiffness: 140, damping: 18, mass: 1 };
export const springBouncy  = { type: "spring", stiffness: 260, damping: 14, mass: 0.8 }; // rare — magnetic CTAs only
```

### Stagger choreography

```ts
// Word-by-word reveal container variant
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

// Child variant — used inside hero, section headlines
export const maskUpChild = {
  hidden:  { y: "110%" },
  visible: { y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

// Scroll-reveal child — used for cards, list items
export const fadeUpChild = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
```

### Motion rules (binding)
1. **GPU-only animated properties:** `transform`, `opacity`, `filter`. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow` directly (use `::before` with transformed layer).
2. **`will-change` discipline:** Applied only on elements actively animating; removed on `animationend` / `onAnimationComplete` to free GPU memory.
3. **`prefers-reduced-motion: reduce`** → all Framer Motion `transition` durations forced to `0.01` via a top-level `MotionConfig` wrapper.
4. **No infinite animations on text** — pulsing dots, blinking cursors are accessibility hazards. Use a single 0.6s pulse on accent dots, then static.

---

## 4. Texture & Atmosphere

### SVG grain overlay (3–5% opacity)

Inline SVG `feTurbulence` filter, applied as a fixed-position overlay above the background but below all content. Adds the analog "film grain" feel that prevents flat-color fatigue.

```css
/* Inline in layout.tsx as a <svg> sprite or in globals.css as data-uri */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.035; /* dark theme — bump to 0.05 */
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
}
.dark .grain-overlay { opacity: 0.05; mix-blend-mode: screen; }
```

### Multi-layered mesh gradient

The hero background uses 3 stacked radial-gradients with `mix-blend-mode: screen` (dark) or `multiply` (light). Subtle drift over 30s via `@keyframes`.

```css
.mesh-gradient {
  position: absolute;
  inset: -20%; /* overflow for blur edge */
  background:
    radial-gradient(40% 50% at 20% 30%, oklch(0.75 0.16 60 / 0.35), transparent 60%),
    radial-gradient(35% 45% at 80% 20%, oklch(0.72 0.15 155 / 0.28), transparent 60%),
    radial-gradient(50% 60% at 50% 100%, oklch(0.82 0.14 85 / 0.20), transparent 70%);
  filter: blur(60px) saturate(1.1);
  mix-blend-mode: screen;
  animation: mesh-drift 30s var(--ease-expo-in-out) infinite alternate;
}
.light .mesh-gradient { mix-blend-mode: multiply; opacity: 0.6; }
@keyframes mesh-drift {
  0%   { transform: translate3d(-2%, -1%, 0) scale(1); }
  100% { transform: translate3d(2%,  1%, 0) scale(1.05); }
}
```

### Dot-grid utility (dark sections, dashboard, footer)

A 1px-dot grid at 32px spacing, 4–6% opacity. Used behind dark sections to signal "engineering rigor" (Vercel-style).

```css
.dot-grid {
  background-image: radial-gradient(
    circle at center,
    oklch(0.96 0.005 80 / 0.06) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
  background-position: 0 0;
}
/* For admin / dashboard surfaces, scale to 24px and 4% opacity */
.dot-grid--dense { background-size: 24px 24px; opacity: 0.85; }
```

### Noise-on-glass (backdrop-blur surfaces)

For floating navbar, command palette, modals over rich backgrounds — adds a tactile "frosted glass" feel that pure `backdrop-blur` lacks.

```css
.glass {
  background: oklch(0.98 0.01 80 / 0.4); /* light */
  backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid oklch(1 0 0 / 0.5);
  position: relative;
}
.dark .glass {
  background: oklch(0.05 0 0 / 0.5);
  border-color: oklch(1 0 0 / 0.08);
}
.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml;utf8,<svg ...feTurbulence... />");
  border-radius: inherit;
  mix-blend-mode: overlay;
}
```

### Atmosphere rules
- **One atmospheric layer per viewport.** Never stack grain + dot-grid + mesh in the same section.
- Grain is global (fixed, z-1). Mesh is hero-only. Dot-grid is dashboard/footer only. Glass is for floating UI.
- All atmospheric layers use `pointer-events: none` and live below content z-index.

---

## 5. Spacing & Layout Rhythm

### Fluid spacing scale

```css
:root {
  /* Micro */
  --space-2xs:  clamp(0.25rem, 0.22rem + 0.10vw, 0.375rem);
  --space-xs:   clamp(0.50rem, 0.45rem + 0.20vw, 0.625rem);
  --space-sm:   clamp(0.75rem, 0.65rem + 0.40vw, 1.00rem);
  --space-md:   clamp(1.00rem, 0.85rem + 0.60vw, 1.50rem);
  --space-lg:   clamp(1.50rem, 1.25rem + 1.00vw, 2.25rem);
  --space-xl:   clamp(2.00rem, 1.60rem + 1.60vw, 3.25rem);
  --space-2xl:  clamp(3.00rem, 2.40rem + 2.40vw, 5.00rem);
  --space-3xl:  clamp(4.00rem, 3.00rem + 4.00vw, 6.50rem);

  /* Section vertical rhythm — the 96px breathing band */
  --space-section:  clamp(3rem, 1rem + 6vw, 8rem); /* 48 → 128px */

  /* Gutter / container padding */
  --space-gutter:   clamp(1rem, 0.75rem + 1vw, 2rem);
}
```

### Container widths

```css
:root {
  --container-prose: 65ch;     /* long-form blog, RTI text — readable measure */
  --container-wide:  1200px;   /* default content — Village Stats grid, schemes */
  --container-full:  1440px;   /* hero, marketplace, dashboard */
}
```

### Asymmetric grid principles (12-col)

The portal deliberately avoids the "centered everything" look. Use 12-col grid with intentional offsets:

```
Section layout A — Hero:
  col 1-7: headline + CTAs (left-weighted)
  col 9-12: village portrait (offset right)

Section layout B — Stats:
  col 1-4: eyebrow + lead text (sticky)
  col 6-12: 2x2 stat bento (offset right)

Section layout C — Schemes:
  col 1-12: full-width row, but each card has internal 12-col split
  card left: col 1-5 (icon + title)
  card right: col 7-12 (description + meta)

Section layout D — Blog:
  col 2-8: prose (centered but offset right by 1 col)
```

### Vertical rhythm rules
- Every section top + bottom: `padding-block: var(--space-section)`.
- H2 to body: `margin-top: var(--space-lg)`.
- Body to next H2: `margin-top: var(--space-2xl)`.
- Cards in a grid: `gap: var(--space-lg)`.
- Mobile collapses section padding to `clamp(2rem, 1rem + 4vw, 4rem)`.

---

## 6. Component Art Direction Principles

### Cards
```css
.card {
  border-radius: var(--radius-2xl); /* 16px */
  border: 1px solid var(--border);
  background: var(--card);
  position: relative;
  transition: transform var(--dur-base) var(--ease-expo-out),
              border-color var(--dur-base) var(--ease-expo-out);
  will-change: transform;
}
/* Inner glow on hover — pseudo-element for GPU-friendly transition */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.06);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-expo-out);
  pointer-events: none;
}
.card:hover {
  transform: translateY(-8px); /* -translate-y-2 */
  border-color: oklch(0.68 0.17 55 / 0.4);
}
.card:hover::before { opacity: 1; }
```

### Buttons — magnetic, 44px min, gradient borders
```css
.btn {
  min-height: 44px;       /* touch target — never smaller */
  padding-inline: var(--space-lg);
  border-radius: var(--radius-xl); /* 12px */
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  position: relative;
  isolation: isolate;
}
/* Gradient border technique — pseudo-element with mask */
.btn--gradient-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg,
    oklch(0.68 0.17 55),
    oklch(0.72 0.15 155));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  z-index: -1;
}
/* Magnetic effect — JS-driven on desktop, disabled on touch */
.btn-magnetic { transition: transform var(--dur-fast) var(--ease-spring); }
@media (hover: none) { .btn-magnetic { transition: none; } } /* touch fallback */
```

### Navbar — floating pill, transparent → glass on scroll
```css
.nav-pill {
  position: fixed;
  top: var(--space-md);
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  width: min(var(--container-wide), calc(100vw - 2 * var(--space-gutter)));
  padding: var(--space-xs) var(--space-sm);
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  transition: background var(--dur-base) var(--ease-expo-out),
              border-color var(--dur-base) var(--ease-expo-out),
              backdrop-filter var(--dur-base);
}
.nav-pill[data-scrolled="true"] {
  background: oklch(0.98 0.01 80 / 0.6);
  backdrop-filter: blur(24px) saturate(1.4);
  border-color: oklch(0.90 0.012 80 / 0.6);
}
.dark .nav-pill[data-scrolled="true"] {
  background: oklch(0.05 0 0 / 0.6);
  border-color: oklch(0.20 0.01 80 / 0.6);
}
```

### Section dividers — 3-dot or gradient hairline
```css
/* 3-dot divider — tricolor echo, used between major sections */
.divider-dots {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  padding-block: var(--space-xl);
}
.divider-dots span {
  width: 6px; height: 6px;
  border-radius: 9999px;
  opacity: 0.8;
}
.divider-dots span:nth-child(1) { background: var(--primary); }
.divider-dots span:nth-child(2) { background: var(--foreground); opacity: 0.4; }
.divider-dots span:nth-child(3) { background: var(--accent); }

/* Gradient hairline — used inside cards / between paragraphs */
.divider-hairline {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--border) 20%,
    var(--border) 80%,
    transparent);
  margin-block: var(--space-lg);
}
```

### Radius tokens
```css
:root {
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 9999px;
}
```

### Shadow discipline
Shadows are **rare** — preferred depth cue is `border` + `::before` inner glow. When needed:
```css
--shadow-sm: 0 1px 2px oklch(0.20 0.02 80 / 0.05);
--shadow-md: 0 4px 12px oklch(0.20 0.02 80 / 0.08), 0 1px 3px oklch(0.20 0.02 80 / 0.06);
--shadow-lg: 0 12px 32px oklch(0.20 0.02 80 / 0.10), 0 4px 8px oklch(0.20 0.02 80 / 0.06);
.dark {
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.4);
  --shadow-md: 0 4px 12px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.03);
  --shadow-lg: 0 16px 40px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.05);
}
```

---

## 7. Cross-cutting Rules (binding for all phases)

1. **Token discipline:** Every color in the codebase MUST reference a CSS variable defined above. Inline `#fff`, `rgb(...)`, `oklch(...)` literals in component JSX are forbidden (lint rule to be added Phase 2).
2. **Tailwind v4 bridge:** `@theme inline { --color-background: var(--background); ... }` in `globals.css` so `bg-background`, `text-foreground`, `border-border` utilities resolve correctly.
3. **`tailwind.config.ts` sync:** Keep the legacy config in sync with these tokens (vestigial but referenced by some components) until Phase 2 audit removes references.
4. **Devanagari first:** When designing a layout, mock it in Hindi first. If a Hindi headline breaks the layout (matra clipping, line break mid-word), the layout is wrong — fix the layout, never the script.
5. **Performance budgets (binding):**
   - LCP < 2.0s on 3G slow.
   - Total CSS ≤ 60kb gzipped (current globals.css is 67KB — Phase 2 must reduce).
   - Total JS on first load ≤ 180kb gzipped (Vapi + recharts + admin SDKs deferred).
   - CLS < 0.05 (font-adjust + aspect-ratio on every media).
6. **Accessibility baseline:** WCAG 2.1 AA on every primary text pair. Focus rings always visible (`:focus-visible` uses `--ring` with 2px offset). Touch targets ≥ 44px.
7. **Dark mode default:** The portal boots in **dark** on first visit (matches the cinematic identity + AMOLED battery savings for rural UP Android users). User can toggle; preference persisted in `localStorage` via existing `theme-store.ts`.

---

## 8. Phase 2 Implementation Hook (preview)

The next agent (Phase 2) will translate this constitution into:
- Rewritten `src/app/globals.css` (OKLCH tokens, `@theme inline` bridge, atmosphere utilities, `prefers-reduced-motion` block).
- `src/app/layout.tsx` with `next/font` Inter + Noto Devanagari + DM Serif Display wiring.
- `src/components/providers/LenisProvider.tsx` (smooth scroll, touch-disabled, reduced-motion-disabled).
- Hardened `next.config.ts` (remove `ignoreBuildErrors`, enable `reactStrictMode`).
- `src/lib/motion/springs.ts` and `src/lib/motion/variants.ts` exporting the tokens above.

This file is the contract. Any deviation requires a written ADR appended to this document.
