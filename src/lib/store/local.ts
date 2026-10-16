import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  demoArticles,
  demoGames,
  demoIssues,
  demoPolls,
  demoSettings,
  demoSubmissions,
  demoVotes,
} from "../demo";
import { normalizeForSearch, stripHtml } from "../format";
import type {
  Article,
  ArticleQuery,
  Game,
  Issue,
  Poll,
  PollResults,
  PollStatus,
  Settings,
  Submission,
  SubmissionInput,
  SubmissionStatus,
  VoteOutcome,
} from "../types";
import type { AdminStore, ArticleInput, GameInput, IssueInput, PollInput, PublicActions } from "./types";

/**
 * Archivio della modalità prova: un file JSON in `.data/db.json`.
 * Pensato per provare il sito sul proprio computer senza configurare nulla.
 */
type Vote = { poll_id: string; option_id: string; voter_hash: string; created_at: string };
type Db = {
  settings: Settings;
  issues: Issue[];
  articles: Article[];
  polls: Poll[];
  votes: Vote[];
  submissions: Submission[];
  games: Game[];
};

export const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function demoVoteRows(): Vote[] {
  return demoVotes.flatMap((v) =>
    Array.from({ length: v.count }, (_, i) => ({
      poll_id: v.poll_id,
      option_id: v.option_id,
      voter_hash: `demo-${v.option_id}-${i}`,
      created_at: "2026-12-01T08:00:00.000Z",
    })),
  );
}

function seed(): Db {
  return structuredClone({
    settings: demoSettings,
    issues: demoIssues,
    articles: demoArticles,
    polls: demoPolls,
    votes: demoVoteRows(),
    submissions: demoSubmissions,
    games: demoGames,
  });
}

async function load(): Promise<Db> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Db;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seed();
    throw error;
  }
}

async function save(db: Db) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await rename(tmp, DB_FILE);
  } catch {
    throw new Error(
      "Impossibile salvare: in questo ambiente la modalità prova è in sola lettura. Configura Supabase per gestire i contenuti online.",
    );
  }
}

/** Esegue una modifica in sequenza, così due salvataggi non si sovrascrivono. */
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

function byDateDesc(a: Article, b: Article) {
  return (
    (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at) ||
    b.created_at.localeCompare(a.created_at)
  );
}

function searchScore(article: Article, terms: string[]) {
  const title = normalizeForSearch(`${article.title} ${article.subtitle ?? ""}`);
  const rest = normalizeForSearch(
    `${article.excerpt ?? ""} ${article.author_name} ${stripHtml(article.body)}`,
  );
  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 3;
    else if (rest.includes(term)) score += 1;
    else return 0;
  }
  return score;
}

export class LocalStore implements AdminStore, PublicActions {
  constructor(private readonly includeDrafts: boolean) {}

  private visibleArticle(db: Db, a: Article) {
    if (this.includeDrafts) return true;
    if (a.status !== "published") return false;
    if (!a.issue_id) return true;
    return db.issues.some((i) => i.id === a.issue_id && i.status === "published");
  }

  async getSettings() {
    return { ...demoSettings, ...(await load()).settings };
  }

  async listIssues() {
    const db = await load();
    return db.issues
      .filter((i) => this.includeDrafts || i.status === "published")
      .sort((a, b) => b.number - a.number);
  }

  async listArticles(query: ArticleQuery = {}) {
    const db = await load();
    let list = db.articles.filter((a) => this.visibleArticle(db, a));
    if (query.status && query.status !== "all") list = list.filter((a) => a.status === query.status);
    if (query.course) list = list.filter((a) => a.course === query.course);
    if (query.issueId) list = list.filter((a) => a.issue_id === query.issueId);
    if (query.featured) list = list.filter((a) => a.featured);
    if (query.excludeId) list = list.filter((a) => a.id !== query.excludeId);
    if (query.search?.trim()) {
      // Radice approssimativa: «castagne» trova anche «castagna».
      const terms = normalizeForSearch(query.search)
        .split(/\s+/)
        .filter((t) => t.length > 1)
        .map((t) => (t.length > 4 ? t.slice(0, -1) : t));
      list = list
        .map((a) => ({ a, s: searchScore(a, terms) }))
        .filter((x) => x.s > 0)
        .sort((x, y) => y.s - x.s || byDateDesc(x.a, y.a))
        .map((x) => x.a);
    } else {
      list = list.sort(byDateDesc);
    }
    return query.limit ? list.slice(0, query.limit) : list;
  }

  async getArticleBySlug(slug: string) {
    const db = await load();
    return db.articles.find((a) => a.slug === slug && this.visibleArticle(db, a)) ?? null;
  }

