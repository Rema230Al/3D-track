import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import TerminalDetail from "../components/TerminalDetail";
import { PEAK_ROWS, PixelPeak } from "../components/Progress";
import { AxesIcon, CameraIcon, CubeIcon, LightIcon, MeshIcon, SphereIcon } from "../components/Icons3D";
import { Brand, GhostButton, Mixed, PopButton, brandColor, pad } from "../components/ui";
import { ACADEMIC_YEARS, isMemberValid, isTextValid, questions } from "../data/questions";
import type { Member } from "../types/assessment";

const BOOT = [
  { text: "New Scene · 3D Printing Track", tone: "cmd" as const },
  { text: "Loading meshes…", tone: "out" as const },
  { text: "Viewport ready", tone: "ok" as const },
];

/** Big Latin wordmark, extruded; letters rise out of a mask (padded so the extrusion isn't clipped). */
function Wordmark() {
  const word = (text: string, color: (i: number) => string, delay: number) => (
    <span className="block -mb-[0.1em] overflow-hidden pb-[0.14em] pe-[0.1em]">
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ color: color(i) }}
          initial={{ y: "105%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.9, 0.1, 1], delay: delay + i * 0.035 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
  return (
    <h1
      dir="ltr"
      aria-label="3D Printing Track"
      className="extrude text-right font-mono text-[clamp(3rem,15vw,6.75rem)] font-extrabold leading-[0.92] tracking-[-0.07em] lg:text-left"
    >
      {word("3D", () => "#ededed", 0)}
      {word("PRINTING", (i) => brandColor(0.45 + i * 0.05), 0.1)}
      <span className="flex items-end justify-end lg:justify-start">
        {word("TRACK", (i) => brandColor(0.85 + i * 0.04), 0.3)}
        <CubeIcon size="0.42em" strokeWidth={2.4} className="mb-[0.1em] ms-[0.08em] shrink-0 text-tq-apricot" />
      </span>
    </h1>
  );
}

// ---------- Sticker board (desktop): the identity stickers, drag them around ----------

function Sticker({
  x,
  y,
  r,
  i,
  board,
  children,
}: {
  x: number;
  y: number;
  r: number;
  i: number;
  board: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const [z, setZ] = useState(i + 1);
  return (
    <motion.div
      className="absolute cursor-grab touch-none select-none"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: z }}
      drag
      dragConstraints={board}
      dragElastic={0.15}
      dragTransition={{ power: 0.2, timeConstant: 200 }}
      initial={{ scale: 0, rotate: r }}
      animate={{ scale: 1, rotate: r }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.35 + i * 0.07 }}
      whileHover={{ scale: 1.04, rotate: 0 }}
      whileDrag={{ scale: 1.1, rotate: 0, cursor: "grabbing" }}
      onPointerDown={() => setZ(100 + Date.now() % 1000)}
    >
      <div className="drop-shadow-[4px_5px_0_rgba(0,0,0,0.55)]">{children}</div>
    </motion.div>
  );
}

function ModeToggle() {
  const [on, setOn] = useState(true);
  return (
    <motion.div
      onTap={() => setOn((v) => !v)}
      className="flex items-center gap-3 rounded-full border-2 border-tq-line bg-tq-surface py-2 pe-2 ps-5 font-mono text-sm font-bold"
      dir="ltr"
    >
      Wireframe
      <span
        className={`flex h-8 w-16 items-center rounded-full px-1 transition-colors ${on ? "justify-end bg-tq-apricot" : "justify-start bg-tq-line"}`}
      >
        <motion.span layout className="grid size-6 place-items-center rounded-full bg-tq-paper text-[9px] text-tq-bg">
          {on ? "ON" : "OFF"}
        </motion.span>
      </span>
    </motion.div>
  );
}

