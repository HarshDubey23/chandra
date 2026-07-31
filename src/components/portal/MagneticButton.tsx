"use client";

/**
 * MagneticButton — wraps children in a magnetic-hover wrapper (Phase 3).
 *
 * - On desktop (hover:hover), the element translates toward the cursor
 *   via useMotionValue + useSpring (GPU-only transform).
 * - On touch devices, renders a plain wrapper (no magnetic effect).
 * - DISABLED when prefers-reduced-motion is set.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  /** Magnetic pull strength (px max offset). Default 12. */
  strength?: number;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 12,
  className,
}: MagneticButtonProps) {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (hasHover && !prefersReducedMotion) {
      // Defer to avoid synchronous setState in effect
      queueMicrotask(() => setEnabled(true))
    }
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set((relX / rect.width) * strength);
    y.set((relY / rect.height) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