  async getArticle(id: string) {
    return (await load()).articles.find((a) => a.id === id) ?? null;
  }

  async saveArticle(input: ArticleInput) {
    return mutate((db) => {
      let slug = input.slug;
      let n = 2;
      while (db.articles.some((a) => a.slug === slug && a.id !== input.id)) slug = `${input.slug}-${n++}`;
      const existing = input.id ? db.articles.find((a) => a.id === input.id) : undefined;
      const article: Article = {
        ...(existing ?? { id: randomUUID(), created_at: now(), is_demo: false }),
        ...input,
        slug,
        id: existing?.id ?? randomUUID(),
        updated_at: now(),
      } as Article;
      if (existing) db.articles = db.articles.map((a) => (a.id === article.id ? article : a));
      else db.articles.push(article);
      return article;
    });
  }

  async deleteArticle(id: string) {
    await mutate((db) => {
      db.articles = db.articles.filter((a) => a.id !== id);
    });
  }

  async getIssue(id: string) {
    return (await load()).issues.find((i) => i.id === id) ?? null;
  }

  async saveIssue(input: IssueInput) {
    return mutate((db) => {
      if (db.issues.some((i) => i.number === input.number && i.id !== input.id)) {
        throw new Error(`Esiste già un numero ${input.number}.`);
      }
      const existing = input.id ? db.issues.find((i) => i.id === input.id) : undefined;
      const issue: Issue = {
        ...(existing ?? { created_at: now(), is_demo: false }),
        ...input,
        id: existing?.id ?? randomUUID(),
        updated_at: now(),
      } as Issue;
      if (existing) db.issues = db.issues.map((i) => (i.id === issue.id ? issue : i));
      else db.issues.push(issue);
      return issue;
    });
  }

  async deleteIssue(id: string) {
    await mutate((db) => {
      db.issues = db.issues.filter((i) => i.id !== id);
      db.articles = db.articles.map((a) => (a.issue_id === id ? { ...a, issue_id: null } : a));
      db.polls = db.polls.map((p) => (p.issue_id === id ? { ...p, issue_id: null } : p));
      db.games = db.games.map((g) => (g.issue_id === id ? { ...g, issue_id: null } : g));
    });
  }

