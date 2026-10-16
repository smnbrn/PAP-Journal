"use client";
import { useEffect, useState, useTransition } from "react";
import { fetchPollResults, votePoll } from "@/app/actions";
import type { Poll, PollResults } from "@/lib/types";

const storageKey = (id: string) => `pap-voto-${id}`;

function remembered(id: string) {
  try {
    return localStorage.getItem(storageKey(id));
  } catch {
    return null;
  }
}

/** Sondaggio: si vota una volta, poi si vedono i risultati. */
export function PollCard({ poll, tone = "light" }: { poll: Poll; tone?: "light" | "dark" }) {
  const [results, setResults] = useState<PollResults | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const closed = poll.status === "closed";

  useEffect(() => {
    const previous = remembered(poll.id);
    if (previous || closed) {
      fetchPollResults(poll.id).then((r) => {
        setChoice(previous && previous !== "1" ? previous : null);
        setResults(r);
      });
    }
  }, [poll.id, closed]);

  const vote = (optionId: string) =>
    start(async () => {
      const res = await votePoll(poll.id, optionId);
      if (res.error) {
        setNotice(res.error);
        return;
      }
      if (res.outcome === "ok" || res.outcome === "duplicate") {
        try {
          localStorage.setItem(storageKey(poll.id), optionId);
        } catch {}
        setChoice(res.outcome === "ok" ? optionId : null);
        setNotice(res.outcome === "duplicate" ? "Avevi già votato: ecco i risultati." : "Grazie, voto registrato!");
      } else if (res.outcome === "closed") {
        setNotice("Il sondaggio è chiuso: ecco com'è andata.");
      } else {
        setNotice("Non è stato possibile registrare il voto.");
      }
      setResults(res.results);
    });

  const dark = tone === "dark";
  const muted = dark ? "text-paper/70" : "text-ink-mute";

  return (
    <div data-poll={poll.id} className={`rounded-md p-6 sm:p-7 ${dark ? "bg-forest text-paper" : "bg-paper shadow-[0_0_0_1.5px_var(--color-ink)]"}`}>
      <p className={`kicker ${muted}`}>
        Sondaggio {closed ? "· chiuso" : "· aperto"}
        {poll.is_demo && <span className="stamp ml-3">Esempio</span>}
      </p>
      <h3 className="font-display mt-2 text-2xl leading-tight sm:text-3xl">{poll.question}</h3>
      {poll.description && <p className={`mt-2 text-sm ${dark ? "text-paper/80" : "text-ink-soft"}`}>{poll.description}</p>}

      {results ? (
        <ul className="mt-5 space-y-3" aria-label="Risultati del sondaggio">
          {poll.options.map((o) => {
            const votes = results.counts[o.id] ?? 0;
            const pct = results.total ? Math.round((votes / results.total) * 100) : 0;
            const mine = o.id === choice;
            return (
              <li key={o.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className={mine ? "font-bold" : "font-medium"}>
                    {o.label}
                    {mine && <span className="sr-only"> (il tuo voto)</span>}
                    {mine && <span aria-hidden> ✓</span>}
                  </span>
                  <span className="font-mono">{pct}%</span>
                </div>
                <div className={`mt-1 h-2.5 overflow-hidden rounded-full ${dark ? "bg-paper/15" : "bg-paper-3"}`}>
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out ${mine ? "bg-tomato" : dark ? "bg-saffron" : "bg-ink"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
          <li className={`pt-1 text-xs ${muted}`}>
            {results.total} {results.total === 1 ? "voto" : "voti"} in totale
          </li>
        </ul>
      ) : (
        <fieldset className="mt-5" disabled={pending}>
          <legend className="sr-only">Scegli una risposta</legend>
          <div className="grid gap-2">
            {poll.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => vote(o.id)}
                className={`group flex items-center justify-between rounded-full px-5 py-3 text-left font-semibold transition ${
                  dark
                    ? "bg-paper/10 hover:bg-paper hover:text-ink"
                    : "shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink hover:text-paper"
                } disabled:opacity-60`}
              >
                {o.label}
                <span aria-hidden className="opacity-0 transition group-hover:opacity-100">
                  Vota →
                </span>
              </button>
            ))}
          </div>
          <p className={`mt-3 text-xs ${muted}`}>
            {pending ? "Registrazione del voto…" : "Voto anonimo: non raccogliamo dati personali."}
          </p>
        </fieldset>
      )}
      <p role="status" className="mt-3 min-h-5 text-sm font-semibold">
        {notice}
      </p>
    </div>
  );
}
