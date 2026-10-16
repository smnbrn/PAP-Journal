import "server-only";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import {
  demoArticles,
  demoGames,
  demoIssues,
  demoPolls,
  demoSubmissions,
  demoVotes,
} from "../demo";
import { defaultSettings } from "../site.config";
import type {
  Article,
  ArticleQuery,
  Game,
  Issue,
  Poll,
  PollResults,
  PollStatus,
  Settings,
  StaffMember,
  Submission,
  SubmissionInput,
  SubmissionStatus,
  VoteOutcome,
} from "../types";
import type { AdminStore, ArticleInput, GameInput, IssueInput, PollInput, PublicActions } from "./types";

const ARTICLE_COLS =
  "id, slug, title, subtitle, excerpt, body, author_name, author_role, course, issue_id, cover_image, cover_alt, cover_credit, status, featured, is_demo, extra, published_at, created_at, updated_at";
const POLL_COLS = "id, question, description, status, issue_id, is_demo, created_at, options:poll_options(id, label, position)";

/** Traduce gli errori del database in messaggi comprensibili. */
function fail(error: PostgrestError | null, context: string): never {
  if (error?.code === "23505") throw new Error(`${context}: esiste già un elemento con lo stesso valore.`);
  if (error?.code === "42501" || error?.code === "PGRST301")
    throw new Error(`${context}: permesso negato. Il tuo account è abilitato come redazione?`);
  throw new Error(`${context}: ${error?.message ?? "errore sconosciuto"}`);
}

function sortOptions(poll: Poll): Poll {
  return { ...poll, options: [...(poll.options ?? [])].sort((a, b) => a.position - b.position) };
}

export class SupabaseStore implements AdminStore, PublicActions {
  constructor(private readonly db: SupabaseClient) {}

