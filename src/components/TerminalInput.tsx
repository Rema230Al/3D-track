import { useLayoutEffect, useRef } from "react";
import { isLatin } from "./ui";
import { CameraIcon, CubeIcon } from "./Icons3D";

const tokens = (v: string) =>
  v
    .split(/[,،\n]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

/** Text answer as a small viewport input panel. Grows with its content; optional tap-to-add tokens. */
export default function TerminalInput({
  value,
  onChange,
  placeholder,
  file,
  label,
  suggestions,
  multiline = false,
  compact = false,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  file: string;
  label: string;
  suggestions?: string[];
  multiline?: boolean;
  compact?: boolean;
  onSubmit?: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const used = new Set(tokens(value));
  const add = (t: string) => {
    if (used.has(t.toLowerCase())) return;
    const base = value.replace(/[\s,،]+$/, "");
    onChange(base ? `${base}, ${t}` : t);
  };

  // Empty field follows the placeholder's direction; typed text follows the first strong character.
  const dir = value ? "auto" : isLatin(placeholder) ? "ltr" : "rtl";

  return (
    <div>
      <div className="overflow-hidden rounded-xl border-2 border-tq-line bg-tq-surface/85 transition-colors focus-within:border-tq-apricot">
        {!compact && (
          <div
            dir="ltr"
            className="flex items-center justify-between border-b-2 border-tq-line px-4 py-2 font-mono text-[11px] text-tq-muted"
          >
            <span className="flex items-center gap-2" aria-hidden="true">
              <CameraIcon size={14} className="text-tq-violet" />
              <span>viewport · text</span>
            </span>
            <span>scene/3d-track/{file}</span>
          </div>
        )}
        <label className="flex items-start gap-3 px-4 py-3.5">
          <span dir="ltr" className="pt-[5px] text-tq-apricot" aria-hidden="true">
            <CubeIcon size={17} />
          </span>
          <span className="sr-only">{label}</span>
          <textarea
            ref={ref}
            dir={dir}
            rows={multiline ? 3 : 1}
            value={value}
            placeholder={placeholder}
            maxLength={multiline ? 1000 : 400}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              const submit = multiline ? e.key === "Enter" && (e.ctrlKey || e.metaKey) : e.key === "Enter" && !e.shiftKey;
              if (submit && onSubmit) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="block w-full resize-none bg-transparent text-base leading-7 text-tq-paper caret-tq-apricot outline-none placeholder:text-tq-muted/60"
            style={{ fontFamily: isLatin(value || placeholder) ? "var(--font-mono)" : undefined }}
          />
        </label>
        {!compact && (
          <div dir="ltr" className="flex justify-between px-4 pb-2 font-mono text-[11px] text-tq-muted/70">
            <span>{value.trim().length} chars</span>
            <span className="hidden lg:inline">{multiline ? "ctrl + ↵ next" : "↵ next"}</span>
          </div>
        )}
      </div>

      {suggestions && (
        <div className="mt-4 flex flex-wrap gap-2" dir="ltr">
          {suggestions.map((s) => {
            const on = used.has(s.toLowerCase());
            return (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                disabled={on}
                className="h-10 rounded-lg border-2 border-dashed border-tq-line px-3 font-mono text-[13px] text-tq-muted transition-colors hover:border-tq-apricot hover:text-tq-paper disabled:border-solid disabled:border-tq-apricot/50 disabled:text-tq-apricot"
              >
                {on ? "✓" : "+"} {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
