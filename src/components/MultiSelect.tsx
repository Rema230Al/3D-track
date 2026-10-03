import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Option } from "../types/assessment";
import { isLatin } from "./ui";

/** Keycap chips. Handles an optional maximum and "exclusive" options (e.g. "none of these"). */
export default function MultiSelect({
  options,
  value,
  onChange,
  max,
  label,
}: {
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label: string;
}) {
  const [blocked, setBlocked] = useState(0);
  const atMax = max !== undefined && value.length >= max;
  const exclusive = new Set(options.filter((o) => o.exclusive).map((o) => o.label));

  const toggle = (opt: Option) => {
    if (value.includes(opt.label)) return onChange(value.filter((v) => v !== opt.label));
    if (opt.exclusive) return onChange([opt.label]);
    const base = value.filter((v) => !exclusive.has(v));
    if (max !== undefined && base.length >= max) return setBlocked((n) => n + 1);
    onChange([...base, opt.label]);
  };

  return (
    <div>
      {max !== undefined && (
        <div className="mb-4 flex items-center gap-3" aria-live="polite">
          <motion.div
            key={blocked}
            animate={blocked ? { x: [0, -7, 7, -4, 4, 0] } : undefined}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-2.5 font-mono text-sm"
            dir="ltr"
          >
            <span className="flex gap-1">
              {Array.from({ length: max }, (_, i) => (
                <span
                  key={i}
                  className={`size-3 rounded-[2px] transition-colors duration-200 ${
                    i < value.length ? "bg-tq-cyan" : "border-2 border-tq-line"
                  }`}
                />
              ))}
            </span>
            <span className={atMax ? "font-bold text-tq-cyan" : "text-tq-muted"}>
              {value.length} / {max}
            </span>
          </motion.div>
          <AnimatePresence>
            {blocked > 0 && atMax && (
              <motion.p
                key="max"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-tq-orange"
              >
                وصلت الحد، شيل واحد عشان تختار غيره
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <div role="group" aria-label={label} className="flex flex-wrap gap-x-2.5 gap-y-4 pb-1">
        {options.map((opt) => {
          const on = value.includes(opt.label);
          const latin = isLatin(opt.label);
          return (
            <button
              key={opt.label}
              type="button"
              role="checkbox"
              aria-checked={on}
              aria-disabled={atMax && !on}
              onClick={() => toggle(opt)}
              className={`key flex min-h-12 items-center gap-2.5 px-4 ${
                latin ? "font-mono text-[13.5px] font-medium" : "text-[15px] font-medium"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-[2px] transition-colors ${on ? "bg-tq-bg" : "border-2 border-tq-violet/60"}`}
              />
              {latin ? <bdi dir="ltr">{opt.label}</bdi> : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
