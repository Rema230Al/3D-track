import type { AnswerKey, Answers, FavoriteColor, Level, Member, Option, OtherNotes, Question } from "../types/assessment";

export const OTHER = "أخرى";

// ---------- Member information (intro screen, not counted as a question) ----------

export const ACADEMIC_YEARS = ["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة"];

export const emptyMember: Member = { fullName: "", major: "", academicYear: "" };

export const isTextValid = (v: string) => v.trim().length >= 2;

export const isMemberValid = (m: Member) =>
  isTextValid(m.fullName) && isTextValid(m.major) && ACADEMIC_YEARS.includes(m.academicYear);

// ---------- Assessment: 3D Printing Track ----------
// The progress UI (Pixel Peak, rail, counters) derives its total from `questions.length`.
// Every "أخرى" opens a required text field; what's typed is saved as "أخرى: <text>".

const CLOSEST_HINT = "اختر الأقرب لك";
const ALL_HINT = "اختر كل اللي ينطبق عليك";
const other: Option = { label: OTHER, other: true, required: true };

export const questions: Question[] = [
  // ----- Level (scored, see `levelOf`) -----
  {
    id: "printingExperience",
    object: "Experience",
    kind: "single",
    title: "وش أقرب وصف لتجربتك في الطباعة ثلاثية الأبعاد؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما طبعت أو صممت أي نموذج خارج مواد الجامعة." },
      { label: "صممت وطبعت مشروعاً شخصياً واحداً خارج نطاق الجامعة." },
      { label: "صممت وطبعت أكثر من نموذج أو مشروع شخصي." },
      { label: "نفذت مشاريع عملية لغيري (سواء بطلب، أو لمسابقات، أو منتجات جاهزة للاستخدام)." },
    ],
  },
  {
    id: "projectAbility",
    object: "Build",
    kind: "single",
    title: "لو مسكت مشروع طباعة ثلاثية الأبعاد من الصفر، وش أقرب وصف لك؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما أعرف من وين أبدأ" },
      { label: "أبدأ إذا كانت الخطوات ومقاييس النموذج واضحة لي" },
      { label: "أبدأ أصمم وأطبع بنفسي، بس أحتاج مساعدة أو استشارة أثناء التعديل" },
      { label: "أصمم النموذج وأضبط إعدادات الطابعة وأنفذ المشروع كامل بنفسي" },
    ],
  },
  {
    id: "teamworkExperience",
    object: "Teamwork",
    kind: "single",
    title: "وش تجربتك في العمل ضمن فريق في مشروع طباعة ثلاثية الأبعاد؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ما اشتغلت في فريق من قبل" },
      { label: "اشتغلت في فريق، وغيري وزع المهام" },
      { label: "أشارك في تقسيم وتنسيق مهام الفريق" },
      { label: "أقود الفريق، أنظم سير العمل وأتابع المواعيد" },
    ],
  },

  // ----- Tools & interests -----
  {
    id: "designTools",
    object: "Software",
    kind: "multi",
    title: "وش التقنيات وبرامج التصميم اللي استخدمتها فعلياً في مشروع؟",
    hint: ALL_HINT,
    options: [
      { label: "Tinkercad" },
      { label: "Autodesk Inventor" },
      { label: "Autodesk Fusion" },
      { label: "SolidWorks" },
      { label: "AutoCAD" },
      { label: "Blender" },
      { label: "FreeCAD" },
      { label: "أدوات تعتمد على الذكاء الاصطناعي (AI)" },
      other,
    ],
  },
  {
    id: "preferredActivities",
    object: "Activities",
    kind: "multi",
    max: 2,
    title: "وش نوع الأنشطة اللي تفضلها؟",
    hint: "اختر 2 كحد أقصى",
    options: [
      { label: "ورش تطبيقية للنمذجة والطباعة" },
      { label: "مشروع جماعي نشتغل عليه طول الترم" },
      { label: "هاكاثونات وتحديات ابتكارية" },
      { label: "جلسات مع متخصصين من سوق العمل" },
      { label: "جلسات نحل فيها مشاكل وطباعات متعثرة مع بعض" },
    ],
  },
  {
    id: "explorePreference",
    object: "Explore",
    kind: "single",
    title: "عادي تجرب شيء جديد ولا تتعمق في نفس اللي متعود عليه من مجالات و مهارات و برامج؟",
    hint: CLOSEST_HINT,
    options: [{ label: "أجرب شي جديد كلياً" }, { label: "أتعمق في شي أعرفه" }, { label: "مزيج بين الاثنين" }],
  },

  // ----- Expectations & roles -----
  {
    id: "trackAvoidances",
    object: "Avoid",
    kind: "multi",
    title: "وش الشي اللي ما تبيه يصير في التراك؟",
    hint: ALL_HINT,
    options: [
      { label: "ورش نظرية بدون تطبيق" },
      { label: "محتوى أسهل من مستواي" },
      { label: "محتوى أصعب من مستواي" },
      { label: "اجتماعات كثيرة بدون فايدة واضحة" },
      other,
    ],
  },
  {
    id: "helpingPreference",
    object: "Helping",
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
    id: "projectType",
    object: "Projects",
    kind: "single",
    title: "وش نوع المشاريع اللي تحب تشتغل عليها؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "النماذج الأولية (Prototyping)" },
      { label: "المشاريع الإبداعية" },
      { label: "النماذج القابلة للبيع أو الـ MVP" },
      { label: "لسا ما أعرف" },
    ],
  },

  // ----- Logistics -----
  {
    id: "preferredTimes",
    object: "Schedule",
    kind: "multi",
    title: "وش أنسب وقت للأنشطة و الإجتماعات ؟",
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
    object: "Format",
    kind: "single",
    title: "كيف تفضل تكون الأنشطة؟",
    hint: CLOSEST_HINT,
    options: [{ label: "حضوري" }, { label: "أونلاين" }, { label: "الاثنين مناسبين لي" }],
  },
  {
    id: "potentialBlocker",
    object: "Blockers",
    kind: "single",
    title: "وش أكثر شي ممكن يعطلك خلال المسار؟",
    hint: CLOSEST_HINT,
    options: [
      { label: "ضغط الدراسة والاختبارات" },
      { label: "المحتوى أصعب من مستواي" },
      { label: "أعلّق وما أعرف أكمل لحالي" },
      { label: "أفقد الحماس مع الوقت" },
      other,
    ],
  },
  {
    id: "communityJoined",
    object: "Community",
    kind: "single",
    title: "هل دخلت سيرفر الديسكورد (للاجتماعات و بنك الافكار) ومنصة نوشن (لترتيب و متابعة المهام)؟",
    hint: CLOSEST_HINT,
    links: [
      { label: "رابط الديسكورد", href: "https://discord.gg/aZmy42e9A" },
      { label: "رابط النوشن", href: "https://app.notion.com/invite/cba993779b032804ceb239b6a3ed2bdeae345610" },
    ],
    options: [{ label: "إيوه دخلت الاثنين" }, { label: "دخلت أحدهما فقط" }, { label: "لسا، بدخل الحين" }],
  },

  // ----- Closing -----
  {
    id: "successDefinition",
    object: "Success",
    kind: "text",
    multiline: true,
    title: "بنهاية الترم، وش الشي اللي لو حققته بتقول \"دخولي 3D Printing Track كان يستاهل\"؟",
    hint: "جملة أو جملتين تكفي",
    placeholder: "اكتب إجابتك هنا...",
  },
  {
    id: "favoriteColor",
    object: "Color",
    kind: "color",
    title: "لو كان لك لون وش بيكون ؟",
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
    object: "Note",
    kind: "text",
    multiline: true,
    optional: true,
    title: "إذا عندك أي ملاحظة أو اقتراح اكتبها هنا 🤍",
    hint: "اختياري، تقدر تتركه فاضي",
    placeholder: "اكتب ملاحظتك هنا...",
  },
];

