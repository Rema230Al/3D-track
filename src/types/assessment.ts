// The three stages of the experience: 01 SCENE SETUP → 02 ASSESSMENT → 03 RENDER COMPLETE.
export type Stage = "init" | "assessment" | "complete";

/** Member information, collected on the intro screen (not an assessment question). */
export interface Member {
  fullName: string;
  major: string;
  academicYear: string;
}

export interface Answers {
  // Level (questions 1–3, scored)
  printingExperience: string;
  projectAbility: string;
  teamworkExperience: string;
  // Tools & interests
  designTools: string[];
  preferredActivities: string[];
  explorePreference: string;
  // Expectations & roles
  trackAvoidances: string[];
  helpingPreference: string;
  projectType: string;
  // Logistics
  preferredTimes: string[];
  activityFormat: string;
  potentialBlocker: string;
  communityJoined: string;
  // Closing
  successDefinition: string;
  /** "Claim your color": null until a color is claimed. */
  favoriteColor: FavoriteColor | null;
  /** Optional. */
  leadershipNote: string;
}

/** Level from questions 1–3 (score 3–12). Stored with the response only, never shown. */
export type Level = "Beginner" | "Intermediate" | "Advanced";

/** A claimable color: readable name + exact hex, both stored. */
export interface FavoriteColor {
  name: string;
  hex: string;
}

export type AnswerKey = keyof Answers;
export type AnswerValue = Answers[AnswerKey];

/** The object sent to the Google Apps Script endpoint. */
export interface Submission {
  fullName: string;
  major: string;
  academicYear: string;
  submittedAt: string;

  /** Sum of questions 1–3 (01 = 1 … 04 = 4): 3–12. */
  levelScore: number;
  level: Level;

  printingExperience: string;
  projectAbility: string;
  teamworkExperience: string;

  /** "أخرى" is sent as "أخرى: <what they typed>" in every list or single answer. */
  designTools: string[];
  preferredActivities: string[];
  explorePreference: string;
  /** Optional text typed under option 01 / 02 of question 6; empty otherwise. */
  explorePreferenceDetails: string;

  trackAvoidances: string[];
  helpingPreference: string;
  projectType: string;

  preferredTimes: string[];
  activityFormat: string;
  potentialBlocker: string;
  communityJoined: string;

  successDefinition: string;
  favoriteColor: FavoriteColor;
  leadershipNote: string;
}

/** Free text typed under the selected option ("أخرى" or an option with `details`), per question. */
export type OtherNotes = Partial<Record<AnswerKey, string>>;

export interface Option {
  label: string;
  /** Selecting it opens a short text field ("أخرى"). */
  other?: boolean;
  /** with `other`: the text must be filled in before continuing. */
  required?: boolean;
  /** Selecting it clears every other choice (and vice versa). */
  exclusive?: boolean;
  /** single only: selecting it asks for required details, with this prompt. */
  details?: string;
  /** single only: selecting it opens an OPTIONAL text field with this placeholder. */
  optionalNote?: string;
}

interface QuestionBase {
  id: AnswerKey;
  /** Scene-object name shown above the question ("Object · Success") and in the outliner. */
  object: string;
  title: string;
  /** Short helper line under the title. */
  hint: string;
  /** Optional lead-in line shown above the title. */
  lead?: string;
  /** Can be left empty (only the closing note). */
  optional?: boolean;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "single" | "multi";
  options: Option[];
  /** multi only: maximum number of selections. */
  max?: number;
  /** Links shown under the hint, opened in a new tab (e.g. the Discord / Notion invites). */
  links?: { label: string; href: string }[];
}

export interface TextQuestion extends QuestionBase {
  kind: "text";
  placeholder: string;
  multiline?: boolean;
  /** Tap-to-add tokens under the field. */
  suggestions?: string[];
}

export interface ColorQuestion extends QuestionBase {
  kind: "color";
  options: FavoriteColor[];
}

export type Question = ChoiceQuestion | TextQuestion | ColorQuestion;
