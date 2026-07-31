/**
 * Framer Motion spring presets — DESIGN_INTELLIGENCE §3
 * Ban `linear` / default `ease`. All motion uses these named curves.
 */
import type { Transition } from "framer-motion";

/** Snappy — primary UI feedback (taps, toggles, small hovers) */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 1,
};

/** Gentle — section reveals, card lifts, larger elements */
export const springGentle: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 18,
  mass: 1,
};

/** Bouncy — magnetic CTAs only (rare, deliberate overshoot) */
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 14,
  mass: 0.8,
};

/** Cubic-bezier easings in Framer Motion array form */
export const ease = {
  expoOut: [0.22, 1, 0.36, 1] as const,
  expoInOut: [0.87, 0, 0.13, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

/** Duration tokens (seconds for Framer Motion) */
export const dur = {
  fast: 0.15,
  base: 0.3,
  slow: 0.5,
  cinematic: 1.2,
};
