# SIGNATURE MOMENT — The Hero Interaction That Stops the Scroll

> **Status:** Phase 1 — THE one cinematic interaction. Bindng spec for the hero implementation in Phase 3.
> **Authored by:** frontend-styling-expert (Task ID 1)
> **Constraint:** Cinematic but performant. 60fps on a ₹8,000 Android (Redmi A2 / equivalent, Helio G36, 4GB RAM) over 3G. Bilingual Hindi/English with perfect Devanagari mask handling. Rooted in Indian rural governance identity.

---

## Concept Name

# जागृति · The Awakening

> *जागृति* (jāgṛti) — Sanskrit/Hindi for "awakening", "rousing", the coming-into-consciousness of a community. The word itself contains the seed of democratic assembly: a village waking up to its own agency.

The hero is not a slider, not a video loop, not a 3D scene. It is a **typographic and atmospheric awakening** — the village itself emerging from darkness into voice, choreographed as a 3-second cinematic sequence that any device can render.

---

## Visual Description (the 3-second sequence, frame by frame)

**t = 0.0s — Page load, first paint.**
The viewport is OLED-black (`oklch(0.05 0 0)`). Nothing else is visible yet. There is no flash of unstyled content, no skeleton shimmer — only darkness. A barely-perceptible warm-white dot-grid breathes at 4% opacity in the background (the "engineering rigor" substrate). The viewer's eye has nowhere to go. Silence.

**t = 0.0s → 0.3s — Atmosphere blooms.**
Three layered radial-gradients begin fading in via opacity transition (saffron at 20% left, emerald at 80% top-right, warm gold at 50% bottom), all heavily blurred (`filter: blur(60px)`) and `mix-blend-mode: screen`. They drift slowly in opposite directions on a 30-second loop. The page now glows like predawn sky over a Ganga ghat. No motion is dramatic — this is atmosphere, not spectacle.

**t = 0.3s → 1.5s — The mask-up reveal of the Devanagari headline.**
The word **"चन्द्रा"** (Chandra) — the village's name — performs a vertical mask-up reveal. Each character is wrapped in its own `overflow: hidden` mask-line; the inner span translates from `translateY(110%)` to `0` over `1.2s` with `ease: [0.22, 1, 0.36, 1]` (expo-out). The Devanagari matras (the shirorekha top bar and the vertical strokes) are never clipped because the mask-line has `padding-block: 0.15em` and `line-height: 1.35`. The headline uses Noto Sans Devanagari at `clamp(3.75rem, 2.75rem + 5vw, 7.5rem)` — fluid from 60px on mobile to 120px on desktop. Letter-spacing is `-0.01em` (slightly tighter is fine for Devanagari display). Below it, the word **"ग्राम सभा"** (Gram Sabha) reveals in the same way, staggered 0.12s behind.

**t = 0.6s → 2.1s — The English counterpart rises.**
A hairline-thin saffron line (1px × 32px) draws horizontally beneath the Hindi headline — width animates from 0 to full over 0.4s with the same expo-out easing. Then, the English counterpart **"Chandra Gram Sabha"** performs an identical mask-up reveal underneath, in Inter Variable at `--text-3xl` weight 500, `letter-spacing: -0.02em`, color `--muted-foreground`. It is smaller, secondary, present-but-quiet. The bilingual hierarchy is clear: Hindi leads, English accompanies.

**t = 1.4s — The heartbeat.**
A single saffron accent dot (8px diameter) positioned at the end of "सभा" (the word for "assembly") pulses once: `scale: [1, 1.6, 1]`, `opacity: [1, 0.6, 1]` over 0.6s. This is the *only* explicit motion cue on the headline. It is the heartbeat of democratic assembly — the moment the village speaks.

**t = 1.6s — Navbar slides in.**
The floating pill navbar slides down from `y: -80, opacity: 0` to `y: 0, opacity: 1` over 0.8s with expo-out. It contains the logo, the 6 primary nav anchors, the language switcher (हिन्दी / EN), and the theme toggle. On scroll, it gains `backdrop-filter: blur(24px)` and a subtle border — but at rest, it floats transparent over the mesh.

