"use client";
import { saveIssue } from "@/app/redazione/actions";
import type { Issue } from "@/lib/types";
import { FormMessage, ImageField, PdfField, useFormAction } from "./controls";
import { Field, inputClass } from "./ui";

export function IssueEditor({ issue }: { issue: Partial<Issue> }) {
  const { state, pending, onSubmit } = useFormAction(saveIssue);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {issue.id && <input type="hidden" name="id" value={issue.id} />}
      <div className="min-w-0 space-y-6">
        <FormMessage state={state} />
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr_12rem]">
          <Field id="number" label="Numero" error={e.number} hint="0 = numero zero">
            <input id="number" name="number" type="number" min={0} max={99} required defaultValue={issue.number ?? ""} aria-invalid={!!e.number} className={inputClass} />
          </Field>
          <Field id="title" label="Titolo del numero" optional>
            <input id="title" name="title" defaultValue={issue.title ?? ""} maxLength={200} placeholder="Il numero del pane" className={inputClass} />
          </Field>
          <Field id="month" label="Mese di uscita" error={e.month}>
            <input id="month" name="month" type="month" required defaultValue={issue.month?.slice(0, 7) ?? ""} aria-invalid={!!e.month} className={inputClass} />
          </Field>
        </div>
        <Field id="editorial" label="Presentazione del numero" optional hint="Poche righe che introducono il numero nell'archivio.">
          <textarea id="editorial" name="editorial" rows={6} maxLength={3000} defaultValue={issue.editorial ?? ""} className={inputClass} />
        </Field>
        <PdfField name="pdf_url" initialUrl={issue.pdf_url ?? null} />
      </div>
      <aside className="space-y-6">
        <div className="space-y-4 rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-ink)]">
          <fieldset>
            <legend className="mb-2 font-semibold">Visibilità</legend>
            <label className="flex items-start gap-3 py-1">
              <input type="radio" name="status" value="draft" defaultChecked={issue.status !== "published"} className="mt-1 size-4 accent-[var(--color-ink)]" />
              <span>
                In preparazione
                <span className="block text-sm text-ink-mute">Il numero e i suoi articoli restano nascosti.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 py-1">
              <input type="radio" name="status" value="published" defaultChecked={issue.status === "published"} className="mt-1 size-4 accent-[var(--color-ink)]" />
              <span>
                Pubblicato
                <span className="block text-sm text-ink-mute">Compare nell&apos;archivio con gli articoli pubblicati.</span>
              </span>
            </label>
          </fieldset>
          <Field id="published_at" label="Data di uscita" optional>
            <input id="published_at" name="published_at" type="date" defaultValue={issue.published_at?.slice(0, 10) ?? ""} className={inputClass} />
          </Field>
          <button type="submit" disabled={pending} className="btn btn-ink w-full">
            {pending ? "Salvataggio…" : "Salva il numero"}
          </button>
        </div>
        <div className="rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)]">
          <ImageField name="cover_image" altName="cover_alt" label="Copertina" initialUrl={issue.cover_image ?? null} initialAlt={issue.cover_alt ?? null} />
        </div>
      </aside>
    </form>
  );
}
