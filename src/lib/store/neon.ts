import "server-only";
import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../db";
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
  PollOption,
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

/**
 * Archivio su PostgreSQL (Neon). Prende il posto di Supabase e delle sue regole
 * RLS: poiché qui non ci sono, **i permessi di lettura sono applicati da questo
 * file**.
 *  - `new NeonStore(pool, false)` è l'archivio dei lettori: vede solo ciò che è
 *    pubblicato (le stesse regole di `20261016000100_security.sql`);
 *  - `new NeonStore(pool, true)` è quello della redazione e si ottiene solo da
 *    `requireStaff()` in `src/lib/auth.ts`.
 */
const ARTICLE_COLS =
  "id, slug, title, subtitle, excerpt, body, author_name, author_role, course, issue_id, cover_image, cover_alt, cover_credit, status, featured, is_demo, extra, published_at, created_at, updated_at";

type Row = Record<string, unknown>;
type Db = Pick<Pool | PoolClient, "query">;

/** Condizioni «pubblicato» per ogni tabella (equivalenti alle policy RLS di Supabase). */
const PUBLIC_ARTICLE = `(a.status = 'published' and (a.issue_id is null or exists (
  select 1 from issues i where i.id = a.issue_id and i.status = 'published')))`;
const PUBLIC_POLL = `status in ('open', 'closed')`;
const PUBLISHED = `status = 'published'`;

type PgError = { code?: string; message?: string };

/** Traduce gli errori del database in messaggi comprensibili. */
function fail(error: unknown, context: string): never {
  const e = error as PgError;
  if (e.code === "23505") throw new Error(`${context}: esiste già un elemento con lo stesso valore.`);
  if (e.code === "23514" || e.code === "22P02" || e.code === "23503")
    throw new Error(`${context}: i dati non sono validi.`);
  throw new Error(`${context}: ${e.message ?? "errore sconosciuto"}`);
}

/** Nomi di colonna sempre scritti dal codice, mai dall'utente: qui si controlla comunque. */
function ident(name: string) {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`Nome di colonna non valido: ${name}`);
  return `"${name}"`;
}

/** Gli oggetti (colonne jsonb) vanno passati come testo JSON. */
function param(value: unknown) {
  return value !== null && typeof value === "object" && !(value instanceof Date) ? JSON.stringify(value) : value;
}

/** Come faceva l'API di Supabase, i campi `undefined` vengono ignorati (non diventano NULL). */
const definedKeys = (values: Row) => Object.keys(values).filter((k) => values[k] !== undefined);

async function insertRow(db: Db, table: string, values: Row, returning: string, onConflictNothing = false) {
  const keys = definedKeys(values);
  const sql = `insert into ${ident(table)} (${keys.map(ident).join(", ")})
    values (${keys.map((_, i) => `$${i + 1}`).join(", ")})
    ${onConflictNothing ? "on conflict (id) do nothing" : ""}
    ${returning ? `returning ${returning}` : ""}`;
  return db.query(sql, keys.map((k) => param(values[k])));
}

async function updateRow(db: Db, table: string, id: string | number, values: Row, returning: string) {
  const keys = definedKeys(values);
  const sql = `update ${ident(table)} set ${keys.map((k, i) => `${ident(k)} = $${i + 1}`).join(", ")}
    where id = $${keys.length + 1} ${returning ? `returning ${returning}` : ""}`;
  return db.query(sql, [...keys.map((k) => param(values[k])), id]);
}

function one<T>(rows: unknown[], what: string): T {
  if (!rows[0]) throw new Error(`${what}: elemento non trovato.`);
  return rows[0] as T;
}

export class NeonStore implements AdminStore, PublicActions {
  constructor(
    private readonly pool: Pool,
    /** true solo per la redazione autenticata. */
    private readonly admin: boolean,
  ) {}

  private async rows<T = Row>(sql: string, params: unknown[] = [], db: Db = this.pool): Promise<T[]> {
    return (await db.query(sql, params)).rows as T[];
  }

  /** Le operazioni di gestione sono vietate all'archivio dei lettori. */
  private requireAdmin() {
    if (!this.admin) throw new Error("Operazione riservata alla redazione.");
  }