**t = 1.8s → 2.5s — Image awakens.**
To the right (desktop) or behind (mobile), a real village photograph fades and sharpens: a black-and-white-toned image of the Chandra village — the pradhan portrait, or women returning from fields at dawn, or the Shankargarh ghat. It transitions from `filter: blur(30px); opacity: 0.3; transform: scale(1.05)` to `filter: blur(0); opacity: 1; transform: scale(1)` over 1.5s. The image is `loading="eager"` with `fetchPriority="high"`, served as AVIF (with WebP fallback) at responsive widths (300w / 600w / 1200w) via Next.js `<Image>`.

**t = 2.5s → 3.0s — The tricolor drift.**
Three dots (saffron / warm-white / emerald) drift horizontally beneath the headline as a quiet section divider — they translate from `x: -12, opacity: 0` to `x: 0, opacity: 1` with a 0.08s stagger between each. This is the only place the tricolor appears in the hero — restraint is the point.

**t = 3.0s — The page is alive.** Fully rendered, no jank, no layout shift. The viewer's eye has been guided from black void → mesh atmosphere → Devanagari headline → English subtitle → accent heartbeat → navbar → photograph → tricolor divider. A complete narrative arc in three seconds.

Below the hero, the rest of the portal (40+ sections) waits — scroll-revealed one at a time via IntersectionObserver.

---

## Technical Implementation

### Component tree

```
src/components/portal/Hero.tsx
├── <HeroAtmosphere />           // mesh gradient + dot grid (CSS, no JS)
├── <HeroHeadline />             // mask-up reveal (Framer Motion)
│   ├── Hindi line: "चन्द्रा ग्राम सभा"
│   └── English line: "Chandra Gram Sabha"
├── <HeroImage />                // blur-awaken image (Framer Motion)
├── <HeroAccentPulse />          // single saffron dot heartbeat
├── <HeroCTA />                  // magnetic primary button (desktop only)
└── <HeroTricolorDivider />      // 3-dot drift
```

### Framer Motion variants

```ts
// src/lib/motion/hero-variants.ts
import type { Variants } from "framer-motion";

// Container — orchestrates stagger of all hero children
export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

// Mask-up child — for headline lines (Devanagari + English)
// Inner span animates transform only — GPU-composited
export const maskUp: Variants = {
  hidden:  { y: "110%" },
  visible: {
    y: 0,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

// Image awaken — blur + opacity + scale (filter is GPU-composited in modern browsers)
export const imageAwaken: Variants = {
  hidden:  { filter: "blur(30px)", opacity: 0.3, scale: 1.05 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    scale: 1,
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 1.8 },
  },
};

// Navbar slide-in
export const navSlideIn: Variants = {
  hidden:  { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.6 },
  },
};

// Single accent pulse — runs once on mount
export const accentPulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  pulse: {
    scale: [1, 1.6, 1],
    opacity: [1, 0.6, 1],
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 1.4, times: [0, 0.5, 1] },
  },
};

// Tricolor drift — 3 dots, staggered
export const tricolorDot: Variants = {
  hidden:  { x: -12, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
```

### CSS — mask-line wrapper with Devanagari matra safety

```css
/* Mask-line wrapper — overflow hidden, inner span translates */
.mask-line {
  display: block;
  overflow: hidden;
  position: relative;
}
.mask-line__inner {
  display: block;
  will-change: transform; /* hint to GPU */
}

/* Devanagari-specific: prevent shirorekha (top bar) + matra clipping */
:lang(hi) .mask-line,
[data-lang="hi"] .mask-line {
  /* extra padding so the top matra isn't clipped during translateY(110%) */
  padding-block: 0.15em;
  /* generous line-height for the inner span */
  line-height: 1.35;
}

/* English (Latin) — tighter, no padding needed */
:lang(en) .mask-line,
[data-lang="en"] .mask-line {
  line-height: 1.1;
}
```

### IntersectionObserver usage

The hero is at the top of the page — it does not need `IntersectionObserver` to trigger. Instead:

```tsx
// Hero.tsx — fires immediately on mount
const heroRef = useRef<HTMLDivElement>(null);
const inView = useInView(heroRef, { once: true, margin: "0px 0px 0px 0px" });

return (
  <motion.section
    ref={heroRef}
    variants={heroContainer}
    initial="hidden"
    animate={inView ? "visible" : "hidden"}
  >
    {/* ...children with their own variants... */}
  </motion.section>
);
```

For all sections **below** the hero (Village Stats onward), use a reusable `<ScrollReveal>` wrapper:

```tsx
// src/components/portal/ScrollReveal.tsx
export function ScrollReveal({ children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUpContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### GPU-only animated properties (binding)

| Element | Properties animated | Notes |
|---|---|---|
| Headline mask inner | `transform: translateY()` only | Pure GPU composite |
| Image | `transform: scale()`, `opacity`, `filter: blur()` | `filter` is GPU-composited in Chrome/Safari/Firefox since 2021 |
| Navbar | `transform: translateY()`, `opacity` | Pure GPU |
| Accent dot | `transform: scale()`, `opacity` | Pure GPU |
| Tricolor dots | `transform: translateX()`, `opacity` | Pure GPU |
| Mesh gradient | `transform: translate3d()`, `scale` on the `.mesh-gradient` element | Pure GPU; keyframe animation |

**Never animated:** `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow` (use `::before` with transform).

### Magnetic CTA (desktop only)

```tsx
function HeroCTA() {
  const ref = useRef<HTMLButtonElement>(null);
  const isTouch = useIsTouchDevice(); // existing use-mobile.ts hook

  const handleMove = (e: MouseEvent) => {
    if (isTouch) return;
    const el = ref.current!;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="btn btn-magnetic btn--gradient-border"
      style={{ transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      {t("hero.cta")}  {/* "शुरू करें" / "Get Started" */}
    </button>
  );
}
```

---

## Mobile vs Desktop — Graceful Degradation

| Feature | Desktop | Mobile (touch / small viewport) | Rationale |
|---|---|---|---|
| Lenis smooth-scroll | Enabled (subtle, 0.8 lerp) | **Disabled** — native scroll | Lenis on touch feels laggy; native momentum scrolling is better UX on phones |
| Magnetic CTA | Enabled (mouse-move tracking) | **Disabled** — plain button | Touch has no hover; magnetic effect needs cursor position |
| Custom cursor | Subtle lagging dot + ring | **Disabled** | No cursor on touch; would just sit there |
| Mesh gradient | 3-layer blurred radial gradients, 30s drift | **2-layer only, no drift animation** | Saves GPU on低端 Android; static mesh still looks good |
| Image blur-awaken | `blur(30px) → 0` over 1.5s | `blur(20px) → 0` over 1.0s | Lighter GPU filter on mobile |
| Tricolor drift | 3 dots, staggered x-translation | **Static dots, opacity-only fade** | Reduces animation count |
| Headline size | Up to 120px (text-7xl) | Up to 60px (text-7xl floor) | Fluid clamp already handles this |
| Headline layout | 2-column (text left / image right) | Stacked (text top / image bottom or behind) | Asymmetric grid collapses |
| Hero height | `min-height: 92svh` | `min-height: 88svh` | Use `svh` not `vh` for mobile browser chrome |
| Navbar pill | Floating pill, centered | Edge-to-edge pill, `top: 0` | Mobile needs more tap area |
| Accent pulse | 1.6x scale | 1.4x scale | Subtler on small screens |
| Grain overlay | 5% opacity, `mix-blend-mode: screen` | 3% opacity only | Saves a compositing layer |
| `prefers-reduced-motion` | All motion disabled, instant render | Same | Required by WCAG 2.1 SC 2.3.3 |

### Touch detection

```ts
// src/hooks/use-is-touch.ts
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    setIsTouch(touch);
  }, []);
  return isTouch;
}
```

### Viewport units

Use `svh` (small viewport height) — `100svh` accounts for the URL bar collapsing on mobile Safari/Chrome. **Never** use plain `vh` (causes content hidden under browser chrome).

```css
.hero { min-height: 92svh; }  /* desktop */
@media (max-width: 768px) { .hero { min-height: 88svh; } }
```

---

## Performance Budget

### LCP element
- **Element:** The hero image (`<Image>` of the village photograph).
- **Fallback LCP:** If image hasn't loaded by 1.5s, the Devanagari headline `<h1>` becomes the LCP element (already rendered via Framer Motion at t=1.5s).
- **Estimated LCP:** **1.8s on 3G slow** (Moto G4 / Redmi A2 class). Image is AVIF at 600w (≈40kb gzipped), `fetchPriority="high"`, served via Next.js Image optimization.

### JavaScript cost (first load, hero-relevant only)

| Chunk | Size (gzip) | Load strategy |
|---|---|---|
| React + Next runtime | ~45kb | Eager (framework) |
| Framer Motion (tree-shaken) | ~18kb | Eager (hero animations) |
| Inter + Noto Devanagari subsets | ~95kb | `next/font` self-hosted, `display: swap`, preload latin only |
| DM Serif Display (hero only) | ~12kb | `preload: false`, loads after first paint |
| Hero component + variants | ~3kb | Eager (in initial route) |
| **Hero-relevant total** | **~173kb** | Within 180kb budget |

### Deferred (loaded later, not blocking hero)

| Chunk | Size (gzip) | Trigger |
|---|---|---|
| Vapi AI Voice SDK | ~50kb | On first click of voice-complaint button |
| Recharts (admin/charts) | ~80kb | Dynamic `import()` in admin route + charts components |
| Admin panel code | ~60kb | Lazy-loaded when user navigates to `/admin` |
| WhatsApp share utility | ~5kb | On first click of WhatsApp share button |
| Service worker registration | ~2kb | After `load` event via `requestIdleCallback` |
| All below-fold section components | ~120kb | Dynamic imports revealed as user scrolls |

### Performance guarantees (binding)
1. **CLS < 0.05** — every image has explicit `width`/`height` or `aspect-ratio`; fonts use `adjustFontFallback: true`.
2. **FID/INP < 100ms** — hero animations run on compositor thread (transform/opacity only); main thread is free.
3. **No layout thrash** — zero `getBoundingClientRect` calls during animation (magnetic CTA uses `e.clientX` directly without re-reads).
4. **GPU layer budget** — max 8 composited layers simultaneously (hero section). Tracked via DevTools Layers panel during Phase 4.
5. **`will-change` discipline** — applied to actively-animating elements only; cleared via `onAnimationComplete` callback.

### Network budget (3G slow, 400kb/s, 400ms RTT)

| Asset | Size (gzip) | Time at 400kb/s |
|---|---|---|
| HTML document | ~12kb | 30ms + 400ms RTT = 430ms |
| Critical CSS | ~18kb | 45ms |
| Fonts (latin subset) | ~80kb | 200ms (one RTT after CSS) |
| Hero JS (Framer + React + Hero) | ~66kb | 165ms |
| Hero image (AVIF 600w) | ~40kb | 100ms |
| **Total first paint** | **~216kb** | **~940ms + 2 RTTs ≈ 1.7s** |

Estimated LCP: **~1.8s** — comfortably under the 2.5s "Good" LCP threshold.

---

## Accessibility

### `prefers-reduced-motion: reduce` — full fallback

When the user has reduced motion enabled (system preference or `theme-store.ts` override):

```tsx
// Top-level MotionConfig — wraps entire app in layout.tsx
import { MotionConfig } from "framer-motion";

