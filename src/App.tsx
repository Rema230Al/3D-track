import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import IntroScreen from "./screens/IntroScreen";
import AssessmentScreen, { type SubmitState } from "./screens/AssessmentScreen";
import SuccessScreen from "./screens/SuccessScreen";
import { emptyAnswers, emptyMember } from "./data/questions";
import {
  buildSubmission,
  clearDraft,
  loadDraft,
  loadMember,
  saveDraft,
  saveMember,
  submitAssessment,
  type SubmitMode,
} from "./services/submissionService";
import type { AnswerKey, Answers, Member, OtherNotes, Stage, Submission } from "./types/assessment";

const initialDraft = loadDraft();

export default function App() {
  // 01 INIT → 02 ASSESSMENT → 03 COMPLETE
  const [stage, setStage] = useState<Stage>("init");
  const [member, setMember] = useState<Member>(loadMember);
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [answers, setAnswers] = useState<Answers>(initialDraft?.answers ?? emptyAnswers);
  const [others, setOthers] = useState<OtherNotes>(initialDraft?.others ?? {});
  const [hasDraft, setHasDraft] = useState(initialDraft !== null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [result, setResult] = useState<{ submission: Submission; mode: SubmitMode } | null>(null);

  // Keep a local copy of every answer so a refresh or a failed submit never loses anything.
  useEffect(() => {
    if (stage === "assessment") saveDraft({ answers, others, step });
  }, [stage, answers, others, step]);

  useEffect(() => {
    if (stage !== "complete") saveMember(member);
  }, [stage, member]);

  const start = (resume: boolean) => {
    if (!resume) {
      setAnswers(emptyAnswers);
      setOthers({});
      setStep(0);
      clearDraft();
    }
    setHasDraft(false);
    setSubmitState("idle");
    setStage("assessment");
  };

  const exit = () => {
    setHasDraft(true);
    setStage("init");
  };

  const submit = async () => {
    setSubmitState("sending");
    try {
      const submission = buildSubmission(member, answers, others);
      const mode = await submitAssessment(submission);
      clearDraft();
      saveMember(emptyMember);
      setResult({ submission, mode });
      setSubmitState("idle");
      setStage("complete");
    } catch (err) {
      console.error("[tuwaiq-init] submission failed:", err);
      setSubmitState("error");
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="backdrop" aria-hidden="true" />
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {stage === "init" && (
            <IntroScreen member={member} onMember={setMember} resumeStep={hasDraft ? step : null} onStart={start} />
          )}

          {stage === "assessment" && (
            <AssessmentScreen
              fullName={member.fullName.trim()}
              step={step}
              answers={answers}
              others={others}
              submitState={submitState}
              onStep={setStep}
              onAnswer={(key: AnswerKey, value) => {
                setAnswers((a) => ({ ...a, [key]: value }));
                if (submitState === "error") setSubmitState("idle");
              }}
              onOther={(key, text) => setOthers((o) => ({ ...o, [key]: text }))}
              onExit={exit}
              onSubmit={submit}
            />
          )}

          {stage === "complete" && result && <SuccessScreen submission={result.submission} mode={result.mode} />}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
