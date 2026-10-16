"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { buildCrossword, parseCrosswordText } from "@/lib/crossword";
import { CONTENT_TAG } from "@/lib/data";
import { backend } from "@/lib/env";
import { checkLocalPassword, localLoginEnabled, neonLogin, requireStaff, signOut, startLocalSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { plainText, sanitizeArticleHtml } from "@/lib/sanitize";
import { isCourseSlug } from "@/lib/site.config";
import type { ArticleInput } from "@/lib/store/types";
import { createServerSupabase } from "@/lib/supabase/server";
import type { FieldToPlate, PollStatus, PublishStatus, QuizQuestion, StaffMember, SubmissionStatus } from "@/lib/types";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const text = (form: FormData, name: string, max = 500) => plainText(String(form.get(name) ?? "")).slice(0, max);
const optional = (form: FormData, name: string, max = 500) => text(form, name, max) || null;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Accetta solo indirizzi web o percorsi del sito (immagini dimostrative e caricate). */
function mediaUrl(form: FormData, name: string) {
  const value = String(form.get(name) ?? "").trim();
  if (!value) return null;
  if (/^https:\/\/[^\s"'<>]+$/.test(value) || /^\/[\w\-./]+$/.test(value)) return value;
  return null;
}

function refresh() {
  updateTag(CONTENT_TAG);
}

function failure(error: unknown): FormState {
  return { ok: false, message: (error as Error).message || "Si è verificato un errore." };
}

// ─── Accesso ────────────────────────────────────────────────────────────────
export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (backend === "local") {
    if (!localLoginEnabled()) {
      return { message: "Accesso non configurato: imposta LOCAL_ADMIN_PASSWORD nel file .env.local (almeno 8 caratteri)." };
    }
    if (!checkLocalPassword(String(form.get("password") ?? ""))) {
      await new Promise((r) => setTimeout(r, 600));
      return { message: "Password non corretta." };
    }
    await startLocalSession();
    redirect("/redazione");
  }
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { message: "Inserisci email e password." };
  if (backend === "neon") {
    let ok = false;
    try {
      ok = await neonLogin(email, password);
    } catch (error) {
      console.error("Accesso redazione (Neon):", error);
      return { message: "Accesso non riuscito. Riprova tra poco." };
    }
    if (!ok) {
      await new Promise((r) => setTimeout(r, 600));
      return { message: "Email o password non corrette." };
    }
    redirect("/redazione");
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      message:
        error.message === "Invalid login credentials"
          ? "Email o password non corrette."
          : error.message.includes("Email not confirmed")
            ? "L'indirizzo email non è ancora stato confermato."
            : "Accesso non riuscito. Riprova tra poco.",
    };
  }
  redirect("/redazione");
}

export async function logout() {
  await signOut();
  redirect("/redazione/accesso");
}

// ─── Articoli ───────────────────────────────────────────────────────────────
function readFieldToPlate(form: FormData): FieldToPlate {
  const lines = (name: string) =>
    String(form.get(name) ?? "")
      .split("\n")
      .map((l) => plainText(l).replace(/^[-•*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 40);
  return {
    ingredient: text(form, "x_ingredient", 80),
    scientific_name: text(form, "x_scientific_name", 120),
    season: text(form, "x_season", 160),
    origin: text(form, "x_origin", 160),
    field_notes: text(form, "x_field_notes", 1500),
    field_class: text(form, "x_field_class", 120),
    field_image: mediaUrl(form, "x_field_image"),
    field_image_alt: text(form, "x_field_image_alt", 300),
    recipe_title: text(form, "x_recipe_title", 160),
    servings: text(form, "x_servings", 40),
    time: text(form, "x_time", 40),
    difficulty: text(form, "x_difficulty", 40),
    ingredients: lines("x_ingredients"),
    steps: lines("x_steps"),
    kitchen_class: text(form, "x_kitchen_class", 120),
    plate_image: mediaUrl(form, "x_plate_image"),
    plate_image_alt: text(form, "x_plate_image_alt", 300),
  };
}

export async function saveArticle(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "") || undefined;
  const intent = String(form.get("intent") ?? "save");
  const course = String(form.get("course") ?? "");
  const title = text(form, "title", 300);
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Il titolo è obbligatorio.";
  if (!isCourseSlug(course)) errors.course = "Scegli la rubrica.";
  const issueId = String(form.get("issue_id") ?? "");
  if (issueId && !UUID.test(issueId)) errors.issue_id = "Numero non valido.";
  const cover = mediaUrl(form, "cover_image");
  const coverAlt = optional(form, "cover_alt", 300);
  if (cover && !coverAlt) errors.cover_alt = "Descrivi l'immagine: serve a chi usa un lettore di schermo.";
  if (Object.keys(errors).length) return { ok: false, message: "Controlla i campi evidenziati.", errors };

  let status: PublishStatus = String(form.get("status")) === "published" ? "published" : "draft";
  if (intent === "publish") status = "published";
  if (intent === "unpublish") status = "draft";
  const date = String(form.get("published_at") ?? "");
  const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : status === "published"
      ? new Date().toISOString().slice(0, 10)
      : null;

  const input: ArticleInput = {
    id,
    slug: slugify(text(form, "slug", 80) || title),
    title,
    subtitle: optional(form, "subtitle", 400),
    excerpt: optional(form, "excerpt", 400),
    body: sanitizeArticleHtml(String(form.get("body") ?? "")),
    author_name: text(form, "author_name", 120) || "La redazione",
    author_role: optional(form, "author_role", 120),
    course: course as ArticleInput["course"],
    issue_id: issueId || null,
    cover_image: cover,
    cover_alt: coverAlt,
    cover_credit: optional(form, "cover_credit", 160),
    status,
    featured: form.get("featured") === "on",
    extra: course === "secondo" ? readFieldToPlate(form) : null,
    published_at: publishedAt,
  };

  let savedId: string;
  try {
    savedId = (await store.saveArticle(input)).id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  const fromSubmission = String(form.get("from_submission") ?? "");
  if (!id && UUID.test(fromSubmission)) await store.updateSubmission(fromSubmission, { status: "archived" }).catch(() => {});
  redirect(`/redazione/articoli/${savedId}?salvato=${intent === "publish" ? "pubblicato" : intent === "unpublish" ? "ritirato" : "1"}`);
}

export async function deleteArticle(form: FormData) {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "");
  if (UUID.test(id)) {
    await store.deleteArticle(id);
    refresh();
  }
  redirect("/redazione/articoli?eliminato=1");
}

// ─── Numeri ─────────────────────────────────────────────────────────────────
export async function saveIssue(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "") || undefined;
  const number = Number(form.get("number"));
  const month = String(form.get("month") ?? "");
  const errors: Record<string, string> = {};
  if (!Number.isInteger(number) || number < 0 || number > 99) errors.number = "Indica il numero (0 per il numero zero).";
  if (!/^\d{4}-\d{2}$/.test(month)) errors.month = "Scegli il mese di uscita.";
  const cover = mediaUrl(form, "cover_image");
  if (Object.keys(errors).length) return { ok: false, message: "Controlla i campi evidenziati.", errors };
  const status: PublishStatus = String(form.get("status")) === "published" ? "published" : "draft";
  const date = String(form.get("published_at") ?? "");
  let savedId: string;
  try {
    savedId = (
      await store.saveIssue({
        id,
        number,
        title: text(form, "title", 200),
        month: `${month}-01`,
        editorial: optional(form, "editorial", 3000),
        cover_image: cover,
        cover_alt: optional(form, "cover_alt", 300),
        pdf_url: mediaUrl(form, "pdf_url"),
        status,
        published_at: /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? date
          : status === "published"
            ? new Date().toISOString().slice(0, 10)
            : null,
      })
    ).id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/redazione/numeri/${savedId}?salvato=1`);
}

export async function deleteIssue(form: FormData) {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "");
  if (UUID.test(id)) {
    await store.deleteIssue(id);
    refresh();
  }
  redirect("/redazione/numeri?eliminato=1");
}

// ─── Contributi dei lettori ─────────────────────────────────────────────────
export async function moderateSubmission(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) return { ok: false, message: "Contributo non valido." };
  const action = String(form.get("intent") ?? "");
  const answer = optional(form, "answer", 4000);
  const map: Record<string, SubmissionStatus | undefined> = {
    publish: "published",
    archive: "archived",
    reject: "rejected",
    pending: "pending",
    save: undefined,
  };
  try {
    if (action === "delete") {
      await store.deleteSubmission(id);
    } else {
      const current = await store.getSubmission(id);
      if (action === "publish" && current?.kind === "contributo") {
        return { ok: false, message: "I contributi creativi si pubblicano trasformandoli in un articolo." };
      }
      await store.updateSubmission(id, { status: map[action], answer });
    }
  } catch (error) {
    return failure(error);
  }
  refresh();
  // Il messaggio cambia scheda: torniamo all'elenco con l'esito in evidenza.
  const tab = String(form.get("tab") ?? "");
  const params = new URLSearchParams({ esito: action });
  if (["published", "archived", "rejected"].includes(tab)) params.set("stato", tab);
  redirect(`/redazione/contributi?${params}`);
}

// ─── Sondaggi ───────────────────────────────────────────────────────────────
export async function savePoll(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "") || undefined;
  const question = text(form, "question", 300);
  const labels = form.getAll("option_label").map((v) => plainText(String(v)).slice(0, 200));
  const ids = form.getAll("option_id").map(String);
  const options = labels
    .map((label, i) => ({ id: UUID.test(ids[i] ?? "") ? ids[i] : undefined, label }))
    .filter((o) => o.label);
  const errors: Record<string, string> = {};
  if (!question) errors.question = "Scrivi la domanda del sondaggio.";
  if (options.length < 2) errors.options = "Servono almeno due risposte.";
  if (Object.keys(errors).length) return { ok: false, message: "Controlla i campi evidenziati.", errors };
  const statusValue = String(form.get("status"));
  const status: PollStatus = statusValue === "open" || statusValue === "closed" ? statusValue : "draft";
  const issueId = String(form.get("issue_id") ?? "");
  let savedId: string;
  try {
    savedId = (
      await store.savePoll({
        id,
        question,
        description: optional(form, "description", 600),
        status,
        issue_id: UUID.test(issueId) ? issueId : null,
        options,
      })
    ).id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/redazione/sondaggi/${savedId}?salvato=1`);
}

export async function deletePoll(form: FormData) {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "");
  if (UUID.test(id)) {
    await store.deletePoll(id);
    refresh();
  }
  redirect("/redazione/sondaggi?eliminato=1");
}

