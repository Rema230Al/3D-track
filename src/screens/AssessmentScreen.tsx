import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { OTHER, canContinue, isAnswered, needsNote, questions } from "../data/questions";
import { withNote } from "../services/submissionService";
import type { AnswerKey, AnswerValue, Answers, OtherNotes, Question } from "../types/assessment";
import OptionCard from "../components/OptionCard";
import MultiSelect from "../components/MultiSelect";
import TerminalInput from "../components/TerminalInput";
import ColorClaim from "../components/ColorClaim";
import Progress, { PixelPeak } from "../components/Progress";
import RenderText from "../components/RenderText";
import { CameraIcon, CubeIcon, LightIcon, MeshIcon, SphereIcon, VerticesIcon } from "../components/Icons3D";
import { GhostButton, Mixed, PopButton, pad } from "../components/ui";

// Three.js only loads once the questions are on screen, in its own chunk.
const QuestionObject = lazy(() => import("../components/QuestionObject"));

export type SubmitState = "idle" | "sending" | "error";

const TYPE_TAG: Record<Question["kind"], { label: string; Icon: typeof CubeIcon }> = {
  single: { label: "Select · 1", Icon: CubeIcon },
  multi: { label: "Select · N", Icon: VerticesIcon },
  text: { label: "Edit · Text", Icon: CameraIcon },
  color: { label: "Material", Icon: LightIcon },
};

// Camera move between questions. Forward: the current question sinks back into depth
// while the next one comes forward out of it; going back plays it the other way
// (toward the camera). 0.2s out + 0.3s in.
const camera: Variants = {
  enter: (dir: number) => ({ opacity: 0, z: dir * -260, transformPerspective: 900 }),
  center: { opacity: 1, z: 0, transformPerspective: 900, transition: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] } },
  exit: (dir: number) => ({ opacity: 0, z: dir * -260, transformPerspective: 900, transition: { duration: 0.2, ease: [0.5, 0, 0.8, 0.4] } }),
};

// Reduced motion: no camera move, just a quick cross-fade.
const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function summary(value: AnswerValue, note?: string) {
  const s = Array.isArray(value)
    ? value.map((v) => withNote(v, note)).join(", ")
    : value && typeof value === "object"
      ? `${value.name} ${value.hex}`
      : withNote(value ?? "", note).trim();
  return s.length > 34 ? `${s.slice(0, 34)}…` : s;
}

/** Desktop side panel: the answers so far as a scene outliner, under a big pixel peak. */
function SidePanel({
  fullName,
  answers,
  others,
  done,
  step,
}: {
  fullName: string;
  answers: Answers;
  others: OtherNotes;
  done: boolean[];
  step: number;
}) {
  return (
    <aside className="sticky top-32 hidden self-start lg:block" aria-hidden="true">
      <PixelPeak level={done.filter(Boolean).length} className="w-full max-w-[300px]" />
      <div dir="ltr" className="mt-8 border-l-2 border-tq-line pl-4 text-left font-mono text-[12px] leading-7">
        <p className="flex items-center gap-2 text-tq-muted">
          <MeshIcon size={13} className="text-tq-violet" /> Outliner
        </p>
        <p className="truncate text-tq-muted">
          Artist: <bdi className="text-tq-paper">{fullName}</bdi>
          {answers.favoriteColor && (
            <span className="ms-2 inline-block size-2.5 rounded-[2px] align-middle" style={{ background: answers.favoriteColor.hex }} />
          )}
        </p>
        {questions.map((q, i) => {
          const s = summary(answers[q.id], others[q.id]);
          return (
            <p key={q.id} className={`truncate ${i === step ? "text-tq-paper" : done[i] ? "text-tq-muted" : "text-tq-muted/35"}`}>
              {done[i] ? (
                <CubeIcon size={11} className="me-1.5 inline-block align-[-1px] text-tq-apricot" />
              ) : (
                <SphereIcon size={11} className="me-1.5 inline-block align-[-1px] opacity-40" />
              )}
              <span className={done[i] ? "text-tq-violet" : ""}>{q.object}</span>
              {done[i] && <span className="text-tq-muted/70"> — <bdi>{s}</bdi></span>}
            </p>
          );
        })}
      </div>
      <p dir="ltr" className="mt-6 text-left font-mono text-[11px] text-tq-muted/60">
        1–9 select · ↵ render · click a block to jump back
      </p>
    </aside>
  );
}