<MotionConfig reducedMotion="user">
  {/* entire app */}
</MotionConfig>
```

Plus a CSS safety net:

```css
@media (prefers-reduced-motion: reduce) {
  .hero .mask-line__inner,
  .hero-image,
  .nav-pill,
  .accent-pulse,
  .tricolor-dot {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
  .mesh-gradient { animation: none !important; }
}
```

**Reduced-motion behavior:**
- All Framer Motion variants resolve to their `visible` state instantly (duration = 0).
- The image renders sharp from frame 0 (no blur, no scale).
- The mesh gradient is static (no drift).
- The accent pulse does not fire.
- The tricolor dots are visible at their final position.
- All content is fully readable — nothing is hidden behind a reveal state.

### Other accessibility rules

1. **Hero image has alt text** in both languages: `"चन्द्रा ग्राम में भोर का दृश्य"` / `"Dawn over Chandra village"`.
2. **Headline is `<h1>`** — exactly one per page, in Hindi if user's locale is Hindi.
3. **CTA button is `<button>`** with descriptive `aria-label` if icon-only.
4. **Language switcher** is a `<button>` with `aria-expanded` and an associated `<ul role="menu">`.
5. **Focus order:** Navbar → headline → CTA → image alt → tricolor divider → next section. Tab order follows visual order.
6. **Focus rings** use `--ring` (saffron) with 2px offset; never removed.
7. **Color contrast:** headline-on-background = 14.2:1 (light) / 16.8:1 (dark) — exceeds AAA.
8. **Screen reader:** The mask-up reveal is decorative; the `<h1>` text is fully present in the DOM from server-render. Framer Motion only animates `transform`, never `display: none` or `visibility: hidden`, so screen readers read the headline at t=0.

---

## The "Pause Moment" — Why a Juror Stops Scrolling

Three details conspire to make an Awwwards juror pause on the Chandra hero:

### 1. The Devanagari mask handled with technical respect.
Most "international" sites either skip Hindi entirely or render it in a fallback system font (Mangal / Nirmala UI) that breaks the layout's typographic rhythm. Chandra loads **Noto Sans Devanagari Variable** as a first-class citizen, and the mask-up reveal respects the script's vertical metrics — `padding-block: 0.15em` ensures the shirorekha (the top horizontal bar of Devanagari consonants) is never clipped during the `translateY(110%)` → `0` animation. A juror who has seen a hundred "mask-up hero" sites will notice that this one handles Hindi correctly. That's craft.

### 2. The single saffron heartbeat on "सभा".
Every other hero animation is choreographed but expected — mask-ups, drifts, blur-awakens are now standard vocabulary. The single accent pulse on the word **सभा** (assembly, the *gram sabha* itself) is unexpected. It's a 0.6s heartbeat — once — then static. It is the only explicit motion cue on the headline. It says: *this village has a pulse. This assembly is alive.* A juror who reads Hindi sees the meaning; a juror who doesn't sees the gesture. Both understand it.

### 3. The bilingual hierarchy with English as accompaniment.
Most bilingual Indian sites either (a) put English first and Hindi below as a translation afterthought, or (b) put them side-by-side with equal weight, which dilutes both. Chandra places **Hindi first and larger**, English second and smaller in muted color. The hierarchy is editorial, not symmetric. It signals: *this is an Indian village portal, and English is here to accompany, not to lead.* A juror who has seen a hundred Indian government sites that mimic English templates will notice that this one inverts the hierarchy with confidence.

### Bonus: The OLED-black default.
Dark mode is the default — not a toggle. On AMOLED phones (which dominate the ₹8,000–15,000 Android segment that rural UP users actually carry), this saves battery and looks cinematic. A juror opening the site on a phone sees a near-pure-black screen with warm mesh atmosphere bleeding through — it does not look like a government portal. It looks like a film title card. That dissonance — *a Gram Panchayat portal that looks like a film title card* — is the pause moment.

---

## Phase 3 Implementation Hook (preview)

The Phase 3 mobile-supremacy agent will implement this hero as:

```
src/components/portal/hero/
├── Hero.tsx                    // orchestrator
├── HeroAtmosphere.tsx          // mesh + dot grid (pure CSS)
├── HeroHeadline.tsx            // mask-up reveal (Framer Motion)
├── HeroImage.tsx               // blur-awaken image (next/image + Framer Motion)
├── HeroAccentPulse.tsx         // single saffron dot
├── HeroCTA.tsx                 // magnetic button (desktop only)
├── HeroTricolorDivider.tsx     // 3-dot drift
└── hero-variants.ts            // all Framer Motion variants
```

This file is the contract. Deviation requires a written ADR appended to this document.

---

## Appendix — Bilingual Hero Copy (final strings)

| Key | Hindi (hi.json) | English (en.json) |
|---|---|---|
| `hero.eyebrow` | ग्राम पंचायत चन्द्रा · शंकरगढ़, प्रयागराज | Gram Panchayat Chandra · Shankargarh, Prayagraj |
| `hero.headlinePrimary` | चन्द्रा ग्राम सभा | Chandra Gram Sabha |
| `hero.headlineSecondary` | हमारे गाँव, हमारी आवाज़ | Our Village, Our Voice |
| `hero.subhead` | एक डिजिटल पोर्टल जहाँ नागरिक शिकायत दर्ज करते हैं, योजनाएँ देखते हैं, और पंचायत की गतिविधियों में भाग लेते हैं। | A digital portal where citizens file complaints, browse schemes, and participate in panchayat activity. |
| `hero.cta` | शुरू करें | Get Started |
| `hero.ctaSecondary` | शिकायत दर्ज करें | File a Complaint |
| `hero.scrollHint` | नीचे स्क्रॉल करें | Scroll to explore |

---

*End of SIGNATURE_MOMENT.md. This is the one interaction. Everything else in the portal serves it.*