export const emptyAnswers: Answers = {
  printingExperience: "",
  projectAbility: "",
  teamworkExperience: "",
  designTools: [],
  preferredActivities: [],
  explorePreference: "",
  trackAvoidances: [],
  helpingPreference: "",
  projectType: "",
  preferredTimes: [],
  activityFormat: "",
  potentialBlocker: "",
  communityJoined: "",
  successDefinition: "",
  favoriteColor: null,
  leadershipNote: "",
};

// ---------- Level (saved with the response, never shown to the member) ----------
// Questions 1–3: option 01 = 1 point … 04 = 4 points, so the total runs 3–12.

const LEVEL_QUESTIONS: AnswerKey[] = ["printingExperience", "projectAbility", "teamworkExperience"];

export function levelOf(answers: Answers): { score: number; level: Level } {
  const score = LEVEL_QUESTIONS.reduce((sum, id) => {
    const q = questions.find((qq) => qq.id === id);
    const i = q?.kind === "single" ? q.options.findIndex((o) => o.label === answers[id]) : -1;
    return sum + (i + 1);
  }, 0);
  const level: Level = score >= 10 ? "Advanced" : score >= 6 ? "Intermediate" : "Beginner";
  return { score, level };
}

/** The option's text field must be filled in: `details` options and a required "أخرى". */
export const needsNote = (opt?: Option) => !!opt && (!!opt.details || (!!opt.other && !!opt.required));

/** The selected option asks for text, and it's filled in (always true otherwise). */
export function detailsGiven(q: Question, answers: Answers, notes: OtherNotes): boolean {
  if (q.kind === "single") {
    const opt = q.options.find((o) => o.label === answers[q.id]);
    return !needsNote(opt) || isTextValid(notes[q.id] ?? "");
  }
  if (q.kind === "multi") {
    const value = answers[q.id] as string[];
    const opt = q.options.find((o) => needsNote(o) && value.includes(o.label));
    return !opt || isTextValid(notes[q.id] ?? "");
  }
  return true;
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
