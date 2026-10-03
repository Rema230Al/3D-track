import type { AnswerKey, Answers, FavoriteColor, Member, Option, OtherNotes, Question } from "../types/assessment";

export const OTHER = "أخرى";

// ---------- Member information (intro screen, not counted as a question) ----------

export const ACADEMIC_YEARS = ["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة"];

export const emptyMember: Member = { fullName: "", major: "", academicYear: "" };

export const isTextValid = (v: string) => v.trim().length >= 2;

export const isMemberValid = (m: Member) =>
  isTextValid(m.fullName) && isTextValid(m.major) && ACADEMIC_YEARS.includes(m.academicYear);

// ---------- Assessment ----------
// The progress UI (Pixel Peak, rail, counters) derives its total from `questions.length`.

const CLOSEST_HINT = "اختر الأقرب لك";

export const questions: Question[] = [
  // ----- Section 1: current experience -----
  {
    id: "programmingExperience",
    code: "experience.log",
    kind: "single",
    title: "وش أقرب وصف لتجربتك في البرمجة؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما بنيت مشروع خارج مواد الجامعة" },
      { label: "بنيت مشروع شخصي واحد خارج الجامعة" },
      { label: "بنيت أكثر من مشروع شخصي" },
      { label: "اشتغلت على مشروع حقيقي (تدريب، أو فريلانس، أو منتج له مستخدمين)" },
    ],
  },
  {
    id: "buildAbility",
    code: "build.fromScratch()",
    kind: "single",
    title: "لو مسكت مشروع برمجي من الصفر، وش أقرب وصف لك؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما أعرف من وين أبدأ" },
      { label: "أبدأ إذا كانت الخطوات محددة لي" },
      { label: "أبدأ بنفسي، بس أحتاج مساعدة أثناء البناء" },
      { label: "أبني المشروع كامل بنفسي" },
    ],
  },
  {
    id: "gitGithubUsage",
    code: "git.status",
    kind: "single",
    title: "كيف تستخدم Git وGitHub في مشاريعك؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما أستخدمهم" },
      { label: "أسوي commit وpush وpull" },
      { label: "أستخدم branches وmerge وPull Requests، وأحل الـ conflicts" },
      { label: "أدير Git workflow لفريق" },
    ],
  },
  {
    id: "aiUsage",
    code: "ai.usage",
    kind: "single",
    title: "كيف تستخدم الـ AI أثناء البرمجة؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "أطلب منه كود وأنقله لمشروعي" },
      { label: "أرسل له ملفات من مشروعي وأطبق تعديلاته" },
      { label: "أستخدمه داخل بيئة التطوير ويعدل الملفات مباشرة" },
      { label: "أعطيه مهام كاملة كـ Agent، ويشغّل Commands ويتابع التنفيذ" },
    ],
  },
  {
    id: "teamworkExperience",
    code: "team.collab()",
    kind: "single",
    title: "وش تجربتك في العمل ضمن فريق برمجي؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما اشتغلت في فريق برمجي" },
      { label: "اشتغلت في فريق، وأحد غيري يوزع المهام" },
      { label: "أشارك في تقسيم المهام ودمج شغل الفريق" },
      { label: "أنظم شغل الفريق وأتابع المواعيد" },
    ],
  },
  {
    id: "technologiesUsed",
    code: "stack.used[]",
    kind: "multi",
    title: "وش التقنيات اللي استخدمتها فعلياً في مشروع؟",
    hint: "اختر كل اللي ينطبق عليك",
    options: [
      { label: "Python" },
      { label: "JavaScript / TypeScript" },
      { label: "Java" },
      { label: "React" },
      { label: "Next.js" },
      { label: "Flutter" },
      { label: "Node.js" },
      { label: "Firebase" },
      { label: "SQL" },
      { label: "Docker" },
      { label: "مكتبات AI / ML" },
      { label: OTHER, other: true },
    ],
  },

  // ----- Section 2: interests -----
  {
    id: "interests",
    code: "interests.pick(3)",
    kind: "multi",
    max: 3,
    title: "وش المجالات اللي تتحمس لها؟",
    hint: "اختر 3 كحد أقصى",
    options: [
      { label: "AI Agents & Automation" },
      { label: "Computer Vision / ML" },
      { label: "Web Development" },
      { label: "Mobile Development" },
      { label: "Backend & APIs" },
      { label: "DevOps & Cloud" },
      { label: "Cybersecurity" },
      { label: "Game Development" },
      { label: "UI/UX" },
      { label: "Open Source" },
      { label: OTHER, other: true },
    ],
  },
  {
    id: "preferredActivities",
    code: "activities.pick(2)",
    kind: "multi",
    max: 2,
    title: "وش نوع الأنشطة اللي تفضلها؟",
    hint: "اختر 2 كحد أقصى",
    options: [
      { label: "ورش تطبيقية" },
      { label: "مشروع جماعي نشتغل عليه طول الترم" },
      { label: "هاكاثونات وتحديات" },
      { label: "جلسات مع متحدثين من سوق العمل" },
      { label: "جلسات نحل فيها مشاكل مع بعض" },
    ],
  },
  {
    id: "learningPreference",
    code: "explore.mode",
    kind: "single",
    title: "لو قدمنا لك مجال جديد، وش تفضل؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "أجرب شي جديد كلياً", details: "وش المجال أو التقنية اللي ودك تجربها؟" },
      { label: "أتعمق في شي أعرفه", details: "وش المجال أو التقنية اللي ودك تتعمق فيها؟" },
      { label: "مزيج بين الاثنين" },
    ],
  },

  // ----- Section 3: expectations & roles -----
  {
    id: "trackAvoidances",
    code: "track.avoid[]",
    kind: "multi",
    title: "وش الشي اللي ما تبيه يصير في التراك؟",
    hint: "اختر كل اللي ينطبق عليك",
    options: [
      { label: "ورش نظرية بدون تطبيق" },
      { label: "محتوى أسهل من مستواي" },
      { label: "محتوى أصعب من مستواي" },
      { label: "اجتماعات كثيرة بدون فايدة واضحة" },
      { label: OTHER, other: true },
    ],
  },
  {
    id: "helpingPreference",
    code: "help.others()",
    kind: "single",
    title: "تحب تساعد غيرك أو تشرح لهم؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "لا، أفضل أركز على تعلمي" },
      { label: "أساعد إذا أحد سألني" },
      { label: "أحب أشرح، وأقدم جلسة لو أتيحت لي الفرصة" },
    ],
  },
  {
    id: "preferredTeamRole",
    code: "team.role",
    kind: "single",
    title: "وش الدور اللي تحبه في فريق؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "Frontend" },
      { label: "Backend" },
      { label: "تصميم الواجهات" },
      { label: "تنظيم الفريق وإدارته" },
      { label: "لسا ما أعرف" },
    ],
  },

  // ----- Section 4: logistics -----
  {
    id: "preferredTimes",
    code: "schedule.slots[]",
    kind: "multi",
    title: "وش أنسب وقت للأنشطة؟",
    hint: "اختر كل اللي يناسبك",
    options: [
      { label: "أيام الأسبوع، الصباح" },
      { label: "أيام الأسبوع، المساء" },
      { label: "نهاية الأسبوع" },
      { label: "ما يفرق عندي", exclusive: true },
    ],
  },
  {
    id: "activityFormat",
    code: "activities.format",
    kind: "single",
    title: "كيف تفضل تكون الأنشطة؟",
    hint: CLOSEST_HINT,
    options: [{ label: "حضوري" }, { label: "أونلاين" }, { label: "الاثنين مناسبين لي" }],
  },
  {
    id: "potentialBlocker",
    code: "blockers.peek()",
    kind: "single",
    title: "وش أكثر شي ممكن يعطلك خلال المسار؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ضغط الدراسة والاختبارات" },
      { label: "المحتوى أصعب من مستواي" },
      { label: "أعلق وما أعرف أكمل لحالي" },
      { label: "أفقد الحماس مع الوقت" },
      { label: OTHER, other: true, required: true },
    ],
  },

  // ----- Section 5: closing -----
  {
    id: "successDefinition",
    code: "success.define()",
    kind: "text",
    multiline: true,
    title: "بنهاية الترم، وش الشي اللي لو حققته بتقول \"دخولي Programming Track كان يستاهل\"؟",
    hint: "جملة أو جملتين تكفي",
    placeholder: "اكتب إجابتك هنا...",
  },
  {
    id: "favoriteColor",
    code: "identity.color",
    kind: "color",
    title: "لو كان لك لون، وش بيكون؟ 🎨",
    hint: "اضغط على لونك",
    // Shades tuned to read clearly on the dark interface. Name + hex are both submitted.
    options: [
      { name: "Purple", hex: "#7B4DFF" },
      { name: "Blue", hex: "#3D7BFF" },
      { name: "Cyan", hex: "#57E3D8" },
      { name: "Green", hex: "#4ADE80" },
      { name: "Yellow", hex: "#FACC15" },
      { name: "Orange", hex: "#F4A664" },
      { name: "Red", hex: "#F0524F" },
      { name: "Pink", hex: "#F472B6" },
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#F5F5F5" },
    ],
  },
  {
    id: "leadershipNote",
    code: "note.toLeaders()",
    kind: "text",
    multiline: true,
    optional: true,
    title: "إذا عندك أي ملاحظة أو اقتراح للـ Leader والـ Co-Leader، اكتبها هنا 🤍",
    hint: "اختياري، تقدر تتركه فاضي",
    placeholder: "اكتب ملاحظتك هنا...",
  },
];