function StickerBoard() {
  const board = useRef<HTMLDivElement>(null);
  const keys = [
    { k: "MODEL", Icon: CubeIcon },
    { k: "LIGHT", Icon: LightIcon },
    { k: "RENDER", Icon: CameraIcon },
  ];
  return (
    <div ref={board} dir="ltr" className="relative h-[min(560px,64vh)] w-full" aria-hidden="true">
      <Sticker i={0} x={30} y={4} r={-4} board={board}>
        <div className="w-56 rounded-3xl border-2 border-tq-line bg-tq-surface p-5">
          <PixelPeak level={PEAK_ROWS} className="w-full" />
          <p className="mt-3 whitespace-nowrap text-center font-mono text-[10px] tracking-[0.14em] text-tq-muted">SMALL STEPS. BIG BUILDS.</p>
        </div>
      </Sticker>
      <Sticker i={1} x={2} y={8} r={-8} board={board}>
        <div className="w-40 rounded-md bg-tq-apricot p-4 font-mono text-[13px] font-extrabold leading-snug text-tq-bg">
          GOOD
          <br />
          MESH_
          <br />
          BRIGHTER
          <br />
          RENDERS <span className="font-sans">:)</span>
        </div>
      </Sticker>
      <Sticker i={2} x={72} y={30} r={8} board={board}>
        <div className="relative" dir="ltr">
          <CubeIcon size="6rem" strokeWidth={1.3} className="text-tq-violet" />
          <SphereIcon size="2.6rem" strokeWidth={1.6} className="absolute -bottom-2 -right-4 text-tq-apricot" />
        </div>
      </Sticker>
      <Sticker i={3} x={4} y={60} r={5} board={board}>
        <div className="flex gap-2.5" dir="ltr">
          {keys.map(({ k, Icon }, n) => (
            <span
              key={k}
              className={`key flex h-16 min-w-16 flex-col items-center justify-center gap-1 px-3 font-mono text-[11px] font-bold ${n === 2 ? "bg-tq-purple! text-white!" : ""}`}
            >
              <Icon size={18} className={n === 2 ? "text-tq-apricot" : "text-tq-violet"} />
              {k}
            </span>
          ))}
        </div>
      </Sticker>
      <Sticker i={4} x={24} y={43} r={-2} board={board}>
        <div className="flex items-center gap-2 rounded-lg border-2 border-tq-line bg-tq-bg px-3.5 py-2 font-mono text-[12px] text-tq-muted" dir="ltr">
          <AxesIcon size={16} /> User Perspective · <span className="text-tq-apricot">hello, track</span>
        </div>
      </Sticker>
      <Sticker i={5} x={46} y={82} r={-3} board={board}>
        <ModeToggle />
      </Sticker>
      <p className="absolute bottom-0 left-0 font-mono text-[11px] text-tq-muted/60" dir="ltr">
        viewport · drag to rearrange
      </p>
    </div>
  );
}

const canAutoFocus = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** One `> key: [ ... ]` line of the boot session, with its Arabic label above it. */
function PromptField({
  label,
  cmd,
  value,
  onChange,
  onEnter,
  placeholder,
  autoComplete,
  inputRef,
}: {
  label: string;
  cmd: string;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  placeholder: string;
  autoComplete: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="mt-2">
      <p className="font-sans text-[16px] font-bold text-tq-paper">
        <bdi>{label}</bdi>
      </p>
      <label className="flex items-center gap-2">
        <span className="w-[4.75rem] shrink-0 text-tq-muted">
          <span className="text-tq-violet">▸</span> {cmd}:
        </span>
        <span className="text-tq-apricot">[</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter();
          }}
          dir={value ? "auto" : "rtl"}
          maxLength={60}
          autoComplete={autoComplete}
          enterKeyHint="next"
          aria-label={label}
          aria-required="true"
          placeholder={placeholder}
          className="h-11 w-0 min-w-0 flex-1 border-b-2 border-dashed border-tq-line bg-transparent px-1 font-sans text-base text-tq-paper caret-tq-apricot outline-none transition-colors placeholder:text-tq-muted/55 focus:border-tq-apricot"
        />
        <span className="text-tq-apricot">]</span>
      </label>
    </div>
  );
}

