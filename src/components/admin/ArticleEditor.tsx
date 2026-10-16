"use client";
import Link from "next/link";
import { useState } from "react";
import { saveArticle } from "@/app/redazione/actions";
import { courseBySlug, courses } from "@/lib/site.config";
import type { Article, CourseSlug, FieldToPlate, Issue } from "@/lib/types";
import { FormMessage, ImageField, useFormAction, useUnsavedWarning } from "./controls";
import { RichEditor } from "./RichEditor";
import { Field, inputClass } from "./ui";

export type ArticleDraft = Partial<Article> & { from_submission?: string };

const emptyExtra: FieldToPlate = {
  ingredient: "",
  scientific_name: "",
  season: "",
  origin: "",
  field_notes: "",
  field_class: "",
  field_image: null,
  field_image_alt: "",
  recipe_title: "",
  servings: "",
  time: "",
  difficulty: "",
  ingredients: [],
  steps: [],
  kitchen_class: "",
  plate_image: null,
  plate_image_alt: "",
};

export function ArticleEditor({ article, issues }: { article: ArticleDraft; issues: Issue[] }) {
  const { state, pending, intent, onSubmit } = useFormAction(saveArticle);
  const [dirty, setDirty] = useState(false);
  const [course, setCourse] = useState<CourseSlug>(article.course ?? "primo");
  useUnsavedWarning(dirty && !pending);
  const e = state.errors ?? {};
  const isNew = !article.id;
  const published = article.status === "published";
  const extra = article.extra ?? emptyExtra;
  const c = courseBySlug[course];
  const markDirty = () => setDirty(true);

  return (
    <form
      onSubmit={(ev) => {
        setDirty(false);
        onSubmit(ev);
      }}
      onChange={markDirty}
      noValidate
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      {article.id && <input type="hidden" name="id" value={article.id} />}
      {article.from_submission && <input type="hidden" name="from_submission" value={article.from_submission} />}
      <input type="hidden" name="status" value={article.status ?? "draft"} />

      <div className="min-w-0 space-y-6">
        <FormMessage state={state} />
        <div>
          <label htmlFor="title" className="kicker mb-2 block text-ink-mute">
            Titolo
          </label>
          <textarea
            id="title"
            name="title"
            rows={2}
            required
            maxLength={300}
            defaultValue={article.title}
            placeholder="Un titolo che faccia venire fame di leggere"
            aria-invalid={!!e.title}
            className="font-display w-full resize-none border-0 border-b-2 border-ink/20 bg-transparent pb-2 text-4xl leading-tight outline-none placeholder:text-ink/25 focus:border-tomato aria-[invalid=true]:border-tomato-ink sm:text-5xl"
          />
          {e.title && <p className="mt-1 text-sm font-semibold text-tomato-ink">{e.title}</p>}
        </div>
        <Field id="subtitle" label="Sottotitolo" optional>
          <textarea
            id="subtitle"
            name="subtitle"
            rows={2}
            maxLength={400}
            defaultValue={article.subtitle ?? ""}
            className={`${inputClass} font-display text-xl italic`}
          />
        </Field>
        <div>
          <p className="mb-1.5 font-semibold" id="body-label">
            Testo
          </p>
          <RichEditor
            name="body"
            label="Testo dell'articolo"
            initialHtml={article.body ?? ""}
            onDirty={markDirty}
            placeholder="Scrivi qui l'articolo. Usa i titoletti per dividere i paragrafi lunghi e le citazioni per mettere in evidenza una frase."
          />
        </div>
        <Field id="excerpt" label="Riassunto per le anteprime" optional hint="Due righe che compaiono nelle liste e quando si condivide il link. Se lo lasci vuoto useremo l'inizio del testo.">
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={400} defaultValue={article.excerpt ?? ""} className={inputClass} />
        </Field>

        {course === "secondo" && (
          <fieldset className="space-y-5 rounded-md border-2 p-5 sm:p-6" style={{ borderColor: c.color }}>
            <legend className="kicker px-2" style={{ color: c.ink }}>
              Scheda «Dal campo al piatto»
            </legend>
            <p className="text-sm text-ink-soft">
              Questi campi compongono la pagina speciale: a sinistra il campo (agraria), a destra il piatto (cucina).
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="x_ingredient" label="Ingrediente protagonista">
                <input id="x_ingredient" name="x_ingredient" defaultValue={extra.ingredient} className={inputClass} placeholder="Castagna" />
              </Field>
              <Field id="x_scientific_name" label="Nome scientifico" optional>
                <input id="x_scientific_name" name="x_scientific_name" defaultValue={extra.scientific_name} className={inputClass} placeholder="Castanea sativa" />
              </Field>
              <Field id="x_season" label="Stagione">
                <input id="x_season" name="x_season" defaultValue={extra.season} className={inputClass} placeholder="Da fine settembre a novembre" />
              </Field>
              <Field id="x_origin" label="Provenienza">
                <input id="x_origin" name="x_origin" defaultValue={extra.origin} className={inputClass} placeholder="Boschi della bassa Valsesia" />
              </Field>
            </div>
            <Field id="x_field_notes" label="Dal campo: note di coltivazione o raccolta">
              <textarea id="x_field_notes" name="x_field_notes" rows={4} defaultValue={extra.field_notes} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="x_field_class" label="Classe che ha curato il campo" optional>
                <input id="x_field_class" name="x_field_class" defaultValue={extra.field_class} className={inputClass} placeholder="Indirizzo agrario, 3ª" />
              </Field>
              <Field id="x_kitchen_class" label="Classe che ha curato il piatto" optional>
                <input id="x_kitchen_class" name="x_kitchen_class" defaultValue={extra.kitchen_class} className={inputClass} placeholder="Enogastronomia, 4ª" />
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageField
                name="x_field_image"
                altName="x_field_image_alt"
                label="Foto dal campo"
                initialUrl={extra.field_image}
                initialAlt={extra.field_image_alt}
                onChange={markDirty}
              />
              <ImageField
                name="x_plate_image"
                altName="x_plate_image_alt"
                label="Foto del piatto"
                initialUrl={extra.plate_image}
                initialAlt={extra.plate_image_alt}
                onChange={markDirty}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field id="x_recipe_title" label="Nome della ricetta" className="sm:col-span-4">
                <input id="x_recipe_title" name="x_recipe_title" defaultValue={extra.recipe_title} className={inputClass} />
              </Field>
              <Field id="x_servings" label="Porzioni">
                <input id="x_servings" name="x_servings" defaultValue={extra.servings} className={inputClass} placeholder="4 persone" />
              </Field>
              <Field id="x_time" label="Tempo">
                <input id="x_time" name="x_time" defaultValue={extra.time} className={inputClass} placeholder="1 ora" />
              </Field>
              <Field id="x_difficulty" label="Difficoltà" className="sm:col-span-2">
                <input id="x_difficulty" name="x_difficulty" defaultValue={extra.difficulty} className={inputClass} placeholder="Media" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="x_ingredients" label="Ingredienti" hint="Uno per riga.">
                <textarea id="x_ingredients" name="x_ingredients" rows={7} defaultValue={extra.ingredients.join("\n")} className={inputClass} />
              </Field>
              <Field id="x_steps" label="Procedimento" hint="Un passaggio per riga.">
                <textarea id="x_steps" name="x_steps" rows={7} defaultValue={extra.steps.join("\n")} className={inputClass} />
              </Field>
            </div>
          </fieldset>
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-ink)]">
          <p className="kicker text-ink-mute">
            Stato: <strong className="text-ink">{isNew ? "nuovo" : published ? "pubblicato" : "bozza"}</strong>
          </p>
          <div className="mt-4 grid gap-2">
            {published ? (
              <>
                <button type="submit" name="intent" value="save" disabled={pending} className="btn btn-ink">
                  {pending && intent === "save" ? "Salvataggio…" : "Aggiorna l'articolo"}
                </button>
                <button type="submit" name="intent" value="unpublish" disabled={pending} className="btn btn-outline">
                  {pending && intent === "unpublish" ? "Un momento…" : "Ritira (torna bozza)"}
                </button>
              </>
            ) : (
              <>
                <button type="submit" name="intent" value="publish" disabled={pending} className="btn btn-ink">
                  {pending && intent === "publish" ? "Pubblicazione…" : "Pubblica"}
                </button>
                <button type="submit" name="intent" value="save" disabled={pending} className="btn btn-outline">
                  {pending && intent === "save" ? "Salvataggio…" : "Salva bozza"}
                </button>
              </>
            )}
            {article.id && (
              <Link href={`/redazione/anteprima/${article.id}`} target="_blank" className="btn px-4 text-sm underline">
                Anteprima ↗
              </Link>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-mute" aria-live="polite">
            {dirty ? "Ci sono modifiche non salvate." : isNew ? "Non ancora salvato." : "Tutto salvato."}
          </p>
        </div>

        <div className="space-y-4 rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)]">
          <Field id="course" label="Portata (rubrica)" error={e.course}>
            <select
              id="course"
              name="course"
              value={course}
              onChange={(ev) => setCourse(ev.target.value as CourseSlug)}
              className={inputClass}
              aria-invalid={!!e.course}
            >
              {courses.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {x.course} · {x.section}
                </option>
              ))}
            </select>
          </Field>
          <Field id="issue_id" label="Numero del giornale" error={e.issue_id}>
            <select id="issue_id" name="issue_id" defaultValue={article.issue_id ?? ""} className={inputClass}>
              <option value="">Nessun numero (solo online)</option>
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.number === 0 ? "Numero zero" : `Numero ${i.number}`}
                  {i.title ? ` · ${i.title}` : ""}
                  {i.status === "draft" ? " (in preparazione)" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field id="author_name" label="Firma" hint="Nome e cognome solo con l'autorizzazione della scuola; altrimenti iniziali o «La redazione».">
            <input id="author_name" name="author_name" defaultValue={article.author_name ?? ""} maxLength={120} placeholder="La redazione" className={inputClass} />
          </Field>
          <Field id="author_role" label="Classe o ruolo" optional>
            <input id="author_role" name="author_role" defaultValue={article.author_role ?? ""} maxLength={120} placeholder="4ª A sala e vendita" className={inputClass} />
          </Field>
          <Field id="published_at" label="Data di pubblicazione" hint="Se la lasci vuota, useremo la data di oggi quando pubblichi.">
            <input id="published_at" name="published_at" type="date" defaultValue={article.published_at?.slice(0, 10) ?? ""} className={inputClass} />
          </Field>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="featured" defaultChecked={article.featured} className="mt-1 size-5 accent-[var(--color-ink)]" />
            <span>
              <span className="font-semibold">Articolo d&apos;apertura</span>
              <span className="block text-sm text-ink-mute">Compare in grande in prima pagina.</span>
            </span>
          </label>
        </div>

        <div className="space-y-4 rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)]">
          <ImageField
            name="cover_image"
            altName="cover_alt"
            label="Immagine di copertina"
            initialUrl={article.cover_image ?? null}
            initialAlt={article.cover_alt ?? null}
            altError={e.cover_alt}
            onChange={markDirty}
          />
          <Field id="cover_credit" label="Crediti della foto" optional>
            <input id="cover_credit" name="cover_credit" defaultValue={article.cover_credit ?? ""} maxLength={160} placeholder="Foto: classe 3ª B" className={inputClass} />
          </Field>
        </div>

        <details className="rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)]">
          <summary className="cursor-pointer font-semibold">Opzioni avanzate</summary>
          <Field id="slug" label="Indirizzo della pagina" className="mt-4" hint="Si crea da solo dal titolo. Cambialo solo se serve: i link già condivisi smetterebbero di funzionare.">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-ink-mute">/articoli/</span>
              <input id="slug" name="slug" defaultValue={article.slug ?? ""} maxLength={80} className={`${inputClass} py-1.5 text-sm`} />
            </div>
          </Field>
        </details>
      </aside>
    </form>
  );
}
