"use client";
import { useState } from "react";
import { savePoll } from "@/app/redazione/actions";
import type { Issue, Poll } from "@/lib/types";
import { FormMessage, useFormAction } from "./controls";
import { Field, inputClass } from "./ui";

export function PollEditor({ poll, issues, hasVotes }: { poll: Partial<Poll>; issues: Issue[]; hasVotes: boolean }) {
  const { state, pending, onSubmit } = useFormAction(savePoll);
  const e = state.errors ?? {};
  const [options, setOptions] = useState(
    poll.options?.length ? poll.options.map((o) => ({ key: o.id, id: o.id, label: o.label })) : [0, 1, 2].map((n) => ({ key: `n${n}`, id: "", label: "" })),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {poll.id && <input type="hidden" name="id" value={poll.id} />}
      <div className="min-w-0 space-y-6">
        <FormMessage state={state} />
        <Field id="question" label="Domanda" error={e.question}>
          <input id="question" name="question" required maxLength={300} defaultValue={poll.question ?? ""} aria-invalid={!!e.question} className={`${inputClass} font-display text-xl`} />
        </Field>
        <Field id="description" label="Spiegazione" optional>
          <textarea id="description" name="description" rows={3} maxLength={600} defaultValue={poll.description ?? ""} className={inputClass} />
        </Field>
        <fieldset>
          <legend className="mb-2 font-semibold">Risposte</legend>
          {hasVotes && (
            <p className="mb-3 text-sm text-ink-mute">
              Ci sono già dei voti: puoi correggere il testo delle risposte, ma se ne togli una i suoi voti andranno persi.
            </p>
          )}
          <ol className="space-y-2">
            {options.map((o, i) => (
              <li key={o.key} className="flex items-center gap-2">
                <span className="w-6 text-right font-mono text-sm text-ink-mute">{i + 1}.</span>
                <input type="hidden" name="option_id" value={o.id} />
                <input
                  name="option_label"
                  aria-label={`Risposta ${i + 1}`}
                  value={o.label}
                  maxLength={200}
                  onChange={(ev) => setOptions(options.map((x) => (x.key === o.key ? { ...x, label: ev.target.value } : x)))}
                  className={inputClass}
                />
                <button
                  type="button"
                  aria-label={`Togli la risposta ${i + 1}`}
                  disabled={options.length <= 2}
                  onClick={() => setOptions(options.filter((x) => x.key !== o.key))}
                  className="grid size-10 shrink-0 place-items-center rounded-md text-xl hover:bg-paper-3 disabled:opacity-30"
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
          {options.length < 8 && (
            <button
              type="button"
              onClick={() => setOptions([...options, { key: `n${Date.now()}`, id: "", label: "" }])}
              className="mt-3 ml-8 text-sm font-semibold underline underline-offset-4"
            >
              + Aggiungi una risposta
            </button>
          )}
          {e.options && <p className="mt-2 text-sm font-semibold text-tomato-ink">{e.options}</p>}
        </fieldset>
      </div>
      <aside className="space-y-4 self-start rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-ink)]">
        <fieldset>
          <legend className="mb-2 font-semibold">Stato</legend>
          {[
            { v: "draft", l: "Bozza", h: "Non visibile ai lettori." },
            { v: "open", l: "Aperto", h: "Si può votare." },
            { v: "closed", l: "Chiuso", h: "Si vedono solo i risultati." },
          ].map((s) => (
            <label key={s.v} className="flex items-start gap-3 py-1">
              <input type="radio" name="status" value={s.v} defaultChecked={(poll.status ?? "draft") === s.v} className="mt-1 size-4 accent-[var(--color-ink)]" />
              <span>
                {s.l}
                <span className="block text-sm text-ink-mute">{s.h}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <Field id="issue_id" label="Numero" optional>
          <select id="issue_id" name="issue_id" defaultValue={poll.issue_id ?? ""} className={inputClass}>
            <option value="">Nessuno</option>
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {i.number === 0 ? "Numero zero" : `Numero ${i.number}`}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={pending} className="btn btn-ink w-full">
          {pending ? "Salvataggio…" : "Salva il sondaggio"}
        </button>
      </aside>
    </form>
  );
}