export default function AssessmentScreen({
  fullName,
  step,
  answers,
  others,
  submitState,
  onStep,
  onAnswer,
  onOther,
  onExit,
  onSubmit,
}: {
  fullName: string;
  step: number;
  answers: Answers;
  others: OtherNotes;
  submitState: SubmitState;
  onStep: (step: number) => void;
  onAnswer: (key: AnswerKey, value: AnswerValue) => void;
  onOther: (key: AnswerKey, text: string) => void;
  onExit: () => void;
  onSubmit: () => void;
}) {
  const q: Question = questions[step];
  const tag = TYPE_TAG[q.kind];
  const done = questions.map((qq) => isAnswered(qq, answers, others));
  const valid = canContinue(q, answers, others);
  const isLast = step === questions.length - 1;
  const sending = submitState === "sending";

  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const autoTimer = useRef<number | undefined>(undefined);

  const go = (next: number) => {
    window.clearTimeout(autoTimer.current);
    setDir(next > step ? 1 : -1);
    onStep(next);
  };
  const next = () => {
    if (!valid || sending) return;
    if (isLast) onSubmit();
    else go(step + 1);
  };
  const back = () => (step === 0 ? onExit() : go(step - 1));

  const pickSingle = (label: string, asksText?: boolean) => {
    const fresh = answers[q.id] === "";
    onAnswer(q.id, label);
    // First pick on a single-select question moves on by itself (unless it opens a text field);
    // changing an answer never does.
    if (fresh && !asksText && !isLast) {
      window.clearTimeout(autoTimer.current);
      autoTimer.current = window.setTimeout(() => go(step + 1), 420);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    return () => window.clearTimeout(autoTimer.current);
  }, [step]);

  // Keyboard: 1–9 picks an option, Enter continues (Ctrl+Enter inside a multi-line field).
  const keys = useRef({ next, pick: (_i: number) => {} });
  keys.current = {
    next,
    pick: (i: number) => {
      if (q.kind === "text" || !q.options[i]) return;
      if (q.kind === "color") return onAnswer(q.id, q.options[i]);
      const opt = q.options[i];
      if (q.kind === "single") return pickSingle(opt.label, opt.other || !!opt.details);
      document.querySelectorAll<HTMLButtonElement>("[role=checkbox]")[i]?.click();
    },
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") return;
      if (e.key === "Enter" && t.tagName !== "BUTTON" && t.tagName !== "A") keys.current.next();
      else if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) keys.current.pick(Number(e.key) - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = answers[q.id];
  const otherSelected = (q.kind === "single" || q.kind === "multi") && (Array.isArray(value) ? value.includes(OTHER) : value === OTHER);
  // An option that asks for details ("what exactly?") opens a required field under the choices.
  const picked = q.kind === "single" ? q.options.find((o) => o.label === value) : undefined;
  const detailsPrompt = picked?.details;
  const noteOpen = otherSelected || !!detailsPrompt;
  const otherRequired = (q.kind === "single" || q.kind === "multi") && q.options.some((o) => o.other && needsNote(o));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-8">
      <header className="sticky top-0 z-20 -mx-4 overflow-x-clip bg-tq-bg/85 px-4 pb-2 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-md sm:-mx-8 sm:px-8">
        <Progress step={step} done={done} onJump={go} />
      </header>

      <div className="flex-1 gap-16 pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:pt-12">
        <main className="min-w-0 pb-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section
              key={step}
              custom={dir}
              variants={reduce ? fade : camera}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <p className="flex items-center gap-2 font-mono text-xs text-tq-violet">
                <MeshIcon size={14} className="shrink-0 text-tq-apricot" />
                <bdi dir="ltr">
                  {pad(step + 1)} — Object · {q.object}
                </bdi>
              </p>
              {q.lead && <p className="mt-3 text-[17px] text-tq-muted sm:text-xl">{q.lead}</p>}
              <div className="mt-3 flex items-start gap-3 sm:gap-5">
                <h1 className="min-w-0 text-balance text-[1.6rem] font-bold leading-[1.5] sm:text-[2.15rem] lg:text-[2.5rem] lg:leading-[1.4]">
                  <RenderText>
                    <Mixed text={q.title} latinClass="text-tq-apricot" brandClass="whitespace-nowrap text-tq-apricot extrude-sm" />
                  </RenderText>
                </h1>
                <Suspense fallback={<div className="size-20 shrink-0 sm:size-28 lg:size-36" aria-hidden="true" />}>
                  <QuestionObject index={step} solid={done[step]} className="-my-1 size-20 shrink-0 sm:size-28 lg:-my-3 lg:size-36" />
                </Suspense>
              </div>
              <p className="mt-3 flex items-center gap-2.5 text-[14px] text-tq-muted">
                <span dir="ltr" className="inline-flex items-center gap-1.5 rounded-md border-2 border-tq-line px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider">
                  <tag.Icon size={12} className="text-tq-apricot" />
                  {tag.label}
                </span>
                {q.hint}
              </p>

              {(q.kind === "single" || q.kind === "multi") && q.links && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {q.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="slab inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-tq-line bg-tq-surface px-4 text-[15px] font-bold text-tq-apricot underline-offset-4 transition-colors hover:border-tq-apricot hover:underline"
                    >
                      {l.label}
                      <span aria-hidden="true" dir="ltr">↗</span>
                      <span className="sr-only">(يفتح في نافذة جديدة)</span>
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-7">
                {q.kind === "single" && (
                  <div
                    role="radiogroup"
                    aria-label={q.title}
                    className={`grid gap-3.5 ${q.options.length > 5 ? "sm:grid-cols-2" : ""}`}
                  >
                    {q.options.map((opt, i) => (
                      <OptionCard
                        key={opt.label}
                        index={i}
                        label={opt.label}
                        selected={value === opt.label}
                        onSelect={() => pickSingle(opt.label, opt.other || !!opt.details)}
                      />
                    ))}
                  </div>
                )}

                {q.kind === "multi" && (
                  <MultiSelect
                    options={q.options}
                    value={value as string[]}
                    onChange={(v) => onAnswer(q.id, v)}
                    max={q.max}
                    label={q.title}
                  />
                )}

                {q.kind === "color" && (
                  <ColorClaim
                    name={fullName}
                    colors={q.options}
                    value={answers.favoriteColor}
                    onChange={(c) => onAnswer(q.id, c)}
                    label={q.title}
                  />
                )}

                {q.kind === "text" && (
                  <TerminalInput
                    value={value as string}
                    onChange={(v) => onAnswer(q.id, v)}
                    placeholder={q.placeholder}
                    suggestions={q.suggestions}
                    multiline={q.multiline}
                    scene={q.object}
                    label={q.title}
                    onSubmit={next}
                  />
                )}

                <AnimatePresence>
                  {noteOpen && (
                    <motion.div
                      key={detailsPrompt ?? OTHER}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className={`mb-2 mt-6 ${detailsPrompt ? "text-[16px] font-medium text-tq-paper" : "text-[14px] text-tq-muted"}`}>
                        {detailsPrompt ? (
                          <Mixed text={detailsPrompt} />
                        ) : otherRequired ? (
                          "وضّح لنا «أخرى»"
                        ) : (
                          "وضّح لنا «أخرى» (اختياري)"
                        )}
                      </p>
                      <TerminalInput
                        compact
                        value={others[q.id] ?? ""}
                        onChange={(v) => onOther(q.id, v)}
                        placeholder="اكتب هنا..."
                        scene={q.object}
                        label={detailsPrompt ?? OTHER}
                        onSubmit={next}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </AnimatePresence>
        </main>

        <SidePanel fullName={fullName} answers={answers} others={others} done={done} step={step} />
      </div>

      <footer className="sticky bottom-0 z-20 -mx-4 bg-gradient-to-t from-tq-bg from-70% to-transparent px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-6 sm:-mx-8 sm:px-8">
        <AnimatePresence>
          {submitState === "error" && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-xl border-2 border-tq-warn/50 bg-tq-warn/10 px-4 py-3"
            >
              <p dir="ltr" className="text-left font-mono text-xs text-tq-warn">
                ✗ Render failed · network
              </p>
              <p className="mt-1 text-[14px] leading-7">ما قدرنا نرسل إجاباتك. إجاباتك محفوظة، جرّب مرة ثانية.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-3 lg:max-w-[calc(100%-320px-4rem)]">
          <GhostButton onClick={back} disabled={sending} className="shrink-0">
            → رجوع
          </GhostButton>
          <PopButton
            primary
            kbd={isLast ? undefined : "↵"}
            disabled={!valid || sending}
            onClick={next}
            className="h-14 flex-1 sm:ms-auto sm:max-w-xs"
            icon={<span aria-hidden="true">{sending ? <span className="cursor" /> : "←"}</span>}
          >
            {!isLast ? (
              "التالي"
            ) : sending ? (
              "جاري الإرسال"
            ) : submitState === "error" ? (
              "إعادة المحاولة"
            ) : (
              <bdi dir="ltr" className="font-mono tracking-wide">
                FINAL RENDER
              </bdi>
            )}
          </PopButton>
        </div>
      </footer>
    </div>
  );
}