  async listPolls(statuses?: PollStatus[]) {
    const allowed: PollStatus[] = statuses ?? (this.includeDrafts ? ["draft", "open", "closed"] : ["open", "closed"]);
    const visible = this.includeDrafts ? allowed : allowed.filter((s) => s !== "draft");
    return (await load()).polls
      .filter((p) => visible.includes(p.status))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async getPoll(id: string) {
    return (await load()).polls.find((p) => p.id === id) ?? null;
  }

  async savePoll(input: PollInput) {
    return mutate((db) => {
      const existing = input.id ? db.polls.find((p) => p.id === input.id) : undefined;
      const poll: Poll = {
        id: existing?.id ?? randomUUID(),
        created_at: existing?.created_at ?? now(),
        is_demo: existing?.is_demo ?? false,
        question: input.question,
        description: input.description,
        status: input.status,
        issue_id: input.issue_id,
        options: input.options.map((o, position) => ({ id: o.id ?? randomUUID(), label: o.label, position })),
      };
      const kept = new Set(poll.options.map((o) => o.id));
      db.votes = db.votes.filter((v) => v.poll_id !== poll.id || kept.has(v.option_id));
      if (existing) db.polls = db.polls.map((p) => (p.id === poll.id ? poll : p));
      else db.polls.push(poll);
      return poll;
    });
  }

  async deletePoll(id: string) {
    await mutate((db) => {
      db.polls = db.polls.filter((p) => p.id !== id);
      db.votes = db.votes.filter((v) => v.poll_id !== id);
    });
  }

  async getPollResults(pollId: string): Promise<PollResults> {
    const db = await load();
    const poll = db.polls.find((p) => p.id === pollId);
    if (!poll || (!this.includeDrafts && poll.status === "draft")) return { total: 0, counts: {} };
    const counts: Record<string, number> = Object.fromEntries(poll.options.map((o) => [o.id, 0]));
    for (const v of db.votes) if (v.poll_id === pollId && v.option_id in counts) counts[v.option_id]++;
    return { total: Object.values(counts).reduce((s, n) => s + n, 0), counts };
  }

  async vote(pollId: string, optionId: string, voterHash: string): Promise<VoteOutcome> {
    return mutate((db) => {
      const poll = db.polls.find((p) => p.id === pollId);
      if (!poll || !poll.options.some((o) => o.id === optionId)) return "invalid";
      if (poll.status !== "open") return "closed";
      if (db.votes.some((v) => v.poll_id === pollId && v.voter_hash === voterHash)) return "duplicate";
      db.votes.push({ poll_id: pollId, option_id: optionId, voter_hash: voterHash, created_at: now() });
      return "ok";
    });
  }

  async listGames() {
    return (await load()).games
      .filter((g) => this.includeDrafts || g.status === "published")
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async getGame(id: string) {
    const game = (await load()).games.find((g) => g.id === id);
    return game && (this.includeDrafts || game.status === "published") ? game : null;
  }

  async saveGame(input: GameInput) {
    return mutate((db) => {
      const existing = input.id ? db.games.find((g) => g.id === input.id) : undefined;
      const game = {
        ...input,
        id: existing?.id ?? randomUUID(),
        created_at: existing?.created_at ?? now(),
        is_demo: existing?.is_demo ?? false,
      } as Game;
      if (existing) db.games = db.games.map((g) => (g.id === game.id ? game : g));
      else db.games.push(game);
      return game;
    });
  }

  async deleteGame(id: string) {
    await mutate((db) => {
      db.games = db.games.filter((g) => g.id !== id);
    });
  }

  async listPublishedSubmissions() {
    return (await load()).submissions
      .filter((s) => s.status === "published")
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
  }

  async listSubmissions(status?: SubmissionStatus) {
    return (await load()).submissions
      .filter((s) => !status || s.status === status)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async getSubmission(id: string) {
    return (await load()).submissions.find((s) => s.id === id) ?? null;
  }

  async submit(input: SubmissionInput) {
    await mutate((db) => {
      db.submissions.push({
        ...input,
        id: randomUUID(),
        status: "pending",
        answer: null,
        is_demo: false,
        created_at: now(),
        published_at: null,
      });
    });
  }

  async updateSubmission(id: string, patch: { status?: SubmissionStatus; answer?: string | null }) {
    await mutate((db) => {
      db.submissions = db.submissions.map((s) =>
        s.id === id
          ? {
              ...s,
              ...patch,
              published_at:
                patch.status === "published" ? (s.published_at ?? now()) : patch.status ? null : s.published_at,
            }
          : s,
      );
    });
  }

  async deleteSubmission(id: string) {
    await mutate((db) => {
      db.submissions = db.submissions.filter((s) => s.id !== id);
    });
  }

  async saveSettings(settings: Settings) {
    await mutate((db) => {
      db.settings = settings;
    });
  }

  async importDemo() {
    await mutate((db) => {
      const s = seed();
      const merge = <T extends { id: string }>(current: T[], extra: T[]) => [
        ...current,
        ...extra.filter((e) => !current.some((c) => c.id === e.id)),
      ];
      // Un numero dimostrativo non può prendere il posto di un numero vero.
      const freeIssues = s.issues.filter((i) => !db.issues.some((c) => c.number === i.number && c.id !== i.id));
      db.issues = merge(db.issues, freeIssues);
      const issueIds = new Set(db.issues.map((i) => i.id));
      db.articles = merge(
        db.articles,
        s.articles
          .filter((a) => !db.articles.some((c) => c.slug === a.slug && c.id !== a.id))
          .map((a) => (a.issue_id && !issueIds.has(a.issue_id) ? { ...a, issue_id: null } : a)),
      );
      db.polls = merge(db.polls, s.polls);
      db.votes = [...db.votes.filter((v) => !v.voter_hash.startsWith("demo-")), ...s.votes];
      db.submissions = merge(db.submissions, s.submissions);
      db.games = merge(db.games, s.games);
    });
  }

  async removeDemo() {
    await mutate((db) => {
      const demoIssueIds = new Set(db.issues.filter((i) => i.is_demo).map((i) => i.id));
      const demoPollIds = new Set(db.polls.filter((p) => p.is_demo).map((p) => p.id));
      db.issues = db.issues.filter((i) => !i.is_demo);
      db.articles = db.articles
        .filter((a) => !a.is_demo)
        .map((a) => (a.issue_id && demoIssueIds.has(a.issue_id) ? { ...a, issue_id: null } : a));
      db.polls = db.polls.filter((p) => !p.is_demo);
      db.votes = db.votes.filter((v) => !demoPollIds.has(v.poll_id));
      db.submissions = db.submissions.filter((s) => !s.is_demo);
      db.games = db.games.filter((g) => !g.is_demo);
    });
  }

  async listStaff() {
    return null;
  }

  async setStaffRole() {
    throw new Error("In modalità prova la redazione è gestita con la password locale.");
  }
}
