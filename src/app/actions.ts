"use server";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { plainText } from "@/lib/sanitize";
import { getPublicStore } from "@/lib/store";
import type { PollResults, SubmissionKind, VoteOutcome } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READER_COOKIE = "pap_lettore";
const SENT_COOKIE = "pap_ultimo_invio";

/**
 * Identificativo anonimo del browser, usato solo per evitare voti doppi.
 * Nel database finisce un'impronta (hash) legata al singolo sondaggio.
 */
async function readerHash(pollId: string) {
  const jar = await cookies();
  let id = jar.get(READER_COOKIE)?.value;
  if (!id || !UUID.test(id)) {
    id = randomUUID();
    jar.set(READER_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return createHash("sha256").update(`${id}:${pollId}`).digest("hex");
}

export async function fetchPollResults(pollId: string): Promise<PollResults | null> {
  if (!UUID.test(pollId)) return null;
  return getPublicStore().getPollResults(pollId);
}

export async function votePoll(
  pollId: string,
  optionId: string,
): Promise<{ outcome: VoteOutcome; results: PollResults | null; error?: string }> {
  if (!UUID.test(pollId) || !UUID.test(optionId)) return { outcome: "invalid", results: null };
  const store = getPublicStore();
  try {
    const outcome = await store.vote(pollId, optionId, await readerHash(pollId));
    return { outcome, results: await store.getPollResults(pollId) };
  } catch (error) {
    return { outcome: "invalid", results: null, error: (error as Error).message };
  }
}

// ─── Modulo «Scrivi alla redazione» ─────────────────────────────────────────
export type ContributionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Partial<Record<"kind" | "title" | "message" | "signature" | "class_label" | "consent", string>>;
  values?: Record<string, string>;
};

const KINDS: SubmissionKind[] = ["domanda", "lettera", "contributo"];
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE = /(\+?\d[\d\s./-]{7,}\d)/;

export async function sendContribution(_prev: ContributionState, form: FormData): Promise<ContributionState> {
  const values = {
    kind: String(form.get("kind") ?? ""),
    title: plainText(String(form.get("title") ?? "")),
    message: plainText(String(form.get("message") ?? "")),
    signature: plainText(String(form.get("signature") ?? "")),
    class_label: plainText(String(form.get("class_label") ?? "")),
  };

  // Campo trappola invisibile: se è compilato, a scrivere è un programma automatico.
  if (String(form.get("sito_web") ?? "").length > 0) {
    return { status: "ok", message: "Grazie! Il tuo messaggio è arrivato alla redazione." };
  }

  const errors: ContributionState["errors"] = {};
  if (!KINDS.includes(values.kind as SubmissionKind)) errors.kind = "Scegli che cosa vuoi inviare.";
  if (values.message.length < 20) errors.message = "Il messaggio è troppo corto: scrivi almeno 20 caratteri.";
  else if (values.message.length > 4000) errors.message = "Il messaggio è troppo lungo: massimo 4000 caratteri.";
  else if (EMAIL.test(values.message) || PHONE.test(values.message))
    errors.message = "Per la tua privacy, togli dal messaggio indirizzi email e numeri di telefono.";
  if (values.title.length > 200) errors.title = "Il titolo può avere al massimo 200 caratteri.";
  if (values.signature.length > 80) errors.signature = "La firma può avere al massimo 80 caratteri.";
  if (EMAIL.test(values.signature)) errors.signature = "Non serve l'email: basta un nome, le iniziali o uno pseudonimo.";
  if (values.class_label.length > 40) errors.class_label = "Indica la classe in modo breve, per esempio «3ª B».";
  if (form.get("consent") !== "on") errors.consent = "Per inviare devi confermare di aver letto le regole.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Controlla i campi evidenziati.", errors, values };
  }

  const jar = await cookies();
  const last = Number(jar.get(SENT_COOKIE)?.value ?? 0);
  if (Date.now() - last < 60_000) {
    return {
      status: "error",
      message: "Hai appena inviato un messaggio. Aspetta un minuto prima di mandarne un altro.",
      values,
    };
  }

  try {
    await getPublicStore().submit({
      kind: values.kind as SubmissionKind,
      title: values.title || null,
      message: values.message,
      signature: values.signature || null,
      class_label: values.class_label || null,
    });
  } catch (error) {
    return { status: "error", message: (error as Error).message, values };
  }

  jar.set(SENT_COOKIE, String(Date.now()), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 120 });
  return {
    status: "ok",
    message:
      "Grazie! Il tuo messaggio è arrivato alla redazione. Verrà letto e, se approvato, pubblicato in uno dei prossimi numeri.",
  };
}