// ─── Giochi ─────────────────────────────────────────────────────────────────
export async function saveGame(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "") || undefined;
  const kind = String(form.get("kind")) === "quiz" ? "quiz" : "crossword";
  const title = text(form, "title", 200);
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Dai un titolo al gioco.";
  const status: PublishStatus = String(form.get("status")) === "published" ? "published" : "draft";
  const issueId = String(form.get("issue_id") ?? "");
  const base = {
    id,
    title,
    intro: optional(form, "intro", 600),
    status,
    issue_id: UUID.test(issueId) ? issueId : null,
  };

  let skipped: string[] = [];
  let input: Parameters<typeof store.saveGame>[0];
  if (kind === "crossword") {
    const entries = parseCrosswordText(String(form.get("words") ?? "").slice(0, 5000)).map((e) => ({
      answer: plainText(e.answer),
      clue: plainText(e.clue).slice(0, 200),
    }));
    if (entries.some((e) => !e.clue)) errors.words = "Ogni riga deve avere la parola e la definizione, separate da un trattino.";
    if (entries.length < 3) errors.words = "Servono almeno tre parole.";
    if (Object.keys(errors).length) return { ok: false, message: "Controlla i campi evidenziati.", errors };
    const built = buildCrossword(entries);
    skipped = built.skipped;
    input = { ...base, kind, data: built.data };
  } else {
    let questions: QuizQuestion[] = [];
    try {
      questions = (JSON.parse(String(form.get("questions") ?? "[]")) as QuizQuestion[])
        .map((q) => ({
          question: plainText(String(q.question ?? "")).slice(0, 300),
          options: (q.options ?? []).map((o) => plainText(String(o)).slice(0, 200)).filter(Boolean).slice(0, 6),
          answer: Number(q.answer) || 0,
          explanation: plainText(String(q.explanation ?? "")).slice(0, 600) || undefined,
        }))
        .filter((q) => q.question && q.options.length >= 2)
        .map((q) => ({ ...q, answer: Math.min(q.answer, q.options.length - 1) }));
    } catch {
      errors.questions = "Le domande non sono state lette correttamente.";
    }
    if (!questions.length) errors.questions = "Aggiungi almeno una domanda con due risposte.";
    if (Object.keys(errors).length) return { ok: false, message: "Controlla i campi evidenziati.", errors };
    input = { ...base, kind, data: { questions } };
  }

  let savedId: string;
  try {
    savedId = (await store.saveGame(input)).id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/redazione/giochi/${savedId}?salvato=1${skipped.length ? `&escluse=${encodeURIComponent(skipped.join(","))}` : ""}`);
}

export async function deleteGame(form: FormData) {
  const { store } = await requireStaff();
  const id = String(form.get("id") ?? "");
  if (UUID.test(id)) {
    await store.deleteGame(id);
    refresh();
  }
  redirect("/redazione/giochi?eliminato=1");
}

// ─── Impostazioni e redazione ───────────────────────────────────────────────
export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  const { store } = await requireStaff();
  const masthead = text(form, "masthead", 80);
  if (!masthead) return { ok: false, message: "Il nome della testata non può essere vuoto.", errors: { masthead: "Obbligatorio." } };
  try {
    await store.saveSettings({
      masthead,
      tagline: text(form, "tagline", 120),
      school_name: text(form, "school_name", 120),
      school_sites: text(form, "school_sites", 120),
      school_year: text(form, "school_year", 20),
      about: text(form, "about", 1200),
      footer_note: text(form, "footer_note", 1200),
    });
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { ok: true, message: "Impostazioni salvate: il sito è già aggiornato." };
}

export async function setStaffRole(_prev: FormState, form: FormData): Promise<FormState> {
  const { store, staff } = await requireStaff();
  if (staff.role !== "admin") return { ok: false, message: "Solo un amministratore può cambiare i ruoli." };
  const id = String(form.get("id") ?? "");
  const role = String(form.get("role")) as StaffMember["role"];
  if (!UUID.test(id) || !["pending", "editor", "admin"].includes(role)) return { ok: false, message: "Dati non validi." };
  if (id === staff.id && role !== "admin") return { ok: false, message: "Non puoi togliere a te stesso il ruolo di amministratore." };
  try {
    await store.setStaffRole(id, role);
  } catch (error) {
    return failure(error);
  }
  return { ok: true, message: "Ruolo aggiornato." };
}

export async function importDemo(): Promise<FormState> {
  const { store } = await requireStaff();
  try {
    await store.importDemo();
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { ok: true, message: "Contenuti dimostrativi caricati." };
}

export async function removeDemo(): Promise<FormState> {
  const { store } = await requireStaff();
  try {
    await store.removeDemo();
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { ok: true, message: "Contenuti dimostrativi rimossi. Restano solo quelli della redazione." };
}
