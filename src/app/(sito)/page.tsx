import Link from "next/link";
import { PollCard } from "@/components/interactive/PollCard";
import { Reveal } from "@/components/interactive/Reveal";
import { ArticleCardLarge, ArticleCardMedium, ArticleIndexItem, ArticleRow } from "@/components/site/ArticleCards";
import { ArrowLink, Byline, CourseTag, DemoBadge, SectionHeading, courseStyle } from "@/components/site/bits";
import { CourseIcon, WheatMark } from "@/components/site/CourseIcon";
import { FieldToPlateFeature } from "@/components/site/FieldToPlate";
import { IssueCover, PlannedCover } from "@/components/site/IssueCover";
import { MenuBoard, type BoardPreview } from "@/components/site/MenuBoard";
import { Picture } from "@/components/site/Picture";
import {
  getArticles,
  getCourseCounts,
  getCurrentIssue,
  getGames,
  getIssues,
  getLatestByCourse,
  getPolls,
  getPublishedSubmissions,
  getSettings,
} from "@/lib/data";
import { formatMonth, stripHtml } from "@/lib/format";
import { courseBySlug, courses, editorialCalendar } from "@/lib/site.config";
import type { Article, CourseSlug } from "@/lib/types";

function pullQuote(article: Article) {
  const match = article.body.match(/<blockquote>([\s\S]*?)<\/blockquote>/);
  if (match) return stripHtml(match[1]);
  const firstStanza = article.body.match(/<p>([\s\S]*?)<\/p>/);
  return firstStanza ? stripHtml(firstStanza[1].replace(/<br\s*\/?>/g, " / ")) : (article.excerpt ?? "");
}

