import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TerminalDetail from "../components/TerminalDetail";
import { PEAK_ROWS, PixelPeak } from "../components/Progress";
import { Brand, brandColor, shortHash } from "../components/ui";
import type { SubmitMode } from "../services/submissionService";
import type { Submission } from "../types/assessment";

const LOG = [
  { text: "git commit -m \"init: member profile\"", tone: "cmd" as const },
  { text: "profile saved", tone: "out" as const },
  { text: "interests mapped", tone: "out" as const },
  { text: "response received", tone: "out" as const },
  { text: "ready_to_build = true", tone: "ok" as const },
];

/** 03 — COMPLETE: the peak builds itself row by row, then the flag goes up. */
export default function SuccessScreen({ submission, mode }: { submission: Submission; mode: SubmitMode }) {
  const reduce = useReducedMotion();
  const [level, setLevel] = useState(reduce ? PEAK_ROWS : 0);

  useEffect(() => {
    if (level >= PEAK_ROWS) return;
    const t = window.setTimeout(() => setLevel((l) => l + 1), level === 0 ? 250 : 90);
    return () => window.clearTimeout(t);
  }, [level]);

  const hash = shortHash(JSON.stringify(submission));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)] sm:px-8">
      <header className="flex items-center justify-between py-2">
        <Brand />
        <span dir="ltr" className="font-mono text-[11px] text-tq-muted">
          // 03 — COMPLETE
        </span>
      </header>

      <main className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="order-2 lg:order-1">
          <motion.p
            dir="ltr"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="text-right font-mono text-[clamp(2.4rem,11vw,5.25rem)] font-extrabold leading-[0.95] tracking-[-0.06em] lg:text-left"
          >
            <span className="block text-tq-paper">COMMIT</span>
            <span className="block">
              <span style={{ color: brandColor(0.55) }}>COMPLETE</span>{" "}
              <motion.span
                className="inline-block text-tq-cyan"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 14, delay: 1.05 }}
              >
                ✓
              </motion.span>
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h1 className="mt-8 text-[2rem] font-bold leading-tight sm:text-5xl">وصلتنا إجاباتك.</h1>
            <p className="mt-3 max-w-md text-[16px] leading-8 text-tq-muted sm:text-[18px]">
              الحين دورنا نبني تجربة تستاهل وقتك.
            </p>
          </motion.div>

          <TerminalDetail lines={LOG} delay={1.1} charMs={14} pauseMs={120} className="mt-8" />

          <p dir="ltr" className="mt-6 text-right font-mono text-[11px] text-tq-muted/70 lg:text-left">
            [main {hash}] <bdi className="text-tq-paper">{submission.fullName}</bdi>
            {submission.favoriteColor.hex && (
              <span
                className="mx-1.5 inline-block size-2.5 rounded-[2px] align-middle"
                style={{ background: submission.favoriteColor.hex, boxShadow: "0 0 0 1px rgb(255 255 255 / 0.3)" }}
              />
            )}
            · {PEAK_ROWS} answers committed
            {mode === "local" && <span className="text-tq-orange"> · dev mode: logged to console</span>}
          </p>
        </div>

        <div className="order-1 flex justify-center lg:order-2" aria-hidden="true">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[min(62vw,240px)] lg:w-full lg:max-w-[420px]"
          >
            <PixelPeak
              level={level}
              flag={level >= PEAK_ROWS}
              capColor={submission.favoriteColor.hex || undefined}
              className="w-full"
            />
          </motion.div>
        </div>
      </main>

      <footer dir="ltr" className="flex justify-between font-mono text-[11px] text-tq-muted/60">
        <span>TUWAIQ × UJ — PROGRAMMING</span>
        <span className="hidden sm:inline">SMALL STEPS. BIG BUILDS.</span>
      </footer>
    </div>
  );
}
