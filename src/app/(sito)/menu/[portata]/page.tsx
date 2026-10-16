import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PollCard } from "@/components/interactive/PollCard";
import { Reveal } from "@/components/interactive/Reveal";
import { ArticleCardLarge, ArticleCardMedium, ArticleRow } from "@/components/site/ArticleCards";
import { DemoBadge, SectionHeading, courseStyle } from "@/components/site/bits";
import { CourseIcon } from "@/components/site/CourseIcon";
import { CourseRail, NextCourse } from "@/components/site/CourseRail";
import { getArticles, getGames, getIssues, getPolls, getPublishedSubmissions } from "@/lib/data";
import { formatMonth, formatShort } from "@/lib/format";
import { courseBySlug, courses, isCourseSlug, type Course } from "@/lib/site.config";
import type { Article, Issue } from "@/lib/types";

// La pagina attende il proprio indirizzo prima di mostrarsi: così un indirizzo
// sbagliato risponde con un vero «pagina non trovata».
export const instant = false;

export function generateStaticParams() {
  return courses.map((c) => ({ portata: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/menu/[portata]">): Promise<Metadata> {
  const { portata } = await params;
  if (!isCourseSlug(portata)) return {};
  const c = courseBySlug[portata];
  return { title: `${c.course} · ${c.section}`, description: c.description };
}

export default async function CoursePage({ params, searchParams }: PageProps<"/menu/[portata]">) {
  const { portata } = await params;
  if (!isCourseSlug(portata)) notFound();
  const course = courseBySlug[portata];
  const index = courses.findIndex((c) => c.slug === portata);

  return (
    <div style={courseStyle(course.slug)}>
      {/* Intestazione della rubrica */}
      <header className="relative overflow-hidden" style={{ background: course.wash }}>
        <CourseIcon
          course={course.slug}
          className="pointer-events-none absolute -right-10 -bottom-16 size-[22rem] opacity-[0.09] sm:size-[30rem]"
          strokeWidth={0.8}
        />
        <div className="relative mx-auto max-w-[88rem] px-4 pt-12 pb-10 sm:px-6 sm:pt-16">
          <p className="kicker text-ink-soft">
            Portata {index + 1} di {courses.length} <span className="mx-2">·</span> {course.pages} del giornale stampato
          </p>
          <h1 className="mt-4">
            <span className="font-display-wonk animate-rise block text-[clamp(4.5rem,16vw,12rem)] leading-[0.8] italic" style={{ color: course.ink }}>
              {course.course}
            </span>
            <span className="animate-rise mt-3 block text-3xl font-semibold tracking-tight sm:text-5xl" style={{ animationDelay: "120ms" }}>
              {course.section}
            </span>
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl" style={{ animationDelay: "200ms" }}>
            {course.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <div className="border-b border-ink py-6">
          <CourseRail current={course.slug} />
        </div>

        <Suspense fallback={<ListSkeleton />}>
          <CourseArticles course={course} searchParams={searchParams} />
        </Suspense>

        {course.slug === "contorno" && <ReaderQuestions />}
        {course.slug === "caffe" && <CoffeeCorner />}

        <div className="mt-20">
          <NextCourse current={course.slug} />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2" aria-hidden>
      <div className="aspect-[3/2] animate-pulse rounded bg-paper-2" />
      <div className="aspect-[3/2] animate-pulse rounded bg-paper-2" />
    </div>
  );
}

async function CourseArticles({ course, searchParams }: { course: Course; searchParams: PageProps<"/menu/[portata]">["searchParams"] }) {
  const sp = await searchParams;
  const numero = typeof sp.numero === "string" ? Number(sp.numero) : null;
  const issues = await getIssues();
  const selected: Issue | undefined = numero !== null ? issues.find((i) => i.number === numero) : undefined;
  const articles = await getArticles({ course: course.slug, issueId: selected?.id });

  return (
    <section aria-label={`Articoli di ${course.section}`} className="mt-8">
      {issues.length > 1 && (
        <div className="mb-10 flex flex-wrap items-center gap-2" role="group" aria-label="Filtra per numero">
          <span className="kicker mr-2 text-ink-mute">Numero</span>
          <FilterChip href={`/menu/${course.slug}`} active={!selected}>
            Tutti
          </FilterChip>
          {issues.map((i) => (
            <FilterChip key={i.id} href={`/menu/${course.slug}?numero=${i.number}`} active={selected?.id === i.id}>
              {i.number === 0 ? "Zero" : `N. ${i.number}`} · {formatMonth(i.month)}
            </FilterChip>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-ink/20 px-6 py-16 text-center">
          <p className="font-display text-3xl">Questa portata è ancora in cucina.</p>
          <p className="mt-2 text-ink-soft">Gli articoli compariranno qui appena la redazione li pubblicherà.</p>
        </div>
      ) : course.slug === "dessert" ? (
        <LiteraryList articles={articles} />
      ) : (
        <ArticleGrid articles={articles} />
      )}
    </section>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-ink text-paper" : "shadow-[inset_0_0_0_1.5px_var(--color-rule)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

function ArticleGrid({ articles }: { articles: Article[] }) {
  const [first, second, ...rest] = articles;
  const cards = rest.slice(0, 6);
  const list = rest.slice(6);
  return (
    <>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className={second ? "lg:col-span-7" : "lg:col-span-8"}>
          <ArticleCardLarge article={first} aspect="aspect-[3/2]" sizes="(min-width: 1024px) 55vw, 100vw" priority />
        </div>
        {second && (
          <div className="lg:col-span-5 lg:border-l lg:border-rule lg:pl-12">
            <ArticleCardMedium article={second} sizes="(min-width: 1024px) 38vw, 100vw" />
          </div>
        )}
      </div>
      {cards.length > 0 && (
        <Reveal className="mt-16 grid gap-x-8 gap-y-12 border-t border-ink pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((a) => (
            <ArticleCardMedium key={a.id} article={a} />
          ))}
        </Reveal>
      )}
      {list.length > 0 && (
        <div className="mt-14 max-w-3xl">
          {list.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  );
}

/** La Terza Pagina si legge come un indice di libro, non come una vetrina. */
function LiteraryList({ articles }: { articles: Article[] }) {
  return (
    <ol className="divide-y divide-ink/15 border-y border-ink">
      {articles.map((a, i) => (
        <li key={a.id}>
          <Link href={`/articoli/${a.slug}`} className="group grid gap-4 py-8 sm:grid-cols-[4rem_1fr_10rem] sm:items-center sm:gap-8">
            <span className="font-display text-4xl text-[var(--accent)]">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="font-display-wonk block text-4xl leading-tight italic transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl">
                {a.title}
              </span>
              {a.subtitle && <span className="mt-2 block max-w-2xl text-ink-soft">{a.subtitle}</span>}
              <span className="mt-3 flex items-center gap-3 text-sm text-ink-mute">
                {a.author_name} · {formatShort(a.published_at)}
                {a.is_demo && <DemoBadge />}
              </span>
            </span>
            {a.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.cover_image} alt="" className="hidden aspect-square w-full rounded-sm object-cover grayscale transition duration-700 group-hover:grayscale-0 sm:block" loading="lazy" />
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}

async function ReaderQuestions() {
  const questions = (await getPublishedSubmissions()).filter((s) => s.kind === "domanda");
  return (
    <Reveal as="section" className="mt-20" aria-labelledby="domande">
      <SectionHeading id="domande" index="La Piazza" kicker="Domande dei lettori" title="Avete chiesto, rispondiamo" />
      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
        {questions.map((q) => (
          <article key={q.id} className="border-t-4 border-[var(--accent)] pt-5">
            <h3 className="font-display text-2xl leading-snug">{q.title ?? "Domanda"}</h3>
            <p className="mt-2 text-ink-soft italic">«{q.message}»</p>
            <p className="kicker mt-2 text-ink-mute">
              {q.signature ?? "Lettera non firmata"} {q.is_demo && <DemoBadge className="ml-2" />}
            </p>
            {q.answer && (
              <p className="mt-4 leading-relaxed">
                <span className="font-semibold">La redazione risponde. </span>
                {q.answer}
              </p>
            )}
          </article>
        ))}
        <div className="flex flex-col justify-center rounded-md bg-ink p-8 text-paper">
          <p className="font-display text-3xl leading-tight">C&apos;è una notizia che non ti è chiara?</p>
          <p className="mt-3 text-paper/80">Scrivi la tua domanda: la redazione cerca fonti affidabili e risponde nel numero successivo.</p>
          <Link href="/scrivi?tipo=domanda" className="btn mt-6 self-start bg-paper text-ink hover:bg-saffron">
            Fai una domanda
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

async function CoffeeCorner() {
  const [polls, games, posts] = await Promise.all([getPolls(), getGames(), getPublishedSubmissions()]);
  const letters = posts.filter((p) => p.kind === "lettera");
  return (
    <>
      <Reveal as="section" className="mt-20" aria-labelledby="giochi">
        <SectionHeading id="giochi" index="Caffè" kicker="Giochi" title="Una pausa per la testa" />
        {games.length === 0 ? (
          <p className="text-ink-soft">I giochi del mese arriveranno presto.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Link key={g.id} href={`/giochi/${g.id}`} className="group relative overflow-hidden rounded-md bg-ink p-7 text-paper transition hover:-translate-y-1">
                <span className="kicker text-saffron">{g.kind === "crossword" ? "Cruciverba" : "Quiz"}</span>
                <span className="font-display mt-3 block text-3xl leading-tight">{g.title}</span>
                {g.intro && <span className="mt-3 block text-paper/75">{g.intro}</span>}
                <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                  Gioca ora <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
                {g.is_demo && <DemoBadge className="absolute top-6 right-6 text-paper/60" />}
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal as="section" className="mt-20" aria-labelledby="sondaggi">
        <SectionHeading id="sondaggi" index="Caffè" kicker="Sondaggi" title="Dite la vostra" />
        {polls.length === 0 ? (
          <p className="text-ink-soft">Nessun sondaggio aperto in questo momento.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {polls.map((p, i) => (
              <PollCard key={p.id} poll={p} tone={i === 0 ? "dark" : "light"} />
            ))}
          </div>
        )}
      </Reveal>

      <Reveal as="section" className="mt-20" aria-labelledby="posta">
        <SectionHeading
          id="posta"
          index="Caffè"
          kicker="La posta"
          title="Lettere alla redazione"
          action={
            <Link href="/scrivi?tipo=lettera" className="btn btn-ink">
              Scrivi una lettera
            </Link>
          }
        />
        {letters.length === 0 ? (
          <p className="text-ink-soft">Ancora nessuna lettera pubblicata. Scrivi tu la prima!</p>
        ) : (
          <div className="columns-1 gap-8 md:columns-2">
            {letters.map((l) => (
              <article key={l.id} className="mb-8 break-inside-avoid rounded-md bg-paper-2 p-7">
                {l.title && <h3 className="font-display text-2xl">{l.title}</h3>}
                <p className="font-display mt-3 text-lg leading-relaxed italic">«{l.message}»</p>
                <p className="kicker mt-3 text-ink-mute">
                  {l.signature ?? "Lettera non firmata"} {l.is_demo && <DemoBadge className="ml-2" />}
                </p>
                {l.answer && (
                  <p className="mt-4 border-t border-rule pt-4 text-ink-soft">
                    <span className="font-semibold text-ink">Risponde la redazione. </span>
                    {l.answer}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </Reveal>
    </>
  );
}
