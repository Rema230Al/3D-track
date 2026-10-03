// The three stages of the experience: 01 SCENE SETUP → 02 ASSESSMENT → 03 RENDER COMPLETE.
export type Stage = "init" | "assessment" | "complete";

/** Member information, collected on the intro screen (not an assessment question). */
export interface Member {
  fullName: string;
  major: string;
  academicYear: string;
}

export interface Answers {
  // Current experience
  programmingExperience: string;
  buildAbility: string;
  gitGithubUsage: string;
  aiUsage: string;
  teamworkExperience: string;
  technologiesUsed: string[];
  // Interests
  interests: string[];
  preferredActivities: string[];
  learningPreference: string;
  // Expectations & roles
  trackAvoidances: string[];
  helpingPreference: string;
  preferredTeamRole: string;
  // Logistics
  preferredTimes: string[];
  activityFormat: string;
  potentialBlocker: string;
  // Closing
  successDefinition: string;
  /** "Claim your color": null until a color is claimed. */
  favoriteColor: FavoriteColor | null;
  /** Optional. */
  leadershipNote: string;
}

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

  programmingExperience: string;
  buildAbility: string;
  gitGithubUsage: string;
  aiUsage: string;
  teamworkExperience: string;
  technologiesUsed: string[];

  interests: string[];
  preferredActivities: string[];
  learningPreference: string;
  /** What exactly they want to try / go deeper in; empty for options that don't ask. */
  learningPreferenceDetails: string;

  trackAvoidances: string[];
  helpingPreference: string;
  preferredTeamRole: string;

  preferredTimes: string[];
  activityFormat: string;
  potentialBlocker: string;

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
}

interface QuestionBase {
  id: AnswerKey;
  /** Code-style name shown above the question, e.g. `stack.used`. */
  code: string;
  title: string;
  /** Short helper line under the title. */
  hint: string;
  /** Optional lead-in line shown above the title. */
  lead?: string;
  /** Can be left empty (only the leadership note). */
  optional?: boolean;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "single" | "multi";
  options: Option[];
  /** multi only: maximum number of selections. */
  max?: number;
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