/** "Adding member to scene": full name, major and year, typed into the render log rather than a form. */
function MemberPrompt({ value, onChange, onSubmit }: { value: Member; onChange: (m: Member) => void; onSubmit: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const majorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const ok = isMemberValid(value);
  const set = (patch: Partial<Member>) => onChange({ ...value, ...patch });

  useEffect(() => {
    // Desktop only: focusing on phones would throw the keyboard over the intro.
    if (!value.fullName && canAutoFocus()) nameRef.current?.focus({ preventScroll: true });
  }, []);

  // Enter walks down the fields; on the last complete one it starts.
  const advance = (from: "name" | "major") => {
    if (ok) return onSubmit();
    if (from === "name" && isTextValid(value.fullName)) majorRef.current?.focus();
    else if (from === "major" && isTextValid(value.major)) yearRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      dir="ltr"
      className="border-l-2 border-tq-line ps-4 text-left font-mono text-[13px] leading-7 sm:text-sm"
    >
      <p className="text-tq-muted">
        <span className="text-tq-violet">▸</span> Adding member to scene…
      </p>
      <PromptField
        label="الاسم الكامل"
        cmd="Name"
        value={value.fullName}
        onChange={(fullName) => set({ fullName })}
        onEnter={() => advance("name")}
        placeholder="اكتب اسمك الكامل..."
        autoComplete="name"
        inputRef={nameRef}
      />
      <PromptField
        label="التخصص"
        cmd="Major"
        value={value.major}
        onChange={(major) => set({ major })}
        onEnter={() => advance("major")}
        placeholder="اكتب تخصصك..."
        autoComplete="off"
        inputRef={majorRef}
      />
      <div className="mt-2">
        <p id="year-label" className="font-sans text-[16px] font-bold text-tq-paper">
          <bdi>السنة الدراسية</bdi>
        </p>
        <div className="flex items-start gap-2">
          <span className="w-[4.75rem] shrink-0 pt-2.5 text-tq-muted">
            <span className="text-tq-violet">▸</span> Year:
          </span>
          <div
            ref={yearRef}
            role="radiogroup"
            aria-labelledby="year-label"
            aria-required="true"
            dir="rtl"
            className="flex min-w-0 flex-1 flex-wrap gap-x-2 gap-y-3 pb-1 pt-1"
          >
            {ACADEMIC_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                role="radio"
                aria-checked={value.academicYear === y}
                onClick={() => set({ academicYear: y })}
                className="key min-h-10 px-3 font-sans text-[14px] font-medium"
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 min-h-7" aria-live="polite">
        {ok && (
          <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="inline-block text-tq-apricot">
            ✓ <span className="text-tq-muted">Member:</span> <bdi className="text-tq-paper">{value.fullName.trim()}</bdi>
            <span className="text-tq-muted"> · added to scene</span>
          </motion.span>
        )}
      </p>
    </motion.div>
  );
}

export default function IntroScreen({
  member,
  onMember,
  resumeStep,
  onStart,
}: {
  member: Member;
  onMember: (member: Member) => void;
  /** Question index of a saved draft, or null. */
  resumeStep: number | null;
  onStart: (resume: boolean) => void;
}) {
  const [skip, setSkip] = useState(false);
  const ready = isMemberValid(member);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Enter" && ready && t.tagName !== "BUTTON" && t.tagName !== "INPUT") onStart(resumeStep !== null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart, resumeStep, ready]);

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-[max(env(safe-area-inset-bottom),20px)] pt-[max(env(safe-area-inset-top),16px)] sm:px-8"
      onPointerDown={() => setSkip(true)}
    >
      <header className="flex items-center justify-between py-2">
        <Brand />
        <span dir="ltr" className="font-mono text-[11px] text-tq-muted">
          v1.0 · FALL 2026
        </span>
      </header>

      <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-4">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 flex items-center gap-2 font-mono text-xs text-tq-violet"
          >
            <MeshIcon size={14} className="text-tq-apricot" />
            <bdi dir="ltr">01 — SCENE SETUP</bdi>
          </motion.p>
          <Wordmark />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2 className="mt-8 text-[2.1rem] font-bold leading-tight sm:text-5xl">خلّنا نعرفك أكثر<span className="text-tq-apricot">.</span></h2>
            <p className="mt-3 max-w-md text-[15.5px] leading-8 text-tq-muted sm:text-[17px]">
              <Mixed
                text="كم سؤال سريع يساعدنا نفهم مستواك، اهتماماتك، وإيش ودك تطلع فيه من 3D Printing Track."
                latinClass="text-tq-apricot"
              />
            </p>
          </motion.div>

          <TerminalDetail lines={BOOT} instant={skip} delay={0.5} className="mt-7" />
          <MemberPrompt value={member} onChange={onMember} onSubmit={() => onStart(resumeStep !== null)} />
        </div>

        <div className="hidden lg:block">
          <StickerBoard />
        </div>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <PopButton
          primary
          kbd="↵"
          className="h-16 w-full sm:w-72"
          disabled={!ready}
          onClick={() => onStart(resumeStep !== null)}
          icon={<span aria-hidden="true">←</span>}
        >
          {resumeStep !== null ? `كمّل من السؤال ${pad(resumeStep + 1)}` : "ابدأ"}
        </PopButton>
        {resumeStep !== null && <GhostButton disabled={!ready} onClick={() => onStart(false)}>ابدأ من جديد</GhostButton>}
        <p className="text-center font-mono text-[11px] text-tq-muted sm:ms-auto sm:text-start">
          <bdi dir="ltr">{pad(questions.length)} questions · ~5 min</bdi>
        </p>
      </motion.footer>
    </div>
  );
}
