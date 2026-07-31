"use client";

/**
 * LenisProvider — smooth-scroll provider (DESIGN_INTELLIGENCE §2 Phase 2 hook).
 *
 * CRITICAL mobile rules:
 *  - DISABLED on touch devices (`(hover: hover)` media query) to preserve
 *    native mobile momentum scrolling (zero-lag on low-end Android).
 *  - DISABLED when `prefers-reduced-motion: reduce` is set.
 *  - Only initialized on desktop with a fine pointer.
 *
 * Performance: Lenis uses a single rAF loop + transform on <html>. No scroll
 * listeners are attached to individual elements.
 */
import { useEffect, type ReactNode } from "react";

export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    // Touch device OR reduced-motion → skip Lenis entirely
    if (prefersReducedMotion || !hasHover || isCoarsePointer) return;

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let rafId = 0;

    // Dynamic import keeps Lenis out of the initial bundle on mobile
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
