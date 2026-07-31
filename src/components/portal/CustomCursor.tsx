"use client";

/**
 * CustomCursor — desktop-only kinetic cursor (DESIGN_INTELLIGENCE §6 + Phase 3).
 *
 * - Small dot that tracks the pointer with a spring.
 * - Scales up + mix-blend-mode: difference on hover over interactive elements.
 * - COMPLETELY DISABLED on touch devices (`(hover: hover)` guard).
 * - DISABLED when prefers-reduced-motion is set.
 * - Uses a single rAF loop + transform (GPU-only). No layout thrash.
 */
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 28, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasHover = window.matchMedia("(hover: hover)").matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!hasHover || !isFinePointer || prefersReducedMotion) return;

    // Defer to avoid synchronous setState in effect
    queueMicrotask(() => setEnabled(true));

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);

      // Detect hover over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'
      );
      setHovering(isInteractive);
    };

    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY, visible]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      style={{ x, y }}
      aria-hidden="true"
    >
      <motion.div
        className="rounded-full"
        style={{
          width: hovering ? 48 : 12,
          height: hovering ? 48 : 12,
          marginLeft: hovering ? -24 : -6,
          marginTop: hovering ? -24 : -6,
          backgroundColor: hovering ? "transparent" : "var(--foreground)",
          border: hovering ? "1.5px solid var(--foreground)" : "none",
          mixBlendMode: "difference",
        }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