  async getSettings(): Promise<Settings> {
    const { data } = await this.db.from("settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return defaultSettings;
    const merged = { ...defaultSettings };
    for (const key of Object.keys(defaultSettings) as (keyof Settings)[]) {
      if (typeof data[key] === "string" && data[key].trim()) merged[key] = data[key];
    }
    return merged;
  }

  async saveSettings(settings: Settings) {
    const { error } = await this.db.from("settings").update(settings).eq("id", 1);
    if (error) fail(error, "Salvataggio impostazioni");
  }

  async listIssues() {
    const { data, error } = await this.db.from("issues").select("*").order("number", { ascending: false });
    if (error) fail(error, "Lettura numeri");
    return (data ?? []) as Issue[];
  }

  async getIssue(id: string) {
    const { data } = await this.db.from("issues").select("*").eq("id", id).maybeSingle();
    return (data as Issue) ?? null;
  }

  async saveIssue(input: IssueInput) {
    const { id, ...fields } = input;
    const query = id
      ? this.db.from("issues").update(fields).eq("id", id)
      : this.db.from("issues").insert(fields);
    const { data, error } = await query.select("*").single();
    if (error?.code === "23505") throw new Error(`Esiste già un numero ${input.number}.`);
    if (error) fail(error, "Salvataggio numero");
    return data as Issue;
  }

  async deleteIssue(id: string) {
    const { error } = await this.db.from("issues").delete().eq("id", id);
    if (error) fail(error, "Eliminazione numero");
  }

  async listArticles(query: ArticleQuery = {}) {
    const build = () => {
      let q = this.db.from("articles").select(ARTICLE_COLS);
      if (query.status && query.status !== "all") q = q.eq("status", query.status);
      if (query.course) q = q.eq("course", query.course);
      if (query.issueId) q = q.eq("issue_id", query.issueId);
      if (query.featured) q = q.eq("featured", true);
      if (query.excludeId) q = q.neq("id", query.excludeId);
      return q;
    };
    const limit = query.limit ?? 200;
    const search = query.search?.trim();
    if (!search) {
      const { data, error } = await build()
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) fail(error, "Lettura articoli");
      return (data ?? []) as Article[];
    }
    // Ricerca a testo pieno in italiano (riconosce plurali e varianti),
    // integrata da una ricerca per parte di parola nel titolo.
    const safe = search.replace(/[%_,()*]/g, " ").trim();
    const [full, partial] = await Promise.all([
      build().textSearch("search", search, { type: "websearch", config: "italian" }).limit(limit),
      build()
        .or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%,author_name.ilike.%${safe}%`)
        .limit(limit),
    ]);
    if (full.error) fail(full.error, "Ricerca");
    const seen = new Set<string>();
    return [...(full.data ?? []), ...(partial.data ?? [])]
      .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)))
      .slice(0, limit) as Article[];
  }

  async getArticleBySlug(slug: string) {
    const { data } = await this.db.from("articles").select(ARTICLE_COLS).eq("slug", slug).maybeSingle();
    return (data as Article) ?? null;
  }

  async getArticle(id: string) {
    const { data } = await this.db.from("articles").select(ARTICLE_COLS).eq("id", id).maybeSingle();
    return (data as Article) ?? null;
  }

  private async freeSlug(slug: string, id?: string) {
    const { data } = await this.db.from("articles").select("id, slug").like("slug", `${slug}%`);
    const taken = new Set((data ?? []).filter((r) => r.id !== id).map((r) => r.slug));
    let candidate = slug;
    let n = 2;
    while (taken.has(candidate)) candidate = `${slug}-${n++}`;
    return candidate;
  }

  async saveArticle(input: ArticleInput) {
    const { id, ...fields } = input;
    fields.slug = await this.freeSlug(fields.slug, id);
    const query = id
      ? this.db.from("articles").update(fields).eq("id", id)
      : this.db.from("articles").insert(fields);
    const { data, error } = await query.select(ARTICLE_COLS).single();
    if (error) fail(error, "Salvataggio articolo");
    return data as Article;
  }

  async deleteArticle(id: string) {
    const { error } = await this.db.from("articles").delete().eq("id", id);
    if (error) fail(error, "Eliminazione articolo");
  }

  async listPolls(statuses?: PollStatus[]) {
    let q = this.db.from("polls").select(POLL_COLS).order("created_at", { ascending: false });
    if (statuses) q = q.in("status", statuses);
    const { data, error } = await q;
    if (error) fail(error, "Lettura sondaggi");
    return ((data ?? []) as unknown as Poll[]).map(sortOptions);
  }

  async getPoll(id: string) {
    const { data } = await this.db.from("polls").select(POLL_COLS).eq("id", id).maybeSingle();
    return data ? sortOptions(data as unknown as Poll) : null;
  }

  async savePoll(input: PollInput) {
    const fields = {
      question: input.question,
      description: input.description,
      status: input.status,
      issue_id: input.issue_id,
    };
    const { data, error } = input.id
      ? await this.db.from("polls").update(fields).eq("id", input.id).select("id").single()
      : await this.db.from("polls").insert(fields).select("id").single();
    if (error) fail(error, "Salvataggio sondaggio");
    const pollId = data.id as string;

    const keep = input.options.filter((o) => o.id).map((o) => o.id as string);
    let del = this.db.from("poll_options").delete().eq("poll_id", pollId);
    if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
    const removed = await del;
    if (removed.error) fail(removed.error, "Aggiornamento opzioni");

    for (const [position, option] of input.options.entries()) {
      const res = option.id
        ? await this.db.from("poll_options").update({ label: option.label, position }).eq("id", option.id)
        : await this.db.from("poll_options").insert({ poll_id: pollId, label: option.label, position });
      if (res.error) fail(res.error, "Salvataggio opzione");
    }
    return (await this.getPoll(pollId))!;
  }

  async deletePoll(id: string) {
    const { error } = await this.db.from("polls").delete().eq("id", id);
    if (error) fail(error, "Eliminazione sondaggio");
  }

  async getPollResults(pollId: string): Promise<PollResults> {
    const { data, error } = await this.db.rpc("poll_results", { p_poll: pollId });
    if (error) return { total: 0, counts: {} };
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { option_id: string; votes: number }[]) counts[row.option_id] = Number(row.votes);
    return { total: Object.values(counts).reduce((s, n) => s + n, 0), counts };
  }

  async vote(pollId: string, optionId: string, voterHash: string): Promise<VoteOutcome> {
    const { data, error } = await this.db.rpc("cast_vote", {
      p_poll: pollId,
      p_option: optionId,
      p_voter: voterHash,
    });
    if (error) throw new Error("Il voto non è stato registrato. Riprova tra poco.");
    return data as VoteOutcome;
  }

  async listGames() {
    const { data, error } = await this.db.from("games").select("*").order("created_at", { ascending: false });
    if (error) fail(error, "Lettura giochi");
    return (data ?? []) as Game[];
  }

  async getGame(id: string) {
    const { data } = await this.db.from("games").select("*").eq("id", id).maybeSingle();
    return (data as Game) ?? null;
  }

  async saveGame(input: GameInput) {
    const { id, ...fields } = input;
    const query = id ? this.db.from("games").update(fields).eq("id", id) : this.db.from("games").insert(fields);
    const { data, error } = await query.select("*").single();
    if (error) fail(error, "Salvataggio gioco");
    return data as Game;
  }

  async deleteGame(id: string) {
    const { error } = await this.db.from("games").delete().eq("id", id);
    if (error) fail(error, "Eliminazione gioco");
  }

  async listPublishedSubmissions() {
    const { data } = await this.db
      .from("submissions")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return (data ?? []) as Submission[];
  }

  async listSubmissions(status?: SubmissionStatus) {
    let q = this.db.from("submissions").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) fail(error, "Lettura contributi");
    return (data ?? []) as Submission[];
  }

  async getSubmission(id: string) {
    const { data } = await this.db.from("submissions").select("*").eq("id", id).maybeSingle();
    return (data as Submission) ?? null;
  }

  async submit(input: SubmissionInput) {
    const { error } = await this.db.rpc("submit_contribution", {
      p_kind: input.kind,
      p_title: input.title ?? "",
      p_message: input.message,
      p_signature: input.signature ?? "",
      p_class: input.class_label ?? "",
    });
    if (error) throw new Error("Il messaggio non è stato inviato. Riprova tra poco.");
  }

  async updateSubmission(id: string, patch: { status?: SubmissionStatus; answer?: string | null }) {
    const update: Record<string, unknown> = { ...patch };
    if (patch.status === "published") {
      const current = await this.getSubmission(id);
      update.published_at = current?.published_at ?? new Date().toISOString();
    } else if (patch.status) {
      update.published_at = null;
    }
    const { error } = await this.db.from("submissions").update(update).eq("id", id);
    if (error) fail(error, "Aggiornamento contributo");
  }

  async deleteSubmission(id: string) {
    const { error } = await this.db.from("submissions").delete().eq("id", id);
    if (error) fail(error, "Eliminazione contributo");
  }

  async importDemo() {
    const { data: existing } = await this.db.from("issues").select("id, number");
    const usedNumbers = new Map((existing ?? []).map((i) => [i.number as number, i.id as string]));
    const issues = demoIssues.filter((i) => !usedNumbers.has(i.number) || usedNumbers.get(i.number) === i.id);
    const issueIds = new Set([...issues.map((i) => i.id), ...(existing ?? []).map((i) => i.id as string)]);

    const run = async (label: string, p: PromiseLike<{ error: PostgrestError | null }>) => {
      const { error } = await p;
      if (error) fail(error, `Importazione ${label}`);
    };

    await run("numeri", this.db.from("issues").upsert(issues, { onConflict: "id", ignoreDuplicates: true }));

    const { data: slugs } = await this.db.from("articles").select("id, slug");
    const takenSlugs = new Map((slugs ?? []).map((r) => [r.slug as string, r.id as string]));
    const articles = demoArticles
      .filter((a) => !takenSlugs.has(a.slug) || takenSlugs.get(a.slug) === a.id)
      .map((a) => ({ ...a, issue_id: a.issue_id && issueIds.has(a.issue_id) ? a.issue_id : null }));
    await run("articoli", this.db.from("articles").upsert(articles, { onConflict: "id", ignoreDuplicates: true }));

    const polls = demoPolls.map((p) => ({
      id: p.id,
      question: p.question,
      description: p.description,
      status: p.status,
      issue_id: p.issue_id,
      is_demo: p.is_demo,
      created_at: p.created_at,
    }));
    await run("sondaggi", this.db.from("polls").upsert(polls, { onConflict: "id", ignoreDuplicates: true }));
    const options = demoPolls.flatMap((p) => p.options.map((o) => ({ ...o, poll_id: p.id })));
    await run("opzioni", this.db.from("poll_options").upsert(options, { onConflict: "id", ignoreDuplicates: true }));
    await run("voti", this.db.from("poll_votes").delete().like("voter_hash", "demo-%"));
    const votes = demoVotes.flatMap((v) =>
      Array.from({ length: v.count }, (_, i) => ({
        poll_id: v.poll_id,
        option_id: v.option_id,
        voter_hash: `demo-${v.option_id}-${i}`,
      })),
    );
    await run("voti", this.db.from("poll_votes").insert(votes));
    await run(
      "contributi",
      this.db.from("submissions").upsert(demoSubmissions, { onConflict: "id", ignoreDuplicates: true }),
    );
    await run("giochi", this.db.from("games").upsert(demoGames, { onConflict: "id", ignoreDuplicates: true }));
  }

  async removeDemo() {
    for (const table of ["articles", "polls", "submissions", "games", "issues"]) {
      const { error } = await this.db.from(table).delete().eq("is_demo", true);
      if (error) fail(error, "Rimozione contenuti dimostrativi");
    }
  }

  async listStaff() {
    const { data, error } = await this.db.from("profiles").select("id, email, display_name, role").order("email");
    if (error) return [];
    return (data ?? []) as StaffMember[];
  }

  async setStaffRole(id: string, role: StaffMember["role"]) {
    const { error } = await this.db.from("profiles").update({ role }).eq("id", id);
    if (error) fail(error, "Aggiornamento ruolo");
  }
}
