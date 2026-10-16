import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPublicStore } from "./store";
import type { Article, ArticleQuery, CourseSlug, Issue } from "./types";

/**
 * Letture pubbliche, memorizzate in cache. Ogni salvataggio della redazione
 * invalida il tag «contenuti», quindi il sito si aggiorna subito dopo la
 * pubblicazione senza toccare il codice.
 */
export const CONTENT_TAG = "contenuti";

function tag() {
  cacheTag(CONTENT_TAG);
  cacheLife("hours");
}

export async function getSettings() {
  "use cache";
  tag();
  return getPublicStore().getSettings();
}

export async function getIssues() {
  "use cache";
  tag();
  return getPublicStore().listIssues();
}

export async function getCurrentIssue(): Promise<Issue | null> {
  "use cache";
  tag();
  const issues = await getPublicStore().listIssues();
  return issues[0] ?? null;
}

export async function getIssueByNumber(number: number) {
  "use cache";
  tag();
  const issues = await getPublicStore().listIssues();
  return issues.find((i) => i.number === number) ?? null;
}

export async function getArticles(query: ArticleQuery = {}) {
  "use cache";
  tag();
  return getPublicStore().listArticles({ ...query, status: "published" });
}

export async function getArticle(slug: string) {
  "use cache";
  tag();
  return getPublicStore().getArticleBySlug(slug);
}

export async function searchArticles(q: string) {
  "use cache";
  tag();
  if (q.trim().length < 2) return [];
  return getPublicStore().listArticles({ search: q, status: "published", limit: 40 });
}

export async function getLatestByCourse(): Promise<Partial<Record<CourseSlug, Article>>> {
  "use cache";
  tag();
  const articles = await getPublicStore().listArticles({ status: "published", limit: 200 });
  const latest: Partial<Record<CourseSlug, Article>> = {};
  for (const a of articles) latest[a.course] ??= a;
  return latest;
}

export async function getCourseCounts(): Promise<Partial<Record<CourseSlug, number>>> {
  "use cache";
  tag();
  const articles = await getPublicStore().listArticles({ status: "published", limit: 1000 });
  const counts: Partial<Record<CourseSlug, number>> = {};
  for (const a of articles) counts[a.course] = (counts[a.course] ?? 0) + 1;
  return counts;
}

export async function getPolls() {
  "use cache";
  tag();
  return getPublicStore().listPolls(["open", "closed"]);
}

export async function getGames() {
  "use cache";
  tag();
  return getPublicStore().listGames();
}

export async function getGame(id: string) {
  "use cache";
  tag();
  return getPublicStore().getGame(id);
}

export async function getPublishedSubmissions() {
  "use cache";
  tag();
  return getPublicStore().listPublishedSubmissions();
}
