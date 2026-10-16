"use client";
import { useState } from "react";
import type { QuizData } from "@/lib/types";

/** Quiz a risposta multipla: una domanda alla volta, con spiegazione. */
export function Quiz({ data }: { data: QuizData }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = index >= data.questions.length;

  if (done) {
    const total = data.questions.length;
    const ratio = score / total;
    return (
      <div className="animate-rise rounded-md bg-ink p-8 text-paper sm:p-12" role="status">
        <p className="kicker text-saffron">Risultato</p>
        <p className="font-display-wonk mt-3 text-7xl">
          {score}
          <span className="text-paper/50">/{total}</span>
        </p>
        <p className="font-display mt-4 text-2xl italic">
          {ratio === 1 ? "Perfetto: stagionato al punto giusto!" : ratio >= 0.6 ? "Ottimo raccolto!" : "C'è ancora qualcosa da coltivare."}
        </p>
        <button
          type="button"
          className="btn mt-8 bg-paper text-ink hover:bg-saffron"
          onClick={() => {
            setIndex(0);
            setPicked(null);
            setScore(0);
          }}
        >
          Gioca di nuovo
        </button>
      </div>
    );
  }

  const q = data.questions[index];
  const answered = picked !== null;
  return (
    <div className="rounded-md bg-paper p-6 shadow-[0_0_0_1.5px_var(--color-ink)] sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="kicker text-ink-mute">
          Domanda {index + 1} di {data.questions.length}
        </p>
        <div className="flex gap-1" aria-hidden>
          {data.questions.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i < index ? "bg-ink" : i === index ? "bg-tomato" : "bg-paper-3"}`} />
          ))}
        </div>
      </div>
      <h2 className="font-display mt-4 text-3xl leading-tight">{q.question}</h2>
      <div className="mt-6 grid gap-3" role="group" aria-label="Risposte">
        {q.options.map((option, i) => {
          const correct = i === q.answer;
          const state = !answered ? "" : correct ? "bg-forest text-paper" : i === picked ? "bg-tomato-ink text-paper" : "opacity-50";
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => {
                setPicked(i);
                if (correct) setScore((s) => s + 1);
              }}
              className={`flex items-center justify-between rounded-md px-5 py-4 text-left font-semibold shadow-[inset_0_0_0_1.5px_var(--color-ink)] transition enabled:hover:bg-ink enabled:hover:text-paper ${state}`}
            >
              {option}
              {answered && correct && <span aria-label="risposta corretta">✓</span>}
              {answered && i === picked && !correct && <span aria-label="risposta sbagliata">✗</span>}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <div className="animate-rise mt-6 border-t border-rule pt-5">
            <p className="font-semibold">{picked === q.answer ? "Esatto!" : `La risposta giusta era: ${q.options[q.answer]}.`}</p>
            {q.explanation && <p className="mt-1 text-ink-soft">{q.explanation}</p>}
            <button
              type="button"
              className="btn btn-ink mt-5"
              onClick={() => {
                setIndex((n) => n + 1);
                setPicked(null);
              }}
              autoFocus
            >
              {index + 1 === data.questions.length ? "Vedi il risultato" : "Domanda successiva →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
