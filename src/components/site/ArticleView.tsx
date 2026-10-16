import Link from "next/link";
import { PrintButton, ReadingProgress, ShareButton } from "@/components/interactive/ReadingTools";
import { formatDay, issueLabel, readingMinutes } from "@/lib/format";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { courseBySlug } from "@/lib/site.config";
import type { Article, FieldToPlate, Issue } from "@/lib/types";
import { CourseTag, DemoBadge, courseStyle } from "./bits";
import { CourseIcon } from "./CourseIcon";
import { FieldPath } from "./FieldToPlate";
import { Picture } from "./Picture";

/**
 * Pagina di lettura di un articolo. Usata dal sito pubblico e dall'anteprima
 * della redazione, così ciò che si vede in anteprima è ciò che si pubblica.
 */
export function ArticleView({ article, issue, preview = false }: { article: Article; issue: Issue | null; preview?: boolean }) {
  const course = courseBySlug[article.course];
  const x = article.course === "secondo" ? article.extra : null;
  const html = sanitizeArticleHtml(article.body);

  return (
    <article style={courseStyle(article.course)}>
      {!preview && <ReadingProgress color={course.color} />}

      <header className="mx-auto max-w-[88rem] px-4 pt-8 sm:px-6 sm:pt-14">
        <nav aria-label="Percorso" className="kicker flex flex-wrap items-center gap-2 text-ink-mute">
          <Link href="/" className="hover:text-ink">
            Prima pagina
          </Link>
          <span aria-hidden>/</span>
          <CourseTag course={article.course} icon />
          {issue && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/numeri/${issue.number}`} className="hover:text-ink">
                {issueLabel(issue)}
              </Link>
            </>
          )}
        </nav>

        <div className="mx-auto mt-10 max-w-5xl text-center">
          {article.is_demo && <DemoBadge />}
          <h1 className="font-display animate-rise mt-4 text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.95] font-medium text-balance">
            {article.title}
          </h1>
          {article.subtitle && (
            <p
              className="font-display animate-rise mx-auto mt-6 max-w-3xl text-xl leading-snug text-ink-soft italic text-balance sm:text-2xl"
              style={{ animationDelay: "100ms" }}
            >
              {article.subtitle}
            </p>
          )}
          <div className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3" style={{ animationDelay: "180ms" }}>
            <div className="flex items-center gap-3 text-left">
              <span
                aria-hidden
                className="font-display flex size-11 items-center justify-center rounded-full text-xl text-paper"
                style={{ background: course.ink }}
              >
                {article.author_name.charAt(0)}
              </span>
              <span>
                <span className="block text-sm text-ink-mute">A cura di</span>
                <span className="block font-semibold">{article.author_name}</span>
              </span>
            </div>
            <span className="hidden h-8 w-px bg-rule sm:block" />
            <p className="text-sm text-ink-soft">
              {article.published_at && <time dateTime={article.published_at}>{formatDay(article.published_at)}</time>}
              <span className="mx-2 text-ink-mute">·</span>
              {readingMinutes(article.body)} min di lettura
            </p>
            {!preview && <ShareButton title={article.title} text={article.subtitle ?? undefined} />}
          </div>
          {article.author_role && <p className="kicker mt-4 text-ink-mute">{article.author_role}</p>}
        </div>
      </header>

      {x ? (
        <FieldToPlateHero article={article} x={x} />
      ) : (
        article.cover_image && (
          <figure className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-paper-3 sm:aspect-[16/9]">
              <Picture src={article.cover_image} alt={article.cover_alt ?? ""} sizes="(min-width: 1152px) 1152px, 100vw" priority />
            </div>
            {(article.cover_alt || article.cover_credit) && (
              <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-sm text-ink-mute">
                <span>{article.cover_alt}</span>
                {article.cover_credit && <span className="kicker">{article.cover_credit}</span>}
              </figcaption>
            )}
          </figure>
        )
      )}

      <div className="mx-auto mt-14 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,40rem)_1fr]">
        <aside className="hidden lg:block" aria-hidden>
          <div className="sticky top-28 flex flex-col items-end gap-3 pr-4 text-right">
            <CourseIcon course={article.course} className="size-12" strokeWidth={1.2} />
            <p className="font-display text-2xl italic" style={{ color: course.ink }}>
              {course.course}
            </p>
            <p className="kicker text-ink-mute">{course.section}</p>
          </div>
        </aside>
        <div id="testo-articolo" className="prose-pap mx-auto w-full" dangerouslySetInnerHTML={{ __html: html }} />
        <div />
      </div>

      {x && <RecipeAndField x={x} />}

      <footer className="mx-auto mt-16 max-w-[40rem] px-4 sm:px-0">
        <div className="flex items-center justify-center gap-3 text-[var(--accent)]" aria-hidden>
          <span className="h-px w-16 bg-current" />
          <CourseIcon course={article.course} className="size-6" />
          <span className="h-px w-16 bg-current" />
        </div>
        {article.is_demo && (
          <p className="mt-8 rounded-md bg-paper-2 p-4 text-sm text-ink-soft">
            <strong>Contenuto dimostrativo.</strong> Questo testo è un esempio preparato per mostrare l&apos;impaginazione del giornale: non
            racconta fatti reali. La redazione può rimuoverlo dall&apos;area riservata.
          </p>
        )}
      </footer>
    </article>
  );
}

function FieldToPlateHero({ article, x }: { article: Article; x: FieldToPlate }) {
  return (
    <section className="mt-12 bg-forest py-10 text-paper sm:py-14" aria-label="Dal campo al piatto">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <figure>
          <p className="kicker mb-3 text-saffron">Il campo · {x.ingredient}</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Picture src={x.field_image} alt={x.field_image_alt} sizes="(min-width: 1024px) 45vw, 100vw" priority />
          </div>
          <figcaption className="mt-2 text-sm text-paper/70">{x.field_class}</figcaption>
        </figure>
        <div className="flex items-center justify-center gap-3 text-saffron lg:flex-col">
          <FieldPath className="hidden h-40 w-10 lg:block" />
          <span className="kicker lg:[writing-mode:vertical-rl]">dal campo al piatto</span>
        </div>
        <figure>
          <p className="kicker mb-3 text-saffron">Il piatto · {x.recipe_title}</p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Picture src={x.plate_image ?? article.cover_image} alt={x.plate_image_alt} sizes="(min-width: 1024px) 45vw, 100vw" priority />
          </div>
          <figcaption className="mt-2 text-sm text-paper/70">{x.kitchen_class}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function RecipeAndField({ x }: { x: FieldToPlate }) {
  return (
    <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-5" aria-label="Schede">
      <div className="rounded-md bg-sage/25 p-7 lg:col-span-2">
        <p className="kicker text-sage-ink">Scheda dal campo · Agrario</p>
        <h2 className="font-display-wonk mt-3 text-5xl italic">{x.ingredient}</h2>
        <p className="font-display mt-1 text-lg italic text-ink-soft">{x.scientific_name}</p>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="kicker text-ink-mute">Stagione</dt>
            <dd className="mt-1">{x.season}</dd>
          </div>
          <div>
            <dt className="kicker text-ink-mute">Dove cresce</dt>
            <dd className="mt-1">{x.origin}</dd>
          </div>
          {x.field_notes && (
            <div>
              <dt className="kicker text-ink-mute">Note di coltivazione</dt>
              <dd className="mt-1 leading-relaxed">{x.field_notes}</dd>
            </div>
          )}
        </dl>
        <p className="mt-6 text-sm text-ink-mute">A cura di {x.field_class}</p>
      </div>

      <div className="rounded-md bg-paper p-7 shadow-[0_0_0_1.5px_var(--color-ink)] lg:col-span-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kicker text-tomato-ink">La ricetta · Alberghiero</p>
            <h2 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">{x.recipe_title}</h2>
          </div>
          <PrintButton />
        </div>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-y border-rule py-3 text-sm">
          <div className="flex gap-2">
            <dt className="text-ink-mute">Persone</dt>
            <dd className="font-semibold">{x.servings}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-mute">Tempo</dt>
            <dd className="font-semibold">{x.time}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-mute">Difficoltà</dt>
            <dd className="font-semibold">{x.difficulty}</dd>
          </div>
        </dl>
        <div className="mt-6 grid gap-8 sm:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h3 className="kicker mb-3 text-ink-mute">Ingredienti</h3>
            <ul className="space-y-2">
              {x.ingredients.map((i) => (
                <li key={i} className="flex gap-3 border-b border-dotted border-rule pb-2">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-tomato" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="kicker mb-3 text-ink-mute">Procedimento</h3>
            <ol className="space-y-4">
              {x.steps.map((s, n) => (
                <li key={n} className="flex gap-4">
                  <span className="font-display text-3xl leading-none text-tomato">{n + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-mute">A cura di {x.kitchen_class}</p>
      </div>
    </section>
  );
}
