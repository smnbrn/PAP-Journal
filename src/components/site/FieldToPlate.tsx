import Link from "next/link";
import { Reveal } from "@/components/interactive/Reveal";
import type { Article } from "@/lib/types";
import { DemoBadge } from "./bits";
import { CourseIcon } from "./CourseIcon";
import { Picture } from "./Picture";

/**
 * Il percorso dal campo al piatto: un tracciato che si disegna mentre si
 * scorre la pagina e collega la pianta (agrario) alla ricetta (alberghiero).
 */
export function FieldPath({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 400" className={className} aria-hidden fill="none">
      <path
        className="draw-path"
        d="M60 10 C 10 80, 110 120, 60 200 S 10 320, 60 390"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Sezione della prima pagina dedicata alla doppia pagina centrale. */
export function FieldToPlateFeature({ article }: { article: Article }) {
  const x = article.extra!;
  return (
    <section aria-labelledby="campo-piatto" className="relative overflow-hidden bg-forest text-paper">
      <div className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-forest-2 opacity-60" />
      <div className="relative mx-auto max-w-[88rem] px-6 py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-paper/25 pb-6">
          <div>
            <p className="kicker text-saffron">Secondo · La doppia pagina centrale</p>
            <h2 id="campo-piatto" className="font-display-wonk mt-3 text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
              Dal campo <span className="italic text-saffron">al piatto</span>
            </h2>
          </div>
          <p className="max-w-sm text-paper/80">
            Ogni mese una pianta coltivata dall&apos;agrario diventa la ricetta dell&apos;alberghiero. Due indirizzi, una sola
            redazione.
          </p>
        </div>

        <Reveal className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          {/* IL CAMPO */}
          <article className="flex flex-col rounded-md bg-paper/[0.06] p-5 ring-1 ring-paper/15 sm:p-7">
            <p className="kicker flex items-center gap-2 text-saffron">
              <span className="inline-block size-2 rounded-full bg-saffron" /> Il campo · Agrario
            </p>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-sm">
              <Picture src={x.field_image} alt={x.field_image_alt} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <h3 className="font-display-wonk mt-6 text-5xl italic">{x.ingredient}</h3>
            <p className="font-display mt-1 text-lg text-paper/75 italic">{x.scientific_name}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-paper/20 pt-4 text-sm">
              <div>
                <dt className="kicker text-paper/60">Stagione</dt>
                <dd className="mt-1">{x.season}</dd>
              </div>
              <div>
                <dt className="kicker text-paper/60">Dove cresce</dt>
                <dd className="mt-1">{x.origin}</dd>
              </div>
            </dl>
            <p className="mt-auto pt-5 text-sm text-paper/70">A cura di {x.field_class}</p>
          </article>

          {/* IL PASSAGGIO */}
          <div className="flex items-center justify-center gap-4 text-saffron lg:flex-col">
            <CourseIcon course="secondo" className="size-10" />
            <FieldPath className="hidden h-64 w-12 lg:block" />
            <span className="kicker rotate-0 text-paper/70 lg:[writing-mode:vertical-rl]">diventa</span>
            <svg viewBox="0 0 40 40" className="size-8 rotate-90 lg:rotate-0" aria-hidden>
              <path d="M20 4v30M8 22l12 12 12-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* IL PIATTO */}
          <article className="flex flex-col rounded-md bg-paper p-5 text-ink sm:p-7">
            <p className="kicker flex items-center gap-2 text-tomato-ink">
              <span className="inline-block size-2 rounded-full bg-tomato" /> Il piatto · Alberghiero
            </p>
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-sm">
              <Picture src={x.plate_image ?? article.cover_image} alt={x.plate_image_alt} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <h3 className="font-display mt-6 text-3xl leading-tight sm:text-4xl">{x.recipe_title}</h3>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-rule pt-4 text-sm">
              <div>
                <dt className="kicker text-ink-mute">Persone</dt>
                <dd className="mt-1 font-semibold">{x.servings}</dd>
              </div>
              <div>
                <dt className="kicker text-ink-mute">Tempo</dt>
                <dd className="mt-1 font-semibold">{x.time}</dd>
              </div>
              <div>
                <dt className="kicker text-ink-mute">Difficoltà</dt>
                <dd className="mt-1 font-semibold">{x.difficulty}</dd>
              </div>
            </dl>
            <p className="mt-auto pt-5 text-sm text-ink-mute">A cura di {x.kitchen_class}</p>
          </article>
        </Reveal>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {article.is_demo && <DemoBadge className="text-paper/70" />}
            <p className="font-display text-xl italic text-paper/90">{article.title}</p>
          </div>
          <Link href={`/articoli/${article.slug}`} className="btn bg-saffron text-ink hover:bg-paper">
            Leggi la doppia pagina →
          </Link>
        </div>
      </div>
    </section>
  );
}
