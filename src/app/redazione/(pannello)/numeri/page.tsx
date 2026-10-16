import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, Notice, PageHeader, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { issueLabel } from "@/lib/format";
import { editorialCalendar } from "@/lib/site.config";

export const metadata = { title: "Numeri" };
export const instant = false;

export default function IssuesPage(props: PageProps<"/redazione/numeri">) {
  return (
    <>
      <PageHeader kicker="Le uscite" title="Numeri del giornale">
        <Link href="/redazione/numeri/nuovo" className="btn btn-ink">
          + Nuovo numero
        </Link>
      </PageHeader>
      <Suspense fallback={<PanelLoading />}>
        <IssueList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function IssueList({ searchParams }: { searchParams: PageProps<"/redazione/numeri">["searchParams"] }) {
  const { store } = await requireStaff();
  const [issues, articles, sp] = await Promise.all([store.listIssues(), store.listArticles({ status: "all" }), searchParams]);
  const missing = editorialCalendar.filter((p) => !issues.some((i) => i.number === p.number));

  return (
    <>
      {sp.eliminato && <Notice>Numero eliminato. I suoi articoli sono rimasti, senza numero.</Notice>}
      {issues.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((i) => {
            const count = articles.filter((a) => a.issue_id === i.id).length;
            return (
              <li key={i.id}>
                <Link
                  href={`/redazione/numeri/${i.id}`}
                  className="flex h-full flex-col rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)] transition hover:shadow-[0_0_0_1.5px_var(--color-ink)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display-wonk text-6xl leading-none">{i.number}</p>
                    <StatusPill status={i.status} />
                  </div>
                  <p className="mt-4 font-semibold">{issueLabel(i)}</p>
                  {i.title && <p className="font-display text-lg italic">{i.title}</p>}
                  <p className="mt-auto pt-4 text-sm text-ink-mute">
                    {count} articol{count === 1 ? "o" : "i"} · {i.pdf_url ? "PDF caricato" : "senza PDF"}
                    {i.is_demo && " · esempio"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState>Nessun numero ancora.</EmptyState>
      )}

      {missing.length > 0 && (
        <section className="mt-10">
          <h2 className="kicker mb-3 text-ink-mute">Dal calendario editoriale, ancora da creare</h2>
          <ul className="flex flex-wrap gap-2">
            {missing.map((p) => (
              <li key={p.number}>
                <Link
                  href={`/redazione/numeri/nuovo?numero=${p.number}&mese=${p.month.slice(0, 7)}`}
                  className="inline-flex rounded-full border-2 border-dashed border-ink/30 px-4 py-2 text-sm hover:border-ink"
                >
                  + {issueLabel(p)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
