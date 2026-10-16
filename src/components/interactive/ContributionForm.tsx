"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { sendContribution, type ContributionState } from "@/app/actions";

const KINDS = [
  {
    value: "domanda",
    label: "Una domanda per La Piazza",
    hint: "Su un fatto di attualità o sulla scuola. Le risposte arrivano nel numero successivo.",
  },
  {
    value: "lettera",
    label: "Una lettera alla redazione",
    hint: "Un commento, un'idea, una critica: può essere pubblicata nella posta del Caffè.",
  },
  {
    value: "contributo",
    label: "Un contributo creativo",
    hint: "Un racconto, una poesia, una proposta di articolo. La redazione ti ricontatterà a scuola.",
  },
] as const;

const initial: ContributionState = { status: "idle" };

export function ContributionForm({ defaultKind }: { defaultKind?: string }) {
  const [state, action, pending] = useActionState(sendContribution, initial);
  const [length, setLength] = useState(state.values?.message.length ?? 0);
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const startKind = v.kind ?? (KINDS.some((k) => k.value === defaultKind) ? defaultKind : "domanda");

  if (state.status === "ok") {
    return (
      <div className="animate-rise rounded-md bg-forest p-8 text-paper sm:p-12" role="status">
        <p className="font-display-wonk text-5xl italic">Grazie!</p>
        <p className="mt-4 max-w-xl text-lg">{state.message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn bg-paper text-ink hover:bg-saffron">
            Torna alla prima pagina
          </Link>
          <Link href="/menu/caffe" className="btn btn-outline text-paper">
            Vai al Caffè
          </Link>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-md border-2 bg-paper px-4 py-3 text-base outline-none transition focus:border-tomato";
  const border = (name: keyof NonNullable<ContributionState["errors"]>) => (e[name] ? "border-tomato-ink" : "border-ink/25");

  return (
    <form action={action} noValidate className="space-y-8" aria-describedby={state.message ? "esito" : undefined}>
      {state.status === "error" && state.message && (
        <p id="esito" role="alert" className="rounded-md border-2 border-tomato-ink bg-[#f6ddd3] px-4 py-3 font-semibold text-tomato-ink">
          {state.message}
        </p>
      )}

      <fieldset>
        <legend className="kicker mb-3 text-ink-mute">Che cosa vuoi inviare?</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className="relative flex cursor-pointer flex-col rounded-md border-2 border-ink/20 p-4 transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-tomato"
            >
              <input type="radio" name="kind" value={k.value} defaultChecked={startKind === k.value} className="sr-only" />
              <span className="font-semibold">{k.label}</span>
              <span className="mt-1 text-sm opacity-80">{k.hint}</span>
            </label>
          ))}
        </div>
        {e.kind && <p className="mt-2 text-sm font-semibold text-tomato-ink">{e.kind}</p>}
      </fieldset>

      <div>
        <label htmlFor="title" className="mb-2 block font-semibold">
          Titolo <span className="font-normal text-ink-mute">(facoltativo)</span>
        </label>
        <input id="title" name="title" defaultValue={v.title} maxLength={200} className={`${field} ${border("title")}`} aria-invalid={!!e.title} aria-describedby={e.title ? "title-err" : undefined} />
        {e.title && (
          <p id="title-err" className="mt-2 text-sm font-semibold text-tomato-ink">
            {e.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block font-semibold">
          Il tuo messaggio
        </label>
        <textarea
          id="message"
          name="message"
          rows={8}
          required
          maxLength={4000}
          defaultValue={v.message}
          onChange={(ev) => setLength(ev.target.value.length)}
          className={`${field} ${border("message")} font-serif text-lg leading-relaxed`}
          aria-invalid={!!e.message}
          aria-describedby={`message-help${e.message ? " message-err" : ""}`}
        />
        <div className="mt-2 flex justify-between gap-4 text-sm">
          <p id="message-help" className="text-ink-mute">
            Da 20 a 4000 caratteri. Non inserire email, numeri di telefono o dati di altre persone.
          </p>
          <p className="shrink-0 font-mono text-ink-mute" aria-hidden>
            {length}/4000
          </p>
        </div>
        {e.message && (
          <p id="message-err" className="mt-1 text-sm font-semibold text-tomato-ink">
            {e.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="signature" className="mb-2 block font-semibold">
            Firma <span className="font-normal text-ink-mute">(facoltativa)</span>
          </label>
          <input
            id="signature"
            name="signature"
            defaultValue={v.signature}
            maxLength={80}
            placeholder="Nome, iniziali o pseudonimo"
            className={`${field} ${border("signature")}`}
            aria-invalid={!!e.signature}
          />
          {e.signature && <p className="mt-2 text-sm font-semibold text-tomato-ink">{e.signature}</p>}
        </div>
        <div>
          <label htmlFor="class_label" className="mb-2 block font-semibold">
            Classe <span className="font-normal text-ink-mute">(facoltativa)</span>
          </label>
          <input id="class_label" name="class_label" defaultValue={v.class_label} maxLength={40} placeholder="Per esempio 3ª B" className={`${field} ${border("class_label")}`} aria-invalid={!!e.class_label} />
          {e.class_label && <p className="mt-2 text-sm font-semibold text-tomato-ink">{e.class_label}</p>}
        </div>
      </div>

      {/* Campo trappola per i programmi automatici: le persone non lo vedono */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="sito_web">Lascia vuoto questo campo</label>
        <input id="sito_web" name="sito_web" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" className="mt-1 size-5 accent-[var(--color-ink)]" aria-invalid={!!e.consent} />
          <span>
            Ho letto le{" "}
            <Link href="/privacy" className="font-semibold underline underline-offset-2">
              regole di pubblicazione e la privacy
            </Link>
            . So che il messaggio sarà letto dalla redazione e pubblicato solo se approvato.
          </span>
        </label>
        {e.consent && <p className="mt-2 text-sm font-semibold text-tomato-ink">{e.consent}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-ink px-8 py-4 text-base">
        {pending ? "Invio in corso…" : "Invia alla redazione"}
      </button>
    </form>
  );
}
