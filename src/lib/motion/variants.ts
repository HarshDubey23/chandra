/**
 * Framer Motion variants — DESIGN_INTELLIGENCE §3 + SIGNATURE_MOMENT
 * GPU-only animated properties (transform, opacity, filter).
 */
import type { Variants } from "framer-motion";
import { ease, dur } from "./springs";

/** Stagger container — word-by-word / card-by-card reveal */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

/** Stagger container — slower, for hero choreography */
export const staggerContainerCinematic: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

/** Mask-up child — inner span translates 110% → 0 inside overflow:hidden */
export const maskUpChild: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: 0,
    transition: { duration: dur.cinematic, ease: ease.expoOut },
  },
};

/** Fade-up child — cards, list items, section content */
export const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: dur.slow, ease: ease.expoOut },
  },
};

/** Fade-in child — overlays, badges, non-directional */
export const fadeInChild: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.base, ease: ease.expoOut } },
};

/** Scale-up child — icons, emblems, decorative elements */
export const scaleUpChild: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: dur.slow, ease: ease.spring },
  },
};

/** whileInView viewport config — IntersectionObserver-backed */
export const viewportOnce = { once: true, margin: "-50px" } as const;
export const viewportOnceGenerous = { once: true, margin: "-100px" } as const;
