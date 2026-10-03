import { ACADEMIC_YEARS, OTHER, emptyMember, isAnswered, levelOf, questions, sanitizeAnswers } from "../data/questions";
import type { Answers, Member, OtherNotes, Submission } from "../types/assessment";

const WEBHOOK_URL = import.meta.env.VITE_SUBMISSION_WEBHOOK_URL?.trim() ?? "";
const DRAFT_KEY = "tuwaiq-3d-track:draft";
const MEMBER_KEY = "tuwaiq-3d-track:member";
/** v1 stored only the member's name, as a plain string. */
const LEGACY_NAME_KEY = "tuwaiq-3d-track:name";
/** Bump whenever the questions change shape, so old drafts are migrated instead of trusted. */
const DRAFT_VERSION = 6;
const TIMEOUT_MS = 15000;

export type SubmitMode = "remote" | "local";

/** Replaces a bare "أخرى" with "أخرى: <what they typed>". */
export function withNote(value: string, note?: string) {
  return value === OTHER && note?.trim() ? `${OTHER}: ${note.trim()}` : value;
}

export function buildSubmission(member: Member, answers: Answers, others: OtherNotes): Submission {
  const list = (id: "designTools" | "trackAvoidances") => answers[id].map((v) => withNote(v, others[id]));
  const { score, level } = levelOf(answers);
  return {
    fullName: member.fullName.trim(),
    major: member.major.trim(),
    academicYear: member.academicYear,
    submittedAt: new Date().toISOString(),

    levelScore: score,
    level,

    printingExperience: answers.printingExperience,
    projectAbility: answers.projectAbility,
    teamworkExperience: answers.teamworkExperience,

    designTools: list("designTools"),
    preferredActivities: answers.preferredActivities,
    explorePreference: answers.explorePreference,

    trackAvoidances: list("trackAvoidances"),
    helpingPreference: answers.helpingPreference,
    projectType: answers.projectType,

    preferredTimes: answers.preferredTimes,
    activityFormat: answers.activityFormat,
    potentialBlocker: withNote(answers.potentialBlocker, others.potentialBlocker),
    communityJoined: answers.communityJoined,

    successDefinition: answers.successDefinition.trim(),
    favoriteColor: answers.favoriteColor ?? { name: "", hex: "" },
    leadershipNote: answers.leadershipNote.trim(),
  };
}

/**
 * Sends one submission to the Google Apps Script web app.
 * The body goes as text/plain so the browser skips the CORS preflight, which
 * Apps Script can't answer. With no URL configured (local dev) the submission
 * is only logged, so the whole flow can still be tested.
 */
export async function submitAssessment(submission: Submission): Promise<SubmitMode> {
  if (!WEBHOOK_URL) {
    console.info("[3d-track] VITE_SUBMISSION_WEBHOOK_URL is not set — submission logged locally:", submission);
    await new Promise((r) => setTimeout(r, 700));
    return "local";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(submission),
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Submission failed with HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) throw new Error(data.error || "Submission rejected");
    return "remote";
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Local draft: a refresh or a failed submit never loses answers ----------

export interface Draft {
  answers: Answers;
  others: OtherNotes;
  step: number;
}

/**
 * Loads the saved draft, whatever version wrote it. Answers are re-validated against the
 * current questions: ones that still fit are kept, the rest start empty. A draft from an
 * older version resumes at its first unanswered question.
 */
export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version?: unknown; answers?: unknown; others?: unknown; step?: unknown };
    const answers = sanitizeAnswers(parsed?.answers);
    const sameVersion = parsed?.version === DRAFT_VERSION;
    // Notes typed under an older version's options don't belong to the current ones.
    const others: OtherNotes = {};
    if (sameVersion && parsed?.others && typeof parsed.others === "object") {
      for (const [k, v] of Object.entries(parsed.others)) {
        if (k in answers && typeof v === "string") others[k as keyof Answers] = v;
      }
    }
    const current = sameVersion && typeof parsed.step === "number" && Number.isInteger(parsed.step);
    const firstOpen = questions.findIndex((q) => !q.optional && !isAnswered(q, answers, others));
    const step = current
      ? Math.min(Math.max(0, parsed.step as number), questions.length - 1)
      : firstOpen === -1 ? questions.length - 1 : firstOpen;
    return { answers, others, step };
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: DRAFT_VERSION, ...draft }));
  } catch {
    /* storage unavailable (private mode): answers still live in memory */
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ---------- Member info: kept on its own so it survives a refresh on the intro screen ----------

export function loadMember(): Member {
  try {
    const raw = localStorage.getItem(MEMBER_KEY);
    if (raw) {
      const m = JSON.parse(raw) as Partial<Record<keyof Member, unknown>>;
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      return {
        fullName: str(m?.fullName),
        major: str(m?.major),
        academicYear: ACADEMIC_YEARS.includes(str(m?.academicYear)) ? str(m?.academicYear) : "",
      };
    }
    // v1 kept only the name: carry it over as the full name.
    return { ...emptyMember, fullName: localStorage.getItem(LEGACY_NAME_KEY) ?? "" };
  } catch {
    return emptyMember;
  }
}

export function saveMember(member: Member) {
  try {
    localStorage.removeItem(LEGACY_NAME_KEY);
    if (member.fullName || member.major || member.academicYear) localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
    else localStorage.removeItem(MEMBER_KEY);
  } catch {
    /* ignore */
  }
}