export default async function HomePage() {
  const [settings, issue, issues, latest, counts, polls, games, letters] = await Promise.all([
    getSettings(),
    getCurrentIssue(),
    getIssues(),
    getLatestByCourse(),
    getCourseCounts(),
    getPolls(),
    getGames(),
    getPublishedSubmissions(),
  ]);
  const inIssue = await getArticles(issue ? { issueId: issue.id } : { limit: 30 });
  const all = inIssue.length ? inIssue : await getArticles({ limit: 30 });

  const cover =
    all.find((a) => a.featured && a.course === "aperitivo") ?? all.find((a) => a.featured) ?? all[0] ?? null;
  const fieldToPlate =
    all.find((a) => a.course === "secondo" && a.extra) ?? (latest.secondo?.extra ? latest.secondo : null);
  const dessert = all.find((a) => a.course === "dessert" && a.featured) ?? all.find((a) => a.course === "dessert");
  const used = new Set([cover?.id, fieldToPlate?.id, dessert?.id]);
  const rest = all.filter((a) => !used.has(a.id));
  const big = rest.find((a) => a.featured) ?? rest[0];
  const mediums = rest.filter((a) => a !== big).slice(0, 2);
  const feed = rest.filter((a) => a !== big && !mediums.includes(a)).slice(0, 5);
  const order = (a: Article) => courses.findIndex((c) => c.slug === a.course);
  const inThisIssue = all
    .filter((a) => a.id !== cover?.id)
    .sort((a, b) => order(a) - order(b))
    .slice(0, 4);

  const previews: Partial<Record<CourseSlug, BoardPreview>> = {};
  for (const [course, a] of Object.entries(latest)) {
    previews[course as CourseSlug] = {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      image: a.cover_image,
      alt: a.cover_alt ?? "",
    };
  }

  const poll = polls.find((p) => p.status === "open") ?? polls[0];
  const questions = letters.filter((l) => l.kind === "domanda").slice(0, 2);
  const crossword = games.find((g) => g.kind === "crossword");
  const quiz = games.find((g) => g.kind === "quiz");
  const publishedNumbers = new Map(issues.map((i) => [i.number, i]));
  const extraIssues = issues.filter((i) => !editorialCalendar.some((c) => c.number === i.number));

  return (
    <>
      {/* ═══ TESTATA ═══ */}
      <section className="mx-auto max-w-[88rem] px-4 pt-6 sm:px-6 sm:pt-10" aria-label="Testata">
        <div className="rule-double" />
        <div className="kicker flex flex-wrap items-center justify-between gap-2 border-b border-ink py-2 text-ink-soft">
          <span>Anno scolastico {settings.school_year}</span>
          <span className="hidden sm:inline">
            {settings.school_name} · {settings.school_sites}
          </span>
          <span>
            {issue ? `${issue.number === 0 ? "Numero zero" : `N. ${issue.number}`} · ${formatMonth(issue.month)}` : "In preparazione"}
          </span>
        </div>
        <div className="animate-rise py-8 text-center sm:py-12">
          <WheatMark className="mx-auto mb-3 h-9 w-9 text-tomato sm:h-11 sm:w-11" />
          <h1 className="font-display-wonk text-[clamp(3.6rem,15vw,13.5rem)] leading-[0.82] font-medium tracking-[-0.045em]">
            {settings.masthead}
          </h1>
          <p className="font-display mt-4 text-xl italic text-ink-soft sm:text-3xl">{settings.tagline}</p>
        </div>
        <nav aria-label="Le sei portate" className="scroll-rail -mx-4 flex gap-1 overflow-x-auto border-y border-ink px-4 sm:mx-0 sm:justify-between sm:px-0">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/menu/${c.slug}`}
              className="group flex shrink-0 items-center gap-2 px-3 py-3 transition-colors hover:bg-ink hover:text-paper sm:px-4"
            >
              <CourseIcon course={c.slug} className="size-6 transition-transform group-hover:-rotate-6" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg italic">{c.course}</span>
                <span className="kicker text-[0.62rem] opacity-70">{c.section}</span>
              </span>
            </Link>
          ))}
        </nav>
      </section>

      {/* ═══ APERTURA ═══ */}
      {cover ? (
        <section className="mx-auto mt-10 max-w-[88rem] px-4 sm:mt-14 sm:px-6" aria-labelledby="apertura" style={courseStyle(cover.course)}>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <Link href={`/articoli/${cover.slug}`} className="img-zoom relative block aspect-[4/3] overflow-hidden rounded-sm bg-paper-3 lg:col-span-7" tabIndex={-1} aria-hidden>
              <Picture src={cover.cover_image} alt="" sizes="(min-width: 1024px) 58vw, 100vw" priority />
            </Link>
            <div className="flex flex-col lg:col-span-5">
              <div className="flex flex-wrap items-center gap-3">
                <CourseTag course={cover.course} icon />
                {cover.is_demo && <DemoBadge />}
              </div>
              <h2 id="apertura" className="font-display mt-4 text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] font-medium">
                <Link href={`/articoli/${cover.slug}`} className="link-underline">
                  {cover.title}
                </Link>
              </h2>
              {cover.subtitle && <p className="font-display mt-5 text-xl leading-snug text-ink-soft italic sm:text-2xl">{cover.subtitle}</p>}
              <div className="mt-6">
                <Byline article={cover} showReading />
              </div>
              <div className="mt-6">
                <Link href={`/articoli/${cover.slug}`} className="btn btn-ink">
                  Leggi l&apos;articolo
                </Link>
              </div>
              {inThisIssue.length > 0 && (
                <div className="mt-auto pt-10">
                  <p className="kicker mb-2 border-b border-ink pb-2 text-ink-mute">In questo numero</p>
                  <ol>
                    {inThisIssue.map((a, i) => (
                      <ArticleIndexItem key={a.id} article={a} n={i + 1} />
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto mt-14 max-w-3xl px-6 text-center">
          <p className="font-display text-3xl">La prima pagina è ancora in preparazione.</p>
          <p className="mt-3 text-ink-soft">Quando la redazione pubblicherà i primi articoli, compariranno qui.</p>
        </section>
      )}

      {/* ═══ IL MENÙ ═══ */}
      <Reveal as="section" className="mx-auto mt-24 max-w-[88rem] px-4 sm:px-6" aria-labelledby="menu-numero">
        <SectionHeading
          id="menu-numero"
          index="Il menù"
          kicker={issue ? `del ${issue.number === 0 ? "numero zero" : `numero ${issue.number}`}` : undefined}
          title={
            <>
              Sei portate, <span className="italic">un giornale</span>
            </>
          }
          action={<ArrowLink href="/numeri">Tutti i numeri</ArrowLink>}
        />
        <MenuBoard courses={courses} previews={previews} counts={counts} />
      </Reveal>

      {/* ═══ APPENA SFORNATI ═══ */}
      {big && (
        <Reveal as="section" className="mx-auto mt-24 max-w-[88rem] px-4 sm:px-6" aria-labelledby="sfornati">
          <SectionHeading id="sfornati" index="N° 2" kicker="Articoli recenti" title="Appena sfornati" action={<ArrowLink href="/cerca">Tutti gli articoli</ArrowLink>} />
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <ArticleCardLarge article={big} />
            </div>
            <div className="grid content-start gap-10 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
              {mediums.map((a) => (
                <ArticleCardMedium key={a.id} article={a} />
              ))}
            </div>
            <div className="lg:col-span-3 lg:border-l lg:border-rule lg:pl-8">
              <p className="kicker mb-4 text-ink-mute">Da leggere anche</p>
              {feed.map((a) => (
                <ArticleRow key={a.id} article={a} thumb={false} />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ═══ DAL CAMPO AL PIATTO ═══ */}
      {fieldToPlate && (
        <div className="mt-28">
          <FieldToPlateFeature article={fieldToPlate} />
        </div>
      )}

      {/* ═══ TERZA PAGINA ═══ */}
      {dessert && (
        <Reveal as="section" className="mx-auto mt-24 max-w-[88rem] px-4 sm:px-6" aria-labelledby="terza-pagina">
          <div className="grid overflow-hidden rounded-md lg:grid-cols-12" style={{ background: courseBySlug.dessert.wash }}>
            <div className="relative min-h-72 lg:col-span-5">
              <Picture src={dessert.cover_image} alt={dessert.cover_alt ?? ""} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-12 lg:col-span-7">
              <p className="kicker flex items-center gap-2" style={{ color: courseBySlug.dessert.ink }}>
                <CourseIcon course="dessert" className="size-5" /> Dessert · La Terza Pagina
              </p>
              <blockquote className="font-display-wonk mt-6 text-[clamp(1.7rem,3.4vw,3rem)] leading-[1.12] italic">
                «{pullQuote(dessert)}»
              </blockquote>
              <p className="mt-6 text-ink-soft">
                Da <Link href={`/articoli/${dessert.slug}`} className="font-display text-xl text-ink italic underline decoration-1 underline-offset-4">{dessert.title}</Link>, di {dessert.author_name}
                {dessert.is_demo && <DemoBadge className="ml-3" />}
              </p>
              <div className="mt-8">
                <ArrowLink href="/menu/dessert">Racconti, poesie e vignette</ArrowLink>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* ═══ LA PIAZZA + CAFFÈ ═══ */}
      <Reveal as="section" className="mx-auto mt-24 max-w-[88rem] px-4 sm:px-6" aria-label="La Piazza e il Caffè">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6" style={courseStyle("contorno")}>
            <SectionHeading index="Contorno" kicker="La Piazza" title="Le vostre domande" />
            {questions.length ? (
              <ul className="space-y-8">
                {questions.map((q) => (
                  <li key={q.id}>
                    <p className="font-display text-2xl leading-snug">
                      <span aria-hidden className="mr-2 text-[var(--accent)]">D.</span>
                      {q.title ?? q.message}
                    </p>
                    <p className="mt-1 text-sm text-ink-mute">
                      {q.signature ?? "Lettera non firmata"}
                      {q.is_demo && <DemoBadge className="ml-3" />}
                    </p>
                    <p className="mt-3 border-l-2 border-[var(--accent)] pl-4 leading-relaxed text-ink-soft">
                      <span className="font-semibold text-ink">R. </span>
                      {q.answer}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft">Le prime risposte arriveranno nel prossimo numero.</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/scrivi?tipo=domanda" className="btn btn-ink">
                Fai una domanda alla redazione
              </Link>
              <Link href="/menu/contorno" className="btn btn-outline">
                Vai alla Piazza
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6" style={courseStyle("caffe")}>
            <SectionHeading index="Caffè" kicker="Giochi e posta" title="La pausa caffè" />
            {poll && <PollCard poll={poll} />}
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {crossword && (
                <Link href={`/giochi/${crossword.id}`} className="group rounded-md bg-paper-2 p-5 transition hover:bg-ink hover:text-paper">
                  <span className="kicker opacity-70">Gioca</span>
                  <span className="font-display mt-2 block text-xl leading-tight">Il cruciverba</span>
                  <span className="mt-3 block text-sm opacity-80">{crossword.title}</span>
                </Link>
              )}
              {quiz && (
                <Link href={`/giochi/${quiz.id}`} className="group rounded-md bg-paper-2 p-5 transition hover:bg-ink hover:text-paper">
                  <span className="kicker opacity-70">Mettiti alla prova</span>
                  <span className="font-display mt-2 block text-xl leading-tight">Il quiz</span>
                  <span className="mt-3 block text-sm opacity-80">{quiz.title}</span>
                </Link>
              )}
              <Link href="/scrivi" className="group rounded-md bg-tomato-ink p-5 text-paper transition hover:bg-ink">
                <span className="kicker opacity-80">La posta</span>
                <span className="font-display mt-2 block text-xl leading-tight">Scrivi alla redazione</span>
                <span className="mt-3 block text-sm opacity-90">Domande, lettere e contributi.</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ═══ ARCHIVIO ═══ */}
      <Reveal as="section" className="mx-auto mt-24 max-w-[88rem] px-4 sm:px-6" aria-labelledby="archivio">
        <SectionHeading
          id="archivio"
          index="L'archivio"
          kicker={`Anno scolastico ${settings.school_year}`}
          title={
            <>
              Sette numeri, <span className="italic">un anno</span>
            </>
          }
          action={<ArrowLink href="/numeri">Sfoglia l&apos;archivio</ArrowLink>}
        />
        <div className="scroll-rail -mx-4 flex gap-5 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
          {extraIssues.map((i) => (
            <div key={i.id} className="w-40 shrink-0 sm:w-48">
              <IssueCover issue={i} masthead={settings.masthead} />
            </div>
          ))}
          {editorialCalendar.map((c) => {
            const published = publishedNumbers.get(c.number);
            return (
              <div key={c.number} className="w-40 shrink-0 sm:w-48">
                {published ? (
                  <IssueCover issue={published} masthead={settings.masthead} />
                ) : (
                  <PlannedCover number={c.number} month={c.month} note={c.note} />
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </>
  );
}
