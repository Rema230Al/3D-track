import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Text that renders like a 3D frame: it shows up first as a wireframe outline on a
 * viewport grid, then a scan line shades it in (from the reading start), and the
 * wireframe fades away. Reduced motion shows the finished text straight away.
 */
export default function RenderText({
  children,
  dir = "rtl",
  delay = 0.12,
  duration = 0.85,
}: {
  children: ReactNode;
  dir?: "rtl" | "ltr";
  delay?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  const rtl = dir === "rtl";
  // Clip from the far side so the shaded copy grows from the reading start.
  const hidden = rtl ? "inset(-25% 0% -25% 100%)" : "inset(-25% 100% -25% 0%)";
  const shown = "inset(-25% 0% -25% 0%)";
  const edge = rtl ? "right" : "left";
  const ease = [0.45, 0.1, 0.25, 1] as const;

  // Its own AnimatePresence so it still plays when a parent mounts with initial={false}
  // (the first question after the intro).
  return (
    <AnimatePresence>
      <span key="render" className="render relative">
        <motion.span
          aria-hidden="true"
          className="render__wire"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: duration + 0.55, delay, times: [0, 0.12, 0.75, 1] }}
        >
          {children}
        </motion.span>
        <motion.span
          initial={{ clipPath: hidden }}
          animate={{ clipPath: shown }}
          transition={{ duration, delay: delay + 0.18, ease }}
        >
          {children}
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="render__scan"
          initial={{ [edge]: "0%", opacity: 0 }}
          animate={{ [edge]: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration, delay: delay + 0.18, ease, opacity: { duration, delay: delay + 0.18, times: [0, 0.1, 0.85, 1] } }}
        />
      </span>
    </AnimatePresence>
  );
}
