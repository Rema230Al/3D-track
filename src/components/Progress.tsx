import { useId } from "react";
import { motion } from "framer-motion";
import { questions } from "../data/questions";
import { Brand, brandColor, pad, seeded } from "./ui";

// ---------- Pixel Peak ----------
// The progress mountain: one pixel row per question. Rows not built yet are a faint
// wireframe; each answer builds the next row solid from the base up, and the newest
// row glows apricot as it lifts into place. The summit flag goes up on the final render.

export const PEAK_ROWS = questions.length;
const ROWS = PEAK_ROWS;
const COLS = ROWS * 2 - 1;
const MID = (COLS - 1) / 2;

interface Cell {
  r: number;
  c: number;
  loose?: boolean;
}

const CELLS: Cell[] = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = r; c < COLS - r; c++) CELLS.push({ r, c });
  // A few loose pixels drifting off the slopes, like the identity board.
  if (r > 0 && r < ROWS - 2) {
    if (seeded(r, 1) < 0.5) CELLS.push({ r, c: r - 1, loose: true });
    if (seeded(r, 2) < 0.5) CELLS.push({ r, c: COLS - r, loose: true });
  }
}

const APRICOT = "#ffc49b";

export function PixelPeak({
  level,
  flag = false,
  capColor,
  className = "",
}: {
  level: number;
  flag?: boolean;
  /** Paints the summit pixel (the final render) in the member's claimed color. */
  capColor?: string;
  className?: string;
}) {
  const glow = `peak-glow-${useId().replace(/:/g, "")}`;
  const newest = level - 1;

  const cell = ({ r, c, loose }: Cell) => {
    const lit = r < level;
    const next = r === level;
    const top = r === newest;
    const cap = capColor && lit && r === ROWS - 1;
    return (
      <rect
        key={`${r}-${c}`}
        x={c + 0.09}
        y={ROWS - 1 - r + 0.09}
        width={0.82}
        height={0.82}
        rx={0.06}
        fill={cap ? capColor : top ? APRICOT : lit ? brandColor(r / (ROWS - 1)) : next ? "rgb(255 196 155 / 0.1)" : "rgb(163 128 255 / 0.05)"}
        stroke={cap ? "#ededed" : lit ? undefined : next ? "rgb(255 196 155 / 0.55)" : "rgb(163 128 255 / 0.28)"}
        strokeWidth={cap ? 0.08 : lit ? undefined : 0.07}
        strokeDasharray={next ? "0.2 0.12" : undefined}
        opacity={loose ? (lit ? 0.6 : 0.35) : 1}
        style={{ transition: "fill .35s ease-out", transitionDelay: `${Math.abs(c - MID) * 22}ms` }}
      />
    );
  };

  return (
    <svg viewBox={`-0.6 -3.4 ${COLS + 1.2} ${ROWS + 3.6}`} className={className} aria-hidden="true">
      <defs>
        <filter id={glow} x="-20%" y="-300%" width="140%" height="700%">
          <feGaussianBlur stdDeviation="0.45" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {CELLS.filter((k) => k.r !== newest).map(cell)}
      {newest >= 0 && (
        <g key={newest} className="peak-new" filter={`url(#${glow})`} style={{ transformBox: "fill-box" }}>
          {CELLS.filter((k) => k.r === newest).map(cell)}
        </g>
      )}
      <motion.g
        initial={false}
        animate={flag ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: flag ? 0.25 : 0 }}
        style={{ transformOrigin: `${MID + 0.5}px 0px`, transformBox: "view-box" }}
      >
        <rect x={MID + 0.45} y={-3.1} width={0.12} height={3.1} fill="#ededed" />
        <path d={`M${MID + 0.57} -3.1 L${MID + 2.5} -2.5 L${MID + 0.57} -1.9 Z`} fill={APRICOT} />
      </motion.g>
    </svg>
  );
}

// ---------- Build rail ----------
// One pixel block per question: built ones take the track gradient,
// the current one pings, answered ones can be jumped back to.

function Rail({
  step,
  done,
  onJump,
}: {
  step: number;
  done: boolean[];
  onJump: (i: number) => void;
}) {
  const reachable = done.indexOf(false) === -1 ? done.length - 1 : done.indexOf(false);
  return (
    <ol className="flex gap-1.5" dir="rtl" aria-label="التقدم">
      {done.map((d, i) => {
        const current = i === step;
        return (
          <li key={i} className="flex-1">
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={i > reachable || current}
              aria-label={`السؤال ${i + 1}`}
              aria-current={current ? "step" : undefined}
              className="group relative block h-7 w-full disabled:cursor-default"
            >
              <span
                className={`absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-[2px] transition-colors duration-300 ${
                  current ? "ping bg-tq-apricot" : d ? "" : "bg-tq-line"
                }`}
                style={!current && d ? { background: brandColor(i / (done.length - 1)) } : undefined}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Progress({
  step,
  done,
  onJump,
}: {
  step: number;
  done: boolean[];
  onJump: (i: number) => void;
}) {
  const built = done.filter(Boolean).length;
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Brand />
        <div className="flex items-center gap-3" dir="ltr">
          <PixelPeak level={built} className="w-16 sm:w-20" />
          <p className="font-mono leading-none tabular-nums" aria-label={`السؤال ${step + 1} من ${done.length}`}>
            <motion.span
              key={step}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-block text-2xl font-extrabold text-tq-paper"
            >
              {pad(step + 1)}
            </motion.span>
            <span className="text-sm text-tq-muted"> / {pad(done.length)}</span>
          </p>
        </div>
      </div>
      <div className="mt-2">
        <Rail step={step} done={done} onJump={onJump} />
      </div>
    </div>
  );
}