  // ─── Impostazioni ─────────────────────────────────────────────────────────
  async getSettings(): Promise<Settings> {
    const [data] = await this.rows(`select * from settings where id = 1`);
    if (!data) return defaultSettings;
    const merged = { ...defaultSettings };
    for (const key of Object.keys(defaultSettings) as (keyof Settings)[]) {
      const value = data[key];
      if (typeof value === "string" && value.trim()) merged[key] = value;
    }
    return merged;
  }

  async saveSettings(settings: Settings) {
    this.requireAdmin();
    try {
      await updateRow(this.pool, "settings", 1, { ...settings }, "");
    } catch (error) {
      fail(error, "Salvataggio impostazioni");
    }
  }

  // ─── Numeri ───────────────────────────────────────────────────────────────
  async listIssues() {
    const where = this.admin ? "" : `where ${PUBLISHED}`;
    return this.rows<Issue>(`select * from issues ${where} order by number desc`);
  }

  async getIssue(id: string) {
    this.requireAdmin();
    const [row] = await this.rows<Issue>(`select * from issues where id = $1`, [id]).catch(() => []);
    return row ?? null;
  }

  async saveIssue(input: IssueInput) {
    this.requireAdmin();
    const { id, ...fields } = input;
    try {
      const res = id
        ? await updateRow(this.pool, "issues", id, fields, "*")
        : await insertRow(this.pool, "issues", fields, "*");
      return one<Issue>(res.rows, "Salvataggio numero");
    } catch (error) {
      if ((error as PgError).code === "23505") throw new Error(`Esiste già un numero ${input.number}.`);
      if (error instanceof Error && !(error as PgError).code) throw error;
      fail(error, "Salvataggio numero");
    }
  }

  async deleteIssue(id: string) {
    this.requireAdmin();
    await this.pool.query(`delete from issues where id = $1`, [id]).catch((e) => fail(e, "Eliminazione numero"));
  }

