import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface TermLine {
  text: string;
  /** cmd: typed command · out: output · ok: success line */
  tone?: "cmd" | "out" | "ok";
}

const TONE = {
  cmd: "text-tq-paper",
  out: "text-tq-muted",
  ok: "text-tq-cyan",
};

/**
 * A bare shell session (no window chrome): lines type themselves out quickly.
 * `instant` skips straight to the end; reduced motion always does.
 */
export default function TerminalDetail({
  lines,
  instant = false,
  delay = 0,
  charMs = 20,
  pauseMs = 140,
  className = "",
}: {
  lines: TermLine[];
  instant?: boolean;
  delay?: number;
  charMs?: number;
  pauseMs?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pause = Math.round(pauseMs / charMs);

  // Where each line starts on the shared "typing clock", with a pause before each.
  const { offsets, total } = useMemo(() => {
    let t = 0;
    const offsets = lines.map((l) => {
      t += pause;
      const start = t;
      t += l.text.length;
      return start;
    });
    return { offsets, total: t };
  }, [lines, pause]);

  const [tick, setTick] = useState(0);
  const skip = instant || !!reduce;
  const shown = skip ? total : tick;

  useEffect(() => {
    if (skip) return;
    let id: number | undefined;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        setTick((t) => {
          if (t >= total) {
            window.clearInterval(id);
            return t;
          }
          return t + 1;
        });
      }, charMs);
    }, delay * 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [skip, total, charMs, delay]);

  const active = offsets.findLastIndex((o) => shown >= o);

  return (
    <div
      dir="ltr"
      className={`border-l-2 border-tq-line ps-4 text-left font-mono text-[13px] leading-7 sm:text-sm ${className}`}
      aria-label={lines.map((l) => l.text).join(". ")}
    >
      {lines.map((line, i) => {
        const visible = shown >= offsets[i];
        const chars = Math.max(0, Math.min(line.text.length, shown - offsets[i]));
        return (
          <p key={i} className={`m-0 whitespace-pre-wrap ${TONE[line.tone ?? "out"]}`} aria-hidden="true" style={{ visibility: visible ? "visible" : "hidden" }}>
            <span className={line.tone === "ok" ? "text-tq-cyan" : "text-tq-violet"}>{line.tone === "ok" ? "✓" : ">"}</span>{" "}
            {line.text.slice(0, chars)}
            {i === active && <span className="cursor text-tq-cyan" />}
          </p>
        );
      })}
    </div>
  );
}
