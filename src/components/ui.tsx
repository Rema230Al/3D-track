import type { ButtonHTMLAttributes, PointerEvent, ReactNode } from "react";
import { CubeIcon } from "./Icons3D";

/**
 * Official logo slot. Drop the Tuwaiq × UJ 3D Printing Track logo into /public/brand/
 * and set its file name here (e.g. "brand/logo.svg"); until then the text wordmark is used.
 */
export const LOGO_SRC: string | null = null;

export const pad = (n: number) => String(n).padStart(2, "0");

/** Short, stable, hex object id for any string. */
export function shortHash(str: string) {
  let h = 5381;
  for (const ch of str) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
  return h.toString(16).padStart(7, "0").slice(0, 7);
}

const STOPS = [
  [0x4f, 0x29, 0xb7],
  [0xa3, 0x80, 0xff],
  [0xff, 0xc4, 0x9b],
];

/** 3D Printing Track gradient (purple → violet → apricot) sampled at t ∈ [0, 1]. */
export function brandColor(t: number) {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  const [a, b] = [STOPS[i], STOPS[i + 1]];
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(" ")})`;
}

/** Stable pseudo-random number in [0, 1) so decorative layouts are identical on every visit. */
export function seeded(i: number, k = 0) {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// May start with digits ("3D Printing Track") but must contain a letter, so plain numbers stay in the Arabic flow.
const LATIN_RUN = /(\d*[A-Za-z][A-Za-z0-9+#./&\- ]*[A-Za-z0-9+#])/g;
const HAS_ARABIC = /[؀-ۿ]/;

export const isLatin = (text: string) => !HAS_ARABIC.test(text);

// ---------- Pointer tilt (desktop only) ----------
// Sets --rx / --ry on the hovered element; .pop and .key turn toward the mouse with them.
// Touch, pens and reduced motion never tilt.

const fineHover = typeof window !== "undefined" ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
const reducedMotion = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

export const tilt = {
  onPointerMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !fineHover?.matches || reducedMotion?.matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    // Wide cards tilt less around the vertical axis so their far edge doesn't swing.
    const yaw = r.width > 360 ? 2.5 : 7;
    el.style.setProperty("--ry", `${(x * yaw).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
  },
  onPointerLeave(e: PointerEvent<HTMLElement>) {
    e.currentTarget.style.removeProperty("--rx");
    e.currentTarget.style.removeProperty("--ry");
  },
};

const BRAND_RUN = /^3D Printing Track$/i;

/**
 * Arabic text with embedded English terms. Each Latin run is isolated as LTR so
 * "3D Printing Track", "AI Agents", "Fine-Tuning"… keep their order inside RTL.
 */
export function Mixed({ text, latinClass = "", brandClass }: { text: string; latinClass?: string; brandClass?: string }) {
  if (isLatin(text)) return <bdi dir="ltr">{text}</bdi>;
  return (
    <>
      {text.split(LATIN_RUN).map((part, i) =>
        i % 2 ? (
          <bdi key={i} dir="ltr" className={brandClass && BRAND_RUN.test(part) ? brandClass : latinClass}>
            {part}
          </bdi>
        ) : (
          part
        )
      )}
    </>
  );
}

export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} dir="ltr">
      {LOGO_SRC && <img src={LOGO_SRC} alt="Tuwaiq Club" className="h-9 w-auto" />}
      <div className="leading-none">
        <p className="font-mono text-[11px] font-bold tracking-[0.34em] text-tq-paper">
          TUWAIQ <span className="text-tq-apricot">×</span> UJ
        </p>
        <p className="mt-1.5 flex items-center gap-2 font-mono text-[9px] font-medium tracking-[0.36em] text-tq-violet">
          <CubeIcon size={11} className="text-tq-apricot" />
          3D PRINTING TRACK
        </p>
      </div>
    </div>
  );
}

/** Label printed twice; on hover the stack rolls up to the copy. */
export function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="roll">
      <span>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  icon?: ReactNode;
  kbd?: string;
};

/** Pop-out button: an extruded slab that tilts toward the mouse. */
export function PopButton({ primary, icon, kbd, children, className = "", ...rest }: ButtonProps) {
  return (
    <button type="button" className={`pop ${primary ? "pop--primary" : ""} ${className}`} {...tilt} {...rest}>
      <span className="pop__back" />
      <span className="pop__front flex h-full items-center justify-center gap-3 px-6 text-[17px] font-bold">
        <Roll>{children}</Roll>
        {icon}
        {kbd && (
          <kbd className="hidden rounded border border-current/30 px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-70 lg:inline">
            {kbd}
          </kbd>
        )}
      </span>
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`ghost inline-flex h-14 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-medium text-tq-muted transition-colors hover:text-tq-apricot disabled:opacity-40 ${className}`}
      {...rest}
    >
      <Roll>{children}</Roll>
    </button>
  );
}
