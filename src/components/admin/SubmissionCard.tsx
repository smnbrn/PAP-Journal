"use client";
import Link from "next/link";
import { moderateSubmission } from "@/app/redazione/actions";
import { formatDay } from "@/lib/format";
import type { Submission } from "@/lib/types";
import { FormMessage, useFormAction } from "./controls";
import { inputClass, StatusPill } from "./ui";

const kinds = { domanda: "Domanda per La Piazza", lettera: "Lettera alla redazione", contributo: "Contributo creativo" };

export function SubmissionCard({ submission: s }: { submission: Submission }) {
  const { state, pending, intent, onSubmit } = useFormAction(moderateSubmission);
  const label = (value: string, text: string) => (pending && intent === value ? "Un momento…" : text);
  const btn = "btn px-4 py-2 text-sm";

  return (
    <article className="rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)] sm:p-6">
      <header className="flex flex-wrap items-center gap-3">
        <p className="kicker text-ink-mute">{kinds[s.kind]}</p>
        <StatusPill status={s.status} />
        {s.is_demo && <span className="stamp text-ink-mute">Esempio</span>}
        <time className="ml-auto text-sm text-ink-mute" dateTime={s.created_at}>
          {formatDay(s.created_at)}
        </time>
      </header>
      {s.title && <h2 className="font-display mt-3 text-2xl">{s.title}</h2>}
      <p className="mt-3 font-serif text-lg leading-relaxed whitespace-pre-line">{s.message}</p>
      <p className="mt-3 text-sm text-ink-mute">
        Firma: {s.signature || "nessuna"}
        {s.class_label && ` · ${s.class_label}`}
      </p>

      <form
        onSubmit={(e) => {
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          if (submitter?.value === "delete" && !window.confirm("Eliminare definitivamente questo messaggio?")) {
            e.preventDefault();
            return;
          }
          onSubmit(e);
        }}
        className="mt-5 space-y-4 border-t border-rule pt-5"
      >
        <input type="hidden" name="id" value={s.id} />
        <input type="hidden" name="tab" value={s.status} />
        {s.kind !== "contributo" && (
          <div>
            <label htmlFor={`answer-${s.id}`} className="mb-1.5 block font-semibold">
              {s.kind === "domanda" ? "Risposta della redazione" : "Nota della redazione"}{" "}
              <span className="font-normal text-ink-mute">({s.kind === "domanda" ? "consigliata" : "facoltativa"})</span>
            </label>
            <textarea id={`answer-${s.id}`} name="answer" rows={4} defaultValue={s.answer ?? ""} maxLength={4000} className={inputClass} />
          </div>
        )}
        <FormMessage state={state} />
        <div className="flex flex-wrap gap-2">
          {s.kind === "contributo" ? (
            <Link href={`/redazione/articoli/nuovo?contributo=${s.id}`} className={`${btn} btn-ink`}>
              Trasforma in articolo
            </Link>
          ) : s.status !== "published" ? (
            <button name="intent" value="publish" disabled={pending} className={`${btn} btn-ink`}>
              {label("publish", "Pubblica")}
            </button>
          ) : (
            <button name="intent" value="save" disabled={pending} className={`${btn} btn-ink`}>
              {label("save", "Aggiorna la risposta")}
            </button>
          )}
          {s.status !== "archived" && (
            <button name="intent" value="archive" disabled={pending} className={`${btn} btn-outline`}>
              {label("archive", s.status === "published" ? "Togli dal sito" : "Preso in carico")}
            </button>
          )}
          {s.status !== "rejected" && (
            <button name="intent" value="reject" disabled={pending} className={`${btn} btn-outline`}>
              {label("reject", "Rifiuta")}
            </button>
          )}
          {s.status !== "pending" && (
            <button name="intent" value="pending" disabled={pending} className={`${btn} hover:bg-paper-3`}>
              {label("pending", "Rimetti in attesa")}
            </button>
          )}
          <button name="intent" value="delete" disabled={pending} className={`${btn} ml-auto text-tomato-ink hover:bg-paper-3`}>
            {label("delete", "Elimina")}
          </button>
        </div>
      </form>
    </article>
  );
}
