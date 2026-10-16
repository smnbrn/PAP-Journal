import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/interactive/Reveal";
import { DemoBadge } from "@/components/site/bits";
import { IssueCover, PlannedCover } from "@/components/site/IssueCover";
import { getArticles, getIssues, getSettings } from "@/lib/data";
import { formatMonth } from "@/lib/format";
import { editorialCalendar } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Archivio dei numeri",
  description: "Tutti i numeri del giornale, mese per mese, con gli articoli e il PDF da sfogliare.",
};

export default async function ArchivePage() {
  const [settings, issues, articles] = await Promise.all([getSettings(), getIssues(), getArticles({ limit: 1000 })]);
  const byNumber = new Map(issues.map((i) => [i.number, i]));
  const others = issues.filter((i) => !editorialCalendar.some((c) => c.number === i.number));
  const count = (id: string) => articles.filter((a) => a.issue_id === id).length;

  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
      <header className="border-b border-ink pt-12 pb-10 sm:pt-16">
        <p className="kicker text-ink-mute">Anno scolastico {settings.school_year}</p>
        <h1 className="font-display-wonk animate-rise mt-3 text-[clamp(3.5rem,11vw,9rem)] leading-[0.85]">
          L&apos;archivio
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft">
          Sette numeri, da dicembre a giugno. Ogni numero ha il suo menù di articoli e, quando disponibile, il PDF da sfogliare o
          scaricare.
        </p>
      </header>

      <section aria-labelledby="calendario" className="mt-12">
        <h2 id="calendario" className="kicker mb-6 text-ink-mute">
          Il calendario delle uscite
        </h2>
        <ol className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
          {editorialCalendar.map((c) => {
            const issue = byNumber.get(c.number);
            return (
              <li key={c.number}>
                {issue ? <IssueCover issue={issue} masthead={settings.masthead} /> : <PlannedCover number={c.number} month={c.month} note={c.note} />}
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="pubblicati" className="mt-20">
        <h2 id="pubblicati" className="font-display border-b border-ink pb-4 text-4xl">
          Numeri pubblicati
        </h2>
        {issues.length === 0 ? (
          <p className="py-10 text-ink-soft">Il primo numero è in preparazione.</p>
        ) : (
          <ul>
            {issues.map((issue, i) => (
              <Reveal as="li" key={issue.id} delay={i * 60} className="grid gap-6 border-b border-rule py-8 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
                <div className="w-32 sm:w-full">
                  <IssueCover issue={issue} masthead={settings.masthead} />
                </div>
                <div>
                  <p className="kicker text-tomato-ink">
                    {issue.number === 0 ? "Numero zero" : `Numero ${issue.number}`} · {formatMonth(issue.month)}
                    {issue.is_demo && <DemoBadge className="ml-3 text-ink-mute" />}
                  </p>
                  <h3 className="font-display mt-2 text-3xl sm:text-4xl">
                    <Link href={`/numeri/${issue.number}`} className="link-underline">
                      {issue.title || formatMonth(issue.month)}
                    </Link>
                  </h3>
                  {issue.editorial && <p className="mt-3 max-w-2xl text-ink-soft">{issue.editorial}</p>}
                  <p className="mt-3 text-sm text-ink-mute">{count(issue.id)} articoli</p>
                </div>
                <div className="flex flex-wrap gap-3 sm:flex-col sm:items-end">
                  <Link href={`/numeri/${issue.number}`} className="btn btn-ink">
                    Apri il numero
                  </Link>
                  {issue.pdf_url && (
                    <a href={issue.pdf_url} className="btn btn-outline" target="_blank" rel="noopener">
                      PDF
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </ul>
        )}
        {others.length > 0 && (
          <p className="mt-6 text-sm text-ink-mute">
            Oltre ai sette numeri dell&apos;anno, l&apos;archivio comprende {others.length === 1 ? "un numero speciale o di prova" : `${others.length} numeri speciali o di prova`}.
          </p>
        )}
      </section>
    </div>
  );
}
