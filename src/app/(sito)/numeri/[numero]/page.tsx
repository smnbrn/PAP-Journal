import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoBadge } from "@/components/site/bits";
import { CourseIcon } from "@/components/site/CourseIcon";
import { IssueCover } from "@/components/site/IssueCover";
import { getArticles, getIssueByNumber, getIssues, getSettings } from "@/lib/data";
import { formatMonth } from "@/lib/format";
import { courses } from "@/lib/site.config";

export const instant = false;

export async function generateStaticParams() {
  const issues = await getIssues();
  return issues.length ? issues.map((i) => ({ numero: String(i.number) })) : [{ numero: "1" }];
}

export async function generateMetadata({ params }: PageProps<"/numeri/[numero]">): Promise<Metadata> {
  const { numero } = await params;
  const issue = await getIssueByNumber(Number(numero));
  if (!issue) return { title: "Numero non trovato" };
  return {
    title: `${issue.number === 0 ? "Numero zero" : `Numero ${issue.number}`} · ${formatMonth(issue.month)}`,
    description: issue.editorial ?? undefined,
  };
}

export default async function IssuePage({ params }: PageProps<"/numeri/[numero]">) {
  const { numero } = await params;
  if (!/^\d+$/.test(numero)) notFound();
  const issue = await getIssueByNumber(Number(numero));
  if (!issue) notFound();
  const [settings, articles] = await Promise.all([getSettings(), getArticles({ issueId: issue.id })]);
  const label = issue.number === 0 ? "Numero zero" : `Numero ${issue.number}`;

  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
      <header className="grid gap-10 border-b border-ink pt-12 pb-12 sm:pt-16 lg:grid-cols-[1fr_18rem]">
        <div>
          <p className="kicker text-ink-mute">
            <Link href="/numeri" className="hover:text-ink">
              Archivio
            </Link>{" "}
            / {formatMonth(issue.month)}
            {issue.is_demo && <DemoBadge className="ml-3" />}
          </p>
          <h1 className="mt-4">
            <span className="font-display-wonk animate-rise block text-[clamp(3.5rem,11vw,9rem)] leading-[0.85]">{label}</span>
            {issue.title && <span className="font-display mt-4 block text-3xl italic text-ink-soft sm:text-4xl">{issue.title}</span>}
          </h1>
          {issue.editorial && <p className="mt-6 max-w-2xl text-lg leading-relaxed">{issue.editorial}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {issue.pdf_url ? (
              <>
                <a href={issue.pdf_url} target="_blank" rel="noopener" className="btn btn-ink">
                  Sfoglia il PDF
                </a>
                <a href={issue.pdf_url} download className="btn btn-outline">
                  Scarica il PDF
                </a>
              </>
            ) : (
              <p className="rounded-md bg-paper-2 px-4 py-3 text-sm text-ink-soft">
                Il PDF di questo numero non è ancora disponibile.
              </p>
            )}
          </div>
        </div>
        <div className="mx-auto w-48 lg:w-full">
          <IssueCover issue={issue} masthead={settings.masthead} size="lg" />
        </div>
      </header>

      {issue.pdf_url && (
        <details className="group mt-8 hidden rounded-md border border-ink/20 lg:block">
          <summary className="cursor-pointer px-5 py-4 font-semibold">Anteprima del PDF</summary>
          <iframe src={issue.pdf_url} title={`PDF del ${label}`} className="h-[80vh] w-full border-t border-ink/20" loading="lazy" />
        </details>
      )}

      {/* Il sommario, impaginato come la carta di un ristorante */}
      <section aria-labelledby="sommario" className="mx-auto mt-14 max-w-4xl">
        <div className="rounded-md border-[3px] border-double border-ink bg-paper p-6 sm:p-12">
          <p className="kicker text-center text-ink-mute">{settings.masthead}</p>
          <h2 id="sommario" className="font-display-wonk mt-2 text-center text-5xl italic sm:text-6xl">
            Il menù del numero
          </h2>
          <p className="kicker mt-2 text-center text-tomato-ink">
            {label} · {formatMonth(issue.month)}
          </p>
          <div className="mt-10 space-y-10">
            {courses.map((c) => {
              const dishes = articles.filter((a) => a.course === c.slug);
              return (
                <div key={c.slug}>
                  <h3 className="flex items-baseline gap-3">
                    <CourseIcon course={c.slug} className="size-6 shrink-0 self-center" />
                    <span className="font-display-wonk text-3xl italic" style={{ color: c.ink }}>
                      {c.course}
                    </span>
                    <span className="leader" />
                    <span className="font-semibold">{c.section}</span>
                    <span className="kicker hidden text-ink-mute sm:inline">{c.pages}</span>
                  </h3>
                  {dishes.length ? (
                    <ul className="mt-3 space-y-3 pl-9">
                      {dishes.map((a) => (
                        <li key={a.id}>
                          <Link href={`/articoli/${a.slug}`} className="group block">
                            <span className="font-display text-xl leading-snug">
                              <span className="link-underline">{a.title}</span>
                            </span>
                            <span className="block text-sm text-ink-mute italic">{a.author_name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 pl-9 text-sm text-ink-mute italic">Portata non servita in questo numero.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
