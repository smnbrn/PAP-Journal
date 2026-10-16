import type {
  Article,
  ArticleQuery,
  Game,
  Issue,
  Poll,
  PollResults,
  PollStatus,
  PublishStatus,
  Settings,
  StaffMember,
  Submission,
  SubmissionInput,
  SubmissionStatus,
  VoteOutcome,
} from "../types";

export type ArticleInput = Omit<Article, "id" | "created_at" | "updated_at" | "is_demo"> & {
  id?: string;
};

export type IssueInput = Omit<Issue, "id" | "created_at" | "updated_at" | "is_demo"> & {
  id?: string;
};

export type PollInput = {
  id?: string;
  question: string;
  description: string | null;
  status: PollStatus;
  issue_id: string | null;
  /** Opzioni esistenti mantengono l'id; quelle nuove non lo hanno. */
  options: { id?: string; label: string }[];
};

export type GameInput = Omit<Game, "id" | "created_at" | "is_demo"> & { id?: string };

/** Lettura dei contenuti pubblici. */
export interface ReadStore {
  getSettings(): Promise<Settings>;
  listIssues(): Promise<Issue[]>;
  listArticles(query?: ArticleQuery): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  listPolls(statuses?: PollStatus[]): Promise<Poll[]>;
  listGames(): Promise<Game[]>;
  getGame(id: string): Promise<Game | null>;
  listPublishedSubmissions(): Promise<Submission[]>;
}

/** Azioni consentite ai lettori, sempre controllate dal server. */
export interface PublicActions {
  getPollResults(pollId: string): Promise<PollResults>;
  vote(pollId: string, optionId: string, voterHash: string): Promise<VoteOutcome>;
  submit(input: SubmissionInput): Promise<void>;
}

/** Gestione dei contenuti: solo per la redazione autenticata. */
export interface AdminStore extends ReadStore {
  getArticle(id: string): Promise<Article | null>;
  saveArticle(input: ArticleInput): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getIssue(id: string): Promise<Issue | null>;
  saveIssue(input: IssueInput): Promise<Issue>;
  deleteIssue(id: string): Promise<void>;
  getPoll(id: string): Promise<Poll | null>;
  savePoll(input: PollInput): Promise<Poll>;
  deletePoll(id: string): Promise<void>;
  getPollResults(pollId: string): Promise<PollResults>;
  saveGame(input: GameInput): Promise<Game>;
  deleteGame(id: string): Promise<void>;
  listSubmissions(status?: SubmissionStatus): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | null>;
  updateSubmission(
    id: string,
    patch: { status?: SubmissionStatus; answer?: string | null },
  ): Promise<void>;
  deleteSubmission(id: string): Promise<void>;
  saveSettings(settings: Settings): Promise<void>;
  importDemo(): Promise<void>;
  removeDemo(): Promise<void>;
  listStaff(): Promise<StaffMember[] | null>;
  setStaffRole(id: string, role: StaffMember["role"]): Promise<void>;
}

export type { PublishStatus };
