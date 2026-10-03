import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TerminalDetail from "./TerminalDetail";
import { isLatin, seeded } from "./ui";
import { SphereIcon } from "./Icons3D";
import type { FavoriteColor } from "../types/assessment";

// Loose spots (% of the field) scattered around the member's name, clear of the centre.
const SPOTS: [number, number][] = [
  [12, 13], [37, 8], [63, 11], [88, 17], [92, 50],
  [86, 82], [60, 91], [34, 89], [10, 77], [7, 45],
];

const canDrag = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** One color as a shaded material ball; the same layoutId lets it fly between the field and the name. */
function Pixel({ color, size }: { color: FavoriteColor; size: "field" | "slot" }) {
  return (
    <motion.span
      layoutId={`pixel-${color.name}`}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className={`block rounded-full border border-white/20 ${size === "field" ? "size-11" : "size-full"}`}
      style={{
        backgroundColor: color.hex,
        backgroundImage:
          "radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.7), rgb(255 255 255 / 0) 34%), radial-gradient(circle at 50% 45%, transparent 45%, rgb(0 0 0 / 0.45) 100%)",
        boxShadow: "0 6px 10px -4px rgb(0 0 0 / 0.6)",
      }}
    />
  );
}

/**
 * Q9 — CLAIM YOUR COLOR. Colors float as material balls around the member's name.
 * Tap (or on desktop, drag onto the name) to claim one; it flies into the slot beside the name.
 */
export default function ColorClaim({
  name,
  colors,
  value,
  onChange,
  label,
}: {
  name: string;
  colors: FavoriteColor[];
  value: FavoriteColor | null;
  onChange: (c: FavoriteColor) => void;
  label: string;
}) {
  const target = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [drag] = useState(canDrag);
  const [flash, setFlash] = useState(0);
  const prevHex = useRef(value?.hex);

  // A new claim tints the scene briefly, then settles to a faint glow (not on revisits).
  useEffect(() => {
    if (value && value.hex !== prevHex.current) setFlash((n) => n + 1);
    prevHex.current = value?.hex;
  }, [value]);

  const claim = (c: FavoriteColor) => {
    if (value?.hex !== c.hex) onChange(c);
  };

  const droppedOnName = (x: number, y: number) => {
    const r = target.current?.getBoundingClientRect();
    if (!r) return false;
    const px = x - window.scrollX;
    const py = y - window.scrollY;
    return px > r.left - 40 && px < r.right + 40 && py > r.top - 40 && py < r.bottom + 40;
  };

  const display = name.trim() || "member";
  const latin = isLatin(display);

  return (
    <div>
      <div dir="ltr" className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-[0.2em]">
        <span className="font-bold text-tq-paper">
          <SphereIcon size={13} className="me-2 inline-block align-[-2px] text-tq-apricot" />
          CLAIM YOUR COLOR
        </span>
        <span className="text-tq-muted/70">{drag ? "click or drag" : "tap to claim"}</span>
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        className="relative h-[340px] overflow-hidden rounded-2xl border-2 border-tq-line bg-tq-surface/60 sm:h-[380px]"
        style={{
          backgroundImage: "radial-gradient(rgb(163 128 255 / 0.16) 1px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
      >
        {/* Claimed color bleeding into the scene: a flash, then a faint settled glow. */}
        {value && (
          <motion.div
            key={flash}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(60% 55% at 50% 50%, ${value.hex}, transparent 70%)` }}
            initial={{ opacity: flash ? 0.4 : 0.1 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        )}

        {/* The member's identity in the middle, with the slot the color attaches to. */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div ref={target} dir="ltr" className="flex max-w-[64%] flex-col items-center">
            <span className="font-mono text-[10px] tracking-[0.3em] text-tq-muted">MEMBER/</span>
            <span className="mt-1.5 flex max-w-full items-center gap-2.5">
              <bdi
                className={`truncate font-extrabold leading-tight text-tq-paper ${
                  latin ? "font-mono text-[clamp(1.4rem,6.5vw,2.25rem)] uppercase tracking-[-0.03em]" : "text-[clamp(1.5rem,7vw,2.4rem)]"
                }`}
              >
                {display}
              </bdi>
              <span
                className="relative size-7 shrink-0 sm:size-8"
                style={value ? { filter: `drop-shadow(0 0 10px ${value.hex}99)` } : undefined}
              >
                {value ? (
                  <Pixel key={value.name} color={value} size="slot" />
                ) : (
                  <span className="block size-full animate-[blink_1.05s_steps(1)_infinite] rounded-full border-2 border-dashed border-tq-apricot/70" />
                )}
              </span>
            </span>
          </div>
        </div>

        {colors.map((c, i) => {
          const [x, y] = SPOTS[i % SPOTS.length];
          const claimed = value?.hex === c.hex;
          const tilt = (seeded(i, 3) - 0.5) * 18;
          return (
            <motion.button
              key={c.hex}
              type="button"
              role="radio"
              aria-checked={claimed}
              aria-label={`${c.name} ${c.hex}`}
              title={c.hex}
              onClick={() => {
                if (dragged.current) return;
                claim(c);
              }}
              drag={drag && !claimed}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragStart={() => (dragged.current = true)}
              onDragEnd={(_, info) => {
                if (droppedOnName(info.point.x, info.point.y)) claim(c);
                // Let the click that follows a drag pass without re-claiming.
                window.setTimeout(() => (dragged.current = false), 0);
              }}
              whileHover={claimed ? undefined : { scale: 1.1, rotate: 0 }}
              whileTap={{ scale: 0.92 }}
              whileDrag={{ scale: 1.15, rotate: 0, zIndex: 30, cursor: "grabbing" }}
              initial={{ opacity: 0, scale: 0.4, rotate: tilt }}
              animate={{ opacity: 1, scale: 1, rotate: claimed ? 0 : tilt }}
              transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.05 + i * 0.03 }}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 p-1.5"
              style={{ left: `${x}%`, top: `${y}%`, cursor: claimed ? "default" : drag ? "grab" : "pointer" }}
            >
              {claimed ? (
                <span className="block size-11 rounded-full border-2 border-dashed border-tq-line" />
              ) : (
                <Pixel color={c} size="field" />
              )}
              <span dir="ltr" className={`font-mono text-[10px] lowercase ${claimed ? "text-tq-muted/50" : "text-tq-muted"}`}>
                {c.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* System response, re-typed on each claim. Height reserved so nothing jumps. */}
      <div className="mt-5 min-h-[3.5rem]" aria-live="polite">
        <AnimatePresence mode="wait">
          {value && (
            <motion.div key={value.hex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TerminalDetail
                lines={[
                  { text: `material.base_color = ${value.hex}`, tone: "cmd" },
                  { text: "material applied", tone: "ok" },
                ]}
                charMs={12}
                pauseMs={60}
                delay={0.25}
              />
              <span className="sr-only">
                {value.name} {value.hex}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
