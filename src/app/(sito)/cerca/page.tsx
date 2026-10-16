import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleRow } from "@/components/site/ArticleCards";
import { getArticles, searchArticles } from "@/lib/data";
import { courses } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Cerca negli articoli",
  description: "Cerca gli articoli del giornale per titolo, autore o parola chiave.",
};

export default function SearchPage({ searchParams }: PageProps<"/cerca">) {
  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
      <header className="border-b border-ink pt-12 pb-10 sm:pt-16">
        <h1 className="font-display-wonk text-[clamp(3rem,9vw,7rem)] leading-[0.9]">
          Cerca <span className="italic">in dispensa</span>
        </h1>
        <Suspense fallback={<SearchForm defaultValue="" />}>
          <SearchFormFromParams searchParams={searchParams} />
        </Suspense>
        <p className="mt-4 text-sm text-ink-mute">
          Cerca per titolo, autore o parola chiave. La ricerca riconosce anche plurali e varianti: «castagne» trova «castagna».
        </p>
      </header>
      <Suspense fallback={<p className="py-10 text-ink-mute">Ricerca in corso…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchFormFromParams({ searchParams }: { searchParams: PageProps<"/cerca">["searchParams"] }) {
  const { q } = await searchParams;
  return <SearchForm key={String(q ?? "")} defaultValue={typeof q === "string" ? q : ""} />;
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form role="search" action="/cerca" className="mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
      <label htmlFor="q" className="sr-only">
        Parole da cercare
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Per esempio: castagna, sala, poesia…"
        className="font-display min-w-0 flex-1 rounded-full border-2 border-ink bg-paper px-6 py-4 text-xl outline-none placeholder:text-ink-mute focus:border-tomato"
      />
      <button type="submit" className="btn btn-ink px-8 py-4 text-base">
        Cerca
      </button>
    </form>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/cerca">["searchParams"] }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const results = query ? await searchArticles(query) : await getArticles({ limit: 60 });

  return (
    <section className="mt-10 grid gap-12 lg:grid-cols-[1fr_18rem]" aria-live="polite">
      <div>
        <p className="kicker mb-6 text-ink-mute">
          {query
            ? results.length === 0
              ? `Nessun risultato per «${query}»`
              : `${results.length} ${results.length === 1 ? "risultato" : "risultati"} per «${query}»`
            : "Tutti gli articoli, dal più recente"}
        </p>
        {query && results.length === 0 && (
          <div className="rounded-md bg-paper-2 p-6">
            <p className="font-display text-2xl">Niente in dispensa con questo nome.</p>
            <p className="mt-2 text-ink-soft">Prova con una parola diversa, più corta, oppure sfoglia le rubriche qui a fianco.</p>
          </div>
        )}
        <div>
          {results.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      </div>
      <aside>
        <p className="kicker mb-3 text-ink-mute">Sfoglia per portata</p>
        <ul className="space-y-1">
          {courses.map((c) => (
            <li key={c.slug}>
              <Link href={`/menu/${c.slug}`} className="group flex items-baseline gap-2 py-1.5">
                <span className="font-display text-xl italic" style={{ color: c.ink }}>
                  {c.course}
                </span>
                <span className="leader" />
                <span className="text-sm font-semibold">{c.section}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/numeri" className="btn btn-outline mt-6">
          Archivio dei numeri
        </Link>
      </aside>
    </section>
  );
}