  // ─── Articoli ─────────────────────────────────────────────────────────────
  async listArticles(query: ArticleQuery = {}) {
    const cols = ARTICLE_COLS.split(", ").map((c) => `a.${c}`).join(", ");
    const limit = Math.max(1, Math.min(query.limit ?? 200, 2000));
    type Clause = (add: (value: unknown) => string) => { where: string; order: string };

    // Ogni interrogazione costruisce i propri parametri: PostgreSQL rifiuta
    // quelli che il testo SQL non usa.
    const run = (extra?: Clause) => {
      const params: unknown[] = [];
      const add = (value: unknown) => (params.push(value), `$${params.length}`);
      const where: string[] = [];
      if (!this.admin) where.push(PUBLIC_ARTICLE);
      if (query.status && query.status !== "all") where.push(`a.status = ${add(query.status)}`);
      if (query.course) where.push(`a.course = ${add(query.course)}`);
      if (query.issueId) where.push(`a.issue_id = ${add(query.issueId)}`);
      if (query.featured) where.push(`a.featured = true`);
      if (query.excludeId) where.push(`a.id <> ${add(query.excludeId)}`);
      let order = "a.published_at desc nulls last, a.created_at desc";
      if (extra) {
        const clause = extra(add);
        where.push(clause.where);
        order = clause.order;
      }
      return this.rows<Article>(
        `select ${cols} from articles a ${where.length ? `where ${where.join(" and ")}` : ""}
         order by ${order} limit ${limit}`,
        params,
      );
    };

    const search = query.search?.trim();
    try {
      if (!search) return await run();
      // Ricerca a testo pieno in italiano (riconosce plurali e varianti),
      // integrata da una ricerca per parte di parola nel titolo.
      const safe = search.replace(/[%_,()*\\]/g, " ").trim();
      const [byText, byPart] = await Promise.all([
        run((add) => {
          const p = add(search);
          return {
            where: `a.search @@ websearch_to_tsquery('italian', ${p})`,
            order: `ts_rank(a.search, websearch_to_tsquery('italian', ${p})) desc`,
          };
        }),
        run((add) => {
          const p = add(`%${safe}%`);
          return {
            where: `(a.title ilike ${p} or a.subtitle ilike ${p} or a.author_name ilike ${p})`,
            order: "a.published_at desc nulls last",
          };
        }),
      ]);
      const seen = new Set<string>();
      return [...byText, ...byPart].filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true))).slice(0, limit);
    } catch (error) {
      fail(error, search ? "Ricerca" : "Lettura articoli");
    }
  }

  async getArticleBySlug(slug: string) {
    const cols = ARTICLE_COLS.split(", ").map((c) => `a.${c}`).join(", ");
    const [row] = await this.rows<Article>(
      `select ${cols} from articles a where a.slug = $1 ${this.admin ? "" : `and ${PUBLIC_ARTICLE}`}`,
      [slug],
    );
    return row ?? null;
  }

  async getArticle(id: string) {
    this.requireAdmin();
    const [row] = await this.rows<Article>(`select ${ARTICLE_COLS} from articles where id = $1`, [id]).catch(() => []);
    return row ?? null;
  }

  private async freeSlug(slug: string, id?: string) {
    const data = await this.rows<{ id: string; slug: string }>(`select id, slug from articles where slug like $1`, [
      `${slug.replace(/[\\%_]/g, "\\$&")}%`,
    ]);
    const taken = new Set(data.filter((r) => r.id !== id).map((r) => r.slug));
    let candidate = slug;
    let n = 2;
    while (taken.has(candidate)) candidate = `${slug}-${n++}`;
    return candidate;
  }

  async saveArticle(input: ArticleInput) {
    this.requireAdmin();
    const { id, ...fields } = input;
    fields.slug = await this.freeSlug(fields.slug, id);
    try {
      const res = id
        ? await updateRow(this.pool, "articles", id, fields, ARTICLE_COLS)
        : await insertRow(this.pool, "articles", fields, ARTICLE_COLS);
      return one<Article>(res.rows, "Salvataggio articolo");
    } catch (error) {
      if (error instanceof Error && !(error as PgError).code) throw error;
      fail(error, "Salvataggio articolo");
    }
  }

  async deleteArticle(id: string) {
    this.requireAdmin();
    await this.pool.query(`delete from articles where id = $1`, [id]).catch((e) => fail(e, "Eliminazione articolo"));
  }

  // ─── Sondaggi ─────────────────────────────────────────────────────────────
  private async attachOptions(polls: Row[], db: Db = this.pool): Promise<Poll[]> {
    if (!polls.length) return [];
    const options = await this.rows<PollOption & { poll_id: string }>(
      `select id, poll_id, label, position from poll_options where poll_id = any($1::uuid[]) order by position, id`,
      [polls.map((p) => p.id)],
      db,
    );
    return polls.map((p) => ({
      ...(p as unknown as Poll),
      options: options.filter((o) => o.poll_id === p.id).map(({ id, label, position }) => ({ id, label, position })),
    }));
  }

  async listPolls(statuses?: PollStatus[]) {
    const params: unknown[] = [];
    const where: string[] = [];
    if (!this.admin) where.push(PUBLIC_POLL);
    if (statuses) where.push(`status = any($${params.push(statuses)}::text[])`);
    const polls = await this.rows(
      `select * from polls ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc`,
      params,
    ).catch((e) => fail(e, "Lettura sondaggi"));
    return this.attachOptions(polls);
  }

  async getPoll(id: string, db: Db = this.pool) {
    this.requireAdmin();
    const polls = await this.rows(`select * from polls where id = $1`, [id], db).catch(() => []);
    return (await this.attachOptions(polls, db))[0] ?? null;
  }

  async savePoll(input: PollInput) {
    this.requireAdmin();
    const fields = {
      question: input.question,
      description: input.description,
      status: input.status,
      issue_id: input.issue_id,
    };
    try {
      return await withTransaction(this.pool, async (tx) => {
        const res = input.id
          ? await updateRow(tx, "polls", input.id, fields, "id")
          : await insertRow(tx, "polls", fields, "id");
        const pollId = one<{ id: string }>(res.rows, "Salvataggio sondaggio").id;

        const keep = input.options.filter((o) => o.id).map((o) => o.id as string);
        await tx.query(`delete from poll_options where poll_id = $1 and id <> all($2::uuid[])`, [pollId, keep]);

        for (const [position, option] of input.options.entries()) {
          if (option.id) {
            await tx.query(`update poll_options set label = $1, position = $2 where id = $3 and poll_id = $4`, [
              option.label,
              position,
              option.id,
              pollId,
            ]);
          } else {
            await tx.query(`insert into poll_options (poll_id, label, position) values ($1, $2, $3)`, [
              pollId,
              option.label,
              position,
            ]);
          }
        }
        return (await this.getPoll(pollId, tx))!;
      });
    } catch (error) {
      if (error instanceof Error && !(error as PgError).code) throw error;
      fail(error, "Salvataggio sondaggio");
    }
  }

  async deletePoll(id: string) {
    this.requireAdmin();
    await this.pool.query(`delete from polls where id = $1`, [id]).catch((e) => fail(e, "Eliminazione sondaggio"));
  }

  async getPollResults(pollId: string): Promise<PollResults> {
    try {
      const data = await this.rows<{ option_id: string; votes: number }>(
        `select o.id as option_id, count(v.id)::int as votes
         from poll_options o
         join polls p on p.id = o.poll_id
         left join poll_votes v on v.option_id = o.id
         where o.poll_id = $1 and ($2::boolean or p.status in ('open', 'closed'))
         group by o.id`,
        [pollId, this.admin],
      );
      const counts: Record<string, number> = {};
      for (const row of data) counts[row.option_id] = Number(row.votes);
      return { total: Object.values(counts).reduce((s, n) => s + n, 0), counts };
    } catch {
      return { total: 0, counts: {} };
    }
  }

  async vote(pollId: string, optionId: string, voterHash: string): Promise<VoteOutcome> {
    try {
      const [row] = await this.rows<{ outcome: VoteOutcome }>(`select public.cast_vote($1, $2, $3) as outcome`, [
        pollId,
        optionId,
        voterHash,
      ]);
      return row.outcome;
    } catch (error) {
      if ((error as PgError).code === "22P02") return "invalid"; // identificativo non valido
      throw new Error("Il voto non è stato registrato. Riprova tra poco.");
    }
  }

  // ─── Giochi ───────────────────────────────────────────────────────────────
  async listGames() {
    const where = this.admin ? "" : `where ${PUBLISHED}`;
    return this.rows<Game>(`select * from games ${where} order by created_at desc`).catch((e) =>
      fail(e, "Lettura giochi"),
    );
  }

  async getGame(id: string) {
    const [row] = await this.rows<Game>(`select * from games where id = $1 ${this.admin ? "" : `and ${PUBLISHED}`}`, [
      id,
    ]).catch(() => []);
    return row ?? null;
  }

  async saveGame(input: GameInput) {
    this.requireAdmin();
    const { id, ...fields } = input;
    try {
      const res = id
        ? await updateRow(this.pool, "games", id, fields, "*")
        : await insertRow(this.pool, "games", fields, "*");
      return one<Game>(res.rows, "Salvataggio gioco");
    } catch (error) {
      if (error instanceof Error && !(error as PgError).code) throw error;
      fail(error, "Salvataggio gioco");
    }
  }

  async deleteGame(id: string) {
    this.requireAdmin();
    await this.pool.query(`delete from games where id = $1`, [id]).catch((e) => fail(e, "Eliminazione gioco"));
  }

  // ─── Contributi dei lettori ───────────────────────────────────────────────
  async listPublishedSubmissions() {
    return this.rows<Submission>(`select * from submissions where ${PUBLISHED} order by published_at desc`).catch(
      () => [],
    );
  }

  async listSubmissions(status?: SubmissionStatus) {
    this.requireAdmin();
    const params: unknown[] = [];
    const where = status ? `where status = $${params.push(status)}` : "";
    return this.rows<Submission>(`select * from submissions ${where} order by created_at desc`, params).catch((e) =>
      fail(e, "Lettura contributi"),
    );
  }

  async getSubmission(id: string) {
    this.requireAdmin();
    const [row] = await this.rows<Submission>(`select * from submissions where id = $1`, [id]).catch(() => []);
    return row ?? null;
  }

  /** Dai lettori: il messaggio resta sempre «in attesa» finché la redazione non lo approva. */
  async submit(input: SubmissionInput) {
    const clean = (value: string | null | undefined) => (value ?? "").trim() || null;
    try {
      await this.pool.query(
        `insert into submissions (kind, title, message, signature, class_label, status)
         values ($1, $2, $3, $4, $5, 'pending')`,
        [input.kind, clean(input.title), input.message.trim(), clean(input.signature), clean(input.class_label)],
      );
    } catch {
      throw new Error("Il messaggio non è stato inviato. Riprova tra poco.");
    }
  }

  async updateSubmission(id: string, patch: { status?: SubmissionStatus; answer?: string | null }) {
    this.requireAdmin();
    const update: Row = { ...patch };
    if (patch.status === "published") {
      const current = await this.getSubmission(id);
      update.published_at = current?.published_at ?? new Date().toISOString();
    } else if (patch.status) {
      update.published_at = null;
    }
    if (!Object.keys(update).length) return;
    try {
      await updateRow(this.pool, "submissions", id, update, "");
    } catch (error) {
      fail(error, "Aggiornamento contributo");
    }
  }

  async deleteSubmission(id: string) {
    this.requireAdmin();
    await this.pool.query(`delete from submissions where id = $1`, [id]).catch((e) => fail(e, "Eliminazione contributo"));
  }

  // ─── Contenuti dimostrativi ───────────────────────────────────────────────
  async importDemo() {
    this.requireAdmin();
    try {
      await withTransaction(this.pool, async (tx) => {
        const existing = await this.rows<{ id: string; number: number }>(`select id, number from issues`, [], tx);
        const usedNumbers = new Map(existing.map((i) => [i.number, i.id]));
        const issues = demoIssues.filter((i) => !usedNumbers.has(i.number) || usedNumbers.get(i.number) === i.id);
        const issueIds = new Set([...issues.map((i) => i.id), ...existing.map((i) => i.id)]);

        for (const issue of issues) await insertRow(tx, "issues", { ...issue }, "", true);

        const slugs = await this.rows<{ id: string; slug: string }>(`select id, slug from articles`, [], tx);
        const takenSlugs = new Map(slugs.map((r) => [r.slug, r.id]));
        const articles = demoArticles
          .filter((a) => !takenSlugs.has(a.slug) || takenSlugs.get(a.slug) === a.id)
          .map((a) => ({ ...a, issue_id: a.issue_id && issueIds.has(a.issue_id) ? a.issue_id : null }));
        for (const article of articles) await insertRow(tx, "articles", { ...article }, "", true);

        for (const p of demoPolls) {
          await insertRow(
            tx,
            "polls",
            {
              id: p.id,
              question: p.question,
              description: p.description,
              status: p.status,
              issue_id: p.issue_id,
              is_demo: p.is_demo,
              created_at: p.created_at,
            },
            "",
            true,
          );
          for (const o of p.options) await insertRow(tx, "poll_options", { ...o, poll_id: p.id }, "", true);
        }

        await tx.query(`delete from poll_votes where voter_hash like 'demo-%'`);
        const votes = demoVotes.flatMap((v) =>
          Array.from({ length: v.count }, (_, i) => ({
            poll_id: v.poll_id,
            option_id: v.option_id,
            voter_hash: `demo-${v.option_id}-${i}`,
          })),
        );
        if (votes.length) {
          await tx.query(
            `insert into poll_votes (poll_id, option_id, voter_hash)
             select * from unnest($1::uuid[], $2::uuid[], $3::text[])`,
            [votes.map((v) => v.poll_id), votes.map((v) => v.option_id), votes.map((v) => v.voter_hash)],
          );
        }

        for (const s of demoSubmissions) await insertRow(tx, "submissions", { ...s }, "", true);
        for (const g of demoGames) await insertRow(tx, "games", { ...g }, "", true);
      });
    } catch (error) {
      fail(error, "Importazione contenuti dimostrativi");
    }
  }

  async removeDemo() {
    this.requireAdmin();
    try {
      await withTransaction(this.pool, async (tx) => {
        for (const table of ["articles", "polls", "submissions", "games", "issues"]) {
          await tx.query(`delete from ${ident(table)} where is_demo = true`);
        }
      });
    } catch (error) {
      fail(error, "Rimozione contenuti dimostrativi");
    }
  }

  // ─── Redazione ────────────────────────────────────────────────────────────
  async listStaff() {
    this.requireAdmin();
    return this.rows<StaffMember>(`select id, email, display_name, role from profiles order by email`).catch(() => []);
  }

  async setStaffRole(id: string, role: StaffMember["role"]) {
    this.requireAdmin();
    try {
      const res = await updateRow(this.pool, "profiles", id, { role }, "id");
      one(res.rows, "Aggiornamento ruolo");
    } catch (error) {
      if (error instanceof Error && !(error as PgError).code) throw error;
      fail(error, "Aggiornamento ruolo");
    }
  }
}
