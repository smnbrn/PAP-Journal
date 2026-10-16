"use client";
import { useDeferredValue, useMemo, useState } from "react";
import { saveGame } from "@/app/redazione/actions";
import { buildCrossword, parseCrosswordText } from "@/lib/crossword";
import type { Game, Issue, QuizQuestion } from "@/lib/types";
import { FormMessage, useFormAction } from "./controls";
import { Field, inputClass } from "./ui";

type Draft = Partial<Game> & { kind: "crossword" | "quiz" };

export function GameEditor({ game, issues }: { game: Draft; issues: Issue[] }) {
  const { state, pending, onSubmit } = useFormAction(saveGame);
  const e = state.errors ?? {};
  const [kind, setKind] = useState(game.kind);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {game.id && <input type="hidden" name="id" value={game.id} />}
      <input type="hidden" name="kind" value={kind} />
      <div className="min-w-0 space-y-6">
        <FormMessage state={state} />
        {!game.id && (
          <fieldset>
            <legend className="mb-2 font-semibold">Tipo di gioco</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { v: "crossword" as const, l: "Cruciverba", h: "Scrivi parole e definizioni: la griglia si crea da sola." },
                { v: "quiz" as const, l: "Quiz", h: "Domande a scelta multipla con spiegazione." },
              ].map((k) => (
                <label
                  key={k.v}
                  className="flex cursor-pointer flex-col rounded-md border-2 border-ink/20 p-4 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-tomato"
                >
                  <input type="radio" name="kind_choice" checked={kind === k.v} onChange={() => setKind(k.v)} className="sr-only" />
                  <span className="font-semibold">{k.l}</span>
                  <span className="mt-1 text-sm opacity-80">{k.h}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <Field id="title" label="Titolo" error={e.title}>
          <input id="title" name="title" required maxLength={200} defaultValue={game.title ?? ""} aria-invalid={!!e.title} className={`${inputClass} font-display text-xl`} />
        </Field>
        <Field id="intro" label="Introduzione" optional>
          <textarea id="intro" name="intro" rows={2} maxLength={600} defaultValue={game.intro ?? ""} className={inputClass} />
        </Field>
        {kind === "crossword" ? (
          <CrosswordInput initial={game.kind === "crossword" && game.data ? game.data.entries : []} error={e.words} />
        ) : (
          <QuizBuilder initial={game.kind === "quiz" && game.data ? game.data.questions : []} error={e.questions} />
        )}
      </div>
      <aside className="space-y-4 self-start rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-ink)] lg:sticky lg:top-6">
        <fieldset>
          <legend className="mb-2 font-semibold">Stato</legend>
          {[
            { v: "draft", l: "Bozza" },
            { v: "published", l: "Pubblicato" },
          ].map((s) => (
            <label key={s.v} className="flex items-center gap-3 py-1">
              <input type="radio" name="status" value={s.v} defaultChecked={(game.status ?? "draft") === s.v} className="size-4 accent-[var(--color-ink)]" />
              {s.l}
            </label>
          ))}
        </fieldset>
        <Field id="issue_id" label="Numero" optional>
          <select id="issue_id" name="issue_id" defaultValue={game.issue_id ?? ""} className={inputClass}>
            <option value="">Nessuno</option>
            {issues.map((i) => (
              <option key={i.id} value={i.id}>
                {i.number === 0 ? "Numero zero" : `Numero ${i.number}`}
              </option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={pending} className="btn btn-ink w-full">
          {pending ? "Salvataggio…" : "Salva il gioco"}
        </button>
      </aside>
    </form>
  );
}

function CrosswordInput({ initial, error }: { initial: { answer: string; clue: string }[]; error?: string }) {
  const [text, setText] = useState(initial.map((e) => `${e.answer} - ${e.clue}`).join("\n"));
  const deferred = useDeferredValue(text);
  const preview = useMemo(() => {
    const entries = parseCrosswordText(deferred).filter((e) => e.answer.length >= 2 && e.clue);
    return entries.length >= 2 ? { ...buildCrossword(entries), count: entries.length } : null;
  }, [deferred]);

  const layout = preview?.data.layout;
  const cells = new Map<string, { letter: string; number?: number }>();
  layout?.words.forEach((w) => {
    for (let k = 0; k < w.answer.length; k++) {
      const r = w.row + (w.dir === "down" ? k : 0);
      const c = w.col + (w.dir === "across" ? k : 0);
      const cell = cells.get(`${r}:${c}`) ?? { letter: w.answer[k] };
      if (k === 0) cell.number = w.number;
      cells.set(`${r}:${c}`, cell);
    }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Field
        id="words"
        label="Parole e definizioni"
        error={error}
        hint={
          <>
            Una per riga, nella forma <code>PAROLA - definizione</code>. Accenti e spazi vengono tolti dalla parola (Caffè → CAFFE).
          </>
        }
      >
        <textarea
          id="words"
          name="words"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"LIEVITO - Fa crescere l'impasto\nFORNO - Ci cuoce il pane\nFARINA - Si ottiene macinando il grano"}
          className={`${inputClass} font-mono text-sm`}
          aria-invalid={!!error}
        />
      </Field>
      <div>
        <p className="mb-1.5 font-semibold">Anteprima della griglia</p>
        {layout ? (
          <>
            <div
              className="grid gap-px rounded bg-paper-2 p-2"
              style={{ gridTemplateColumns: `repeat(${layout.width}, minmax(0, 1fr))`, maxWidth: `${layout.width * 1.9}rem` }}
              aria-label={`Griglia di ${layout.width} per ${layout.height} caselle`}
              role="img"
            >
              {Array.from({ length: layout.height * layout.width }).map((_, i) => {
                const cell = cells.get(`${Math.floor(i / layout.width)}:${i % layout.width}`);
                return cell ? (
                  <div key={i} className="relative grid aspect-square place-items-center border border-ink bg-paper font-mono text-[0.6rem] sm:text-xs">
                    {cell.number && <span className="absolute top-0 left-0.5 text-[0.45rem] leading-none text-ink-mute">{cell.number}</span>}
                    {cell.letter}
                  </div>
                ) : (
                  <div key={i} aria-hidden />
                );
              })}
            </div>
            <p className="mt-2 text-sm text-ink-mute" role="status">
              {preview.count - preview.skipped.length} parole incrociate su {preview.count}.
              {preview.skipped.length > 0 && (
                <span className="font-semibold text-tomato-ink"> Non trovano posto: {preview.skipped.join(", ")}. Prova a cambiarle o aggiungere parole con lettere in comune.</span>
              )}
            </p>
          </>
        ) : (
          <p className="rounded-md border-2 border-dashed border-ink/20 p-6 text-sm text-ink-mute">Scrivi almeno due parole per vedere la griglia.</p>
        )}
      </div>
    </div>
  );
}

function QuizBuilder({ initial, error }: { initial: QuizQuestion[]; error?: string }) {
  type Q = QuizQuestion & { key: string };
  const blank = (): Q => ({ key: crypto.randomUUID(), question: "", options: ["", "", ""], answer: 0, explanation: "" });
  const [questions, setQuestions] = useState<Q[]>(initial.length ? initial.map((q, i) => ({ ...q, key: `q${i}` })) : [{ ...blank(), key: "q0" }]);
  const update = (key: string, patch: Partial<Q>) => setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));

  return (
    <fieldset>
      <legend className="mb-2 font-semibold">Domande</legend>
      <input type="hidden" name="questions" value={JSON.stringify(questions.map((q) => ({ question: q.question, options: q.options, answer: q.answer, explanation: q.explanation })))} />
      <ol className="space-y-4">
        {questions.map((q, qi) => (
          <li key={q.key} className="rounded-md bg-paper p-4 shadow-[0_0_0_1.5px_var(--color-rule)]">
            <div className="flex items-center justify-between gap-3">
              <span className="kicker text-ink-mute">Domanda {qi + 1}</span>
              <button
                type="button"
                disabled={questions.length <= 1}
                onClick={() => setQuestions(questions.filter((x) => x.key !== q.key))}
                className="text-sm text-tomato-ink underline disabled:opacity-30"
              >
                Togli
              </button>
            </div>
            <input
              aria-label={`Testo della domanda ${qi + 1}`}
              value={q.question}
              maxLength={300}
              onChange={(e) => update(q.key, { question: e.target.value })}
              placeholder="Scrivi la domanda"
              className={`${inputClass} mt-2 font-semibold`}
            />
            <div className="mt-3 space-y-2" role="radiogroup" aria-label={`Risposta giusta della domanda ${qi + 1}`}>
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.key}`}
                    checked={q.answer === oi}
                    onChange={() => update(q.key, { answer: oi })}
                    aria-label={`Risposta ${oi + 1} è quella giusta`}
                    className="size-4 shrink-0 accent-[var(--color-forest)]"
                  />
                  <input
                    aria-label={`Risposta ${oi + 1}`}
                    value={o}
                    maxLength={200}
                    onChange={(e) => update(q.key, { options: q.options.map((x, i) => (i === oi ? e.target.value : x)) })}
                    className={`${inputClass} py-1.5`}
                  />
                  <button
                    type="button"
                    aria-label={`Togli la risposta ${oi + 1}`}
                    disabled={q.options.length <= 2}
                    onClick={() =>
                      update(q.key, {
                        options: q.options.filter((_, i) => i !== oi),
                        answer: q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer,
                      })
                    }
                    className="grid size-9 shrink-0 place-items-center rounded hover:bg-paper-3 disabled:opacity-30"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {q.options.length < 6 && (
              <button type="button" onClick={() => update(q.key, { options: [...q.options, ""] })} className="mt-2 ml-6 text-sm underline">
                + risposta
              </button>
            )}
            <input
              aria-label={`Spiegazione della domanda ${qi + 1}`}
              value={q.explanation ?? ""}
              maxLength={600}
              onChange={(e) => update(q.key, { explanation: e.target.value })}
              placeholder="Spiegazione mostrata dopo la risposta (facoltativa)"
              className={`${inputClass} mt-3 text-sm`}
            />
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-ink-mute">Seleziona il pallino accanto alla risposta giusta.</p>
      <button type="button" onClick={() => setQuestions([...questions, blank()])} className="btn btn-outline mt-3 px-4 py-2 text-sm">
        + Aggiungi domanda
      </button>
      {error && <p className="mt-2 text-sm font-semibold text-tomato-ink">{error}</p>}
    </fieldset>
  );
}
