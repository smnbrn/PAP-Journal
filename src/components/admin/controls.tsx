"use client";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { uploadFile } from "@/lib/upload-client";
import type { FormState } from "@/app/redazione/actions";
import { inputClass } from "./ui";

/** Pulsante di invio che mostra lo stato di attesa. */
export function SubmitButton({
  children,
  pendingLabel = "Salvataggio…",
  intent,
  className = "btn btn-ink",
}: {
  children: ReactNode;
  pendingLabel?: string;
  intent?: string;
  className?: string;
}) {
  const { pending, data } = useFormStatus();
  const mine = pending && (!intent || data?.get("intent") === intent);
  return (
    <button type="submit" name={intent ? "intent" : undefined} value={intent} disabled={pending} className={className}>
      {mine ? pendingLabel : children}
    </button>
  );
}

/** Modulo con un solo pulsante che chiede conferma (per eliminare). */
export function ConfirmForm({
  action,
  id,
  message,
  children,
  className = "btn btn-outline text-tomato-ink",
}: {
  action: (form: FormData) => Promise<void>;
  id: string;
  message: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton className={className} pendingLabel="Eliminazione…">
        {children}
      </SubmitButton>
    </form>
  );
}

/** Pulsante d'azione che non riceve dati (importa/rimuovi esempi). */
export function ActionButton({
  action,
  confirm,
  children,
  className = "btn btn-outline",
}: {
  action: () => Promise<FormState>;
  confirm?: string;
  children: ReactNode;
  className?: string;
}) {
  const [state, run, pending] = useActionState(async () => action(), {} as FormState);
  return (
    <form
      action={run}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline-flex flex-col gap-2"
    >
      <button type="submit" disabled={pending} className={className}>
        {pending ? "Un momento…" : children}
      </button>
      {state.message && (
        <span role="status" className={`text-sm font-semibold ${state.ok ? "text-forest" : "text-tomato-ink"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}

/**
 * Invia il modulo a un'azione del server senza svuotarlo: se il server
 * segnala un errore, quanto scritto resta al suo posto.
 */
export function useFormAction(action: (prev: FormState, form: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {} as FormState);
  const [intent, setIntent] = useState("");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const form = new FormData(e.currentTarget, submitter);
    setIntent(String(form.get("intent") ?? ""));
    startTransition(() => dispatch(form));
  };
  return { state, pending, intent, onSubmit };
}

/** Avvisa prima di lasciare la pagina con modifiche non salvate. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/**
 * Campo per caricare un'immagine: anteprima, descrizione obbligatoria
 * e possibilità di incollare un indirizzo già esistente.
 */
export function ImageField({
  name,
  altName,
  label,
  initialUrl,
  initialAlt,
  altError,
  onChange,
}: {
  name: string;
  altName: string;
  label: string;
  initialUrl: string | null;
  initialAlt: string | null;
  altError?: string;
  onChange?: () => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadFile(file, "immagini"));
      onChange?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 font-semibold">{label}</legend>
      <input type="hidden" name={name} value={url} />
      <div
        className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-md border-2 border-dashed border-ink/25 bg-paper-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <p className="px-4 text-center text-sm text-ink-mute">
            {busy ? "Caricamento in corso…" : "Trascina qui un'immagine oppure usa il pulsante qui sotto"}
          </p>
        )}
        {busy && url && <div className="absolute inset-0 grid place-items-center bg-paper/70 font-semibold">Caricamento…</div>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline px-4 py-2 text-sm" disabled={busy} onClick={() => input.current?.click()}>
          {url ? "Cambia immagine" : "Carica immagine"}
        </button>
        {url && (
          <button
            type="button"
            className="btn px-4 py-2 text-sm text-tomato-ink hover:bg-paper-3"
            onClick={() => {
              setUrl("");
              onChange?.();
            }}
          >
            Togli
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-tomato-ink">
          {error}
        </p>
      )}
      <div>
        <label htmlFor={`${altName}-input`} className="mb-1 block text-sm font-semibold">
          Descrizione per chi non vede l&apos;immagine{url ? "" : " (se c'è un'immagine)"}
        </label>
        <input
          id={`${altName}-input`}
          name={altName}
          value={alt}
          onChange={(e) => {
            setAlt(e.target.value);
            onChange?.();
          }}
          maxLength={300}
          placeholder="Per esempio: castagne appena raccolte in un cesto di vimini"
          className={inputClass}
          aria-invalid={!!altError}
        />
        {altError && <p className="mt-1 text-sm font-semibold text-tomato-ink">{altError}</p>}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-ink-mute">Usa un indirizzo già online</summary>
        <input
          aria-label="Indirizzo dell'immagine"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value.trim());
            onChange?.();
          }}
          placeholder="https://…"
          className={`${inputClass} mt-2 text-sm`}
        />
      </details>
    </fieldset>
  );
}

/** Caricamento del PDF di un numero. */
export function PdfField({ name, initialUrl }: { name: string; initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadFile(file, "pdf"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <fieldset>
      <legend className="mb-1.5 font-semibold">PDF del numero</legend>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-3 rounded-md border-2 border-dashed border-ink/25 bg-paper-2 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded bg-ink font-mono text-xs text-paper">PDF</span>
        <div className="min-w-0 flex-1 text-sm">
          {busy ? (
            <p className="font-semibold">Caricamento in corso…</p>
          ) : url ? (
            <a href={url} target="_blank" rel="noreferrer" className="block truncate font-semibold underline">
              {decodeURIComponent(url.split("/").pop() ?? url)}
            </a>
          ) : (
            <p className="text-ink-mute">Nessun PDF caricato. I lettori potranno sfogliarlo e scaricarlo.</p>
          )}
        </div>
        <button type="button" className="btn btn-outline px-4 py-2 text-sm" disabled={busy} onClick={() => input.current?.click()}>
          {url ? "Sostituisci" : "Carica PDF"}
        </button>
        {url && (
          <button type="button" className="text-sm text-tomato-ink underline" onClick={() => setUrl("")}>
            Togli
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="application/pdf"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-tomato-ink">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Messaggio d'esito di un modulo. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-md border-2 px-4 py-3 font-semibold ${
        state.ok ? "border-forest bg-[#dce5d6] text-forest" : "border-tomato-ink bg-[#f6ddd3] text-tomato-ink"
      }`}
    >
      {state.message}
    </p>
  );
}