export const emptyAnswers: Answers = {
  programmingExperience: "",
  buildAbility: "",
  gitGithubUsage: "",
  aiUsage: "",
  teamworkExperience: "",
  technologiesUsed: [],
  interests: [],
  preferredActivities: [],
  learningPreference: "",
  trackAvoidances: [],
  helpingPreference: "",
  preferredTeamRole: "",
  preferredTimes: [],
  activityFormat: "",
  potentialBlocker: "",
  successDefinition: "",
  favoriteColor: null,
  leadershipNote: "",
};

/** The option's text field must be filled in: `details` options and a required "أخرى". */
export const needsNote = (opt?: Option) => !!opt && (!!opt.details || (!!opt.other && !!opt.required));

/** The selected option asks for text, and it's filled in (always true otherwise). */
export function detailsGiven(q: Question, answers: Answers, notes: OtherNotes): boolean {
  if (q.kind !== "single") return true;
  const opt = q.options.find((o) => o.label === answers[q.id]);
  return !needsNote(opt) || isTextValid(notes[q.id] ?? "");
}

/** Has the member actually answered it (an empty optional question is not answered). */
export function isAnswered(q: Question, answers: Answers, notes: OtherNotes): boolean {
  const value = answers[q.id];
  if (!detailsGiven(q, answers, notes)) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || typeof value === "object") return value !== null;
  if (q.kind === "text") return q.optional ? value.trim().length > 0 : isTextValid(value);
  return value !== "";
}

