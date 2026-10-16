export type CourseSlug = "aperitivo" | "primo" | "secondo" | "contorno" | "dessert" | "caffe";
export type PublishStatus = "draft" | "published";

export type Settings = {
  masthead: string;
  tagline: string;
  school_name: string;
  school_sites: string;
  school_year: string;
  about: string;
  footer_note: string;
};

export type Issue = {
  id: string;
  number: number;
  title: string;
  /** Primo giorno del mese di uscita, formato YYYY-MM-DD */
  month: string;
  editorial: string | null;
  cover_image: string | null;
  cover_alt: string | null;
  pdf_url: string | null;
  status: PublishStatus;
  is_demo: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Scheda speciale della rubrica «Dal campo al piatto». */
export type FieldToPlate = {
  ingredient: string;
  scientific_name: string;
  season: string;
  origin: string;
  field_notes: string;
  field_class: string;
  field_image: string | null;
  field_image_alt: string;
  recipe_title: string;
  servings: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  kitchen_class: string;
  plate_image: string | null;
  plate_image_alt: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string;
  author_name: string;
  author_role: string | null;
  course: CourseSlug;
  issue_id: string | null;
  cover_image: string | null;
  cover_alt: string | null;
  cover_credit: string | null;
  status: PublishStatus;
  featured: boolean;
  is_demo: boolean;
  extra: FieldToPlate | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArticleQuery = {
  course?: CourseSlug;
  issueId?: string;
  status?: PublishStatus | "all";
  search?: string;
  featured?: boolean;
  excludeId?: string;
  limit?: number;
};

export type PollStatus = "draft" | "open" | "closed";

export type PollOption = { id: string; label: string; position: number };

export type Poll = {
  id: string;
  question: string;
  description: string | null;
  status: PollStatus;
  issue_id: string | null;
  is_demo: boolean;
  created_at: string;
  options: PollOption[];
};

export type PollResults = { total: number; counts: Record<string, number> };

export type VoteOutcome = "ok" | "duplicate" | "closed" | "invalid";

export type SubmissionKind = "domanda" | "lettera" | "contributo";
export type SubmissionStatus = "pending" | "published" | "archived" | "rejected";

export type Submission = {
  id: string;
  kind: SubmissionKind;
  title: string | null;
  message: string;
  signature: string | null;
  class_label: string | null;
  status: SubmissionStatus;
  answer: string | null;
  is_demo: boolean;
  created_at: string;
  published_at: string | null;
};

export type SubmissionInput = {
  kind: SubmissionKind;
  title: string | null;
  message: string;
  signature: string | null;
  class_label: string | null;
};

export type CrosswordWord = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  dir: "across" | "down";
  number: number;
};

export type CrosswordData = {
  entries: { answer: string; clue: string }[];
  layout: { width: number; height: number; words: CrosswordWord[] };
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

export type QuizData = { questions: QuizQuestion[] };

export type Game =
  | (GameBase & { kind: "crossword"; data: CrosswordData })
  | (GameBase & { kind: "quiz"; data: QuizData });

type GameBase = {
  id: string;
  title: string;
  intro: string | null;
  status: PublishStatus;
  issue_id: string | null;
  is_demo: boolean;
  created_at: string;
};

export type StaffMember = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "pending" | "editor" | "admin";
};