/** Can the member move past it. */
export const canContinue = (q: Question, answers: Answers, notes: OtherNotes) =>
  q.optional === true || isAnswered(q, answers, notes);

/**
 * Rebuilds a trustworthy Answers object from whatever was stored (possibly an older schema).
 * Anything that no longer matches the current questions is dropped back to empty.
 */
export function sanitizeAnswers(raw: unknown): Answers {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Answers = { ...emptyAnswers };
  const set = <K extends AnswerKey>(k: K, v: Answers[K]) => (out[k] = v);

  for (const q of questions) {
    const v = src[q.id];
    if (q.kind === "single") {
      const labels: string[] = q.options.map((o) => o.label);
      if (typeof v === "string" && labels.includes(v)) set(q.id, v);
    } else if (q.kind === "multi") {
      if (!Array.isArray(v)) continue;
      let picked = [...new Set(v)].filter((x): x is string => typeof x === "string" && q.options.some((o) => o.label === x));
      const exclusive = picked.find((x) => q.options.some((o) => o.exclusive && o.label === x));
      if (exclusive) picked = [exclusive];
      if (q.max !== undefined) picked = picked.slice(0, q.max);
      set(q.id, picked);
    } else if (q.kind === "text") {
      if (typeof v === "string") set(q.id, v);
    } else if (q.kind === "color") {
      const hex = v && typeof v === "object" ? (v as Partial<FavoriteColor>).hex : undefined;
      const match = q.options.find((c) => c.hex === hex);
      if (match) set(q.id, match);
    }
  }
  return out;
}
