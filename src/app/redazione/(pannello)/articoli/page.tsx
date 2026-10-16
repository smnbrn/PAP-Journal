import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, inputClass, Notice, PageHeader, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatShort } from "@/lib/format";
import { courseBySlug, courses, isCourseSlug } from "@/lib/site.config";

export const metadata = { title: "Articoli" };
export const instant = false;

export default function ArticlesPage(props: PageProps<"/redazione/articoli">) {
  return (
    <>
      <PageHeader kicker="Archivio di lavoro" title="Articoli">
        <Link href="/redazione/articoli/nuovo" className="btn btn-ink">
          + Nuovo articolo
        </Link>
      </PageHeader>
      <Suspense fallback={<PanelLoading />}>
        <ArticleList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function ArticleList({ searchParams }: { searchParams: PageProps<"/redazione/articoli">["searchParams"] }) {
  const { store } = await requireStaff();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const q = one(sp.q).slice(0, 100);
  const course = one(sp.rubrica);
  const issueId = one(sp.numero);
  const stato = one(sp.stato);
  const issues = await store.listIssues();
  const articles = await store.listArticles({
    status: stato === "draft" || stato === "published" ? stato : "all",
    course: isCourseSlug(course) ? course : undefined,
    issueId: issueId === "nessuno" ? undefined : issueId || undefined,
    search: q || undefined,
  });
  const list = issueId === "nessuno" ? articles.filter((a) => !a.issue_id) : articles;
  const issueName = (id: string | null) => {
    const i = issues.find((x) => x.id === id);
    return i ? (i.number === 0 ? "N. zero" : `N. ${i.number}`) : "—";
  };

  return (
    <>
      {sp.eliminato && <Notice>Articolo eliminato.</Notice>}
      <form className="mb-6 grid gap-3 rounded-md bg-paper p-4 shadow-[0_0_0_1.5px_var(--color-rule)] sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]" role="search">
        <label className="sr-only" htmlFor="q">
          Cerca
        </label>
        <input id="q" name="q" defaultValue={q} type="search" placeholder="Cerca per titolo, testo o autore" className={inputClass} />
        <label className="sr-only" htmlFor="rubrica">
          Rubrica
        </label>
        <select id="rubrica" name="rubrica" defaultValue={course} className={inputClass}>
          <option value="">Tutte le portate</option>
          {courses.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.course} · {c.section}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="numero">
          Numero
        </label>
        <select id="numero" name="numero" defaultValue={issueId} className={inputClass}>
          <option value="">Tutti i numeri</option>
          {issues.map((i) => (
            <option key={i.id} value={i.id}>
              {i.number === 0 ? "Numero zero" : `Numero ${i.number}`}
            </option>
          ))}
          <option value="nessuno">Senza numero</option>
        </select>
        <label className="sr-only" htmlFor="stato">
          Stato
        </label>
        <select id="stato" name="stato" defaultValue={stato} className={inputClass}>
          <option value="">Bozze e pubblicati</option>
          <option value="draft">Solo bozze</option>
          <option value="published">Solo pubblicati</option>
        </select>
        <div className="flex gap-2">
          <button className="btn btn-ink">Filtra</button>
          {(q || course || issueId || stato) && (
            <Link href="/redazione/articoli" className="btn btn-outline">
              Azzera
            </Link>
          )}
        </div>
      </form>

      <p className="mb-3 text-sm text-ink-mute" role="status">
        {list.length === 1 ? "1 articolo" : `${list.length} articoli`}
      </p>

      {list.length ? (
        <div className="overflow-hidden rounded-md bg-paper shadow-[0_0_0_1.5px_var(--color-rule)]">
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-rule bg-paper-2 md:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Titolo</th>
                <th scope="col" className="px-4 py-3 font-semibold">Portata</th>
                <th scope="col" className="px-4 py-3 font-semibold">Numero</th>
                <th scope="col" className="px-4 py-3 font-semibold">Data</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {list.map((a) => {
                const c = courseBySlug[a.course];
                return (
                  <tr key={a.id} className="grid grid-cols-[1fr_auto] gap-x-3 px-4 py-3 hover:bg-paper-2/60 md:table-row md:p-0">
                    <td className="min-w-0 md:px-4 md:py-3">
                      <Link href={`/redazione/articoli/${a.id}`} className="font-semibold hover:underline">
                        {a.title}
                      </Link>
                      <span className="block text-xs text-ink-mute">
                        {a.author_name}
                        {a.is_demo && " · esempio"}
                        {a.featured && " · in apertura"}
                      </span>
                    </td>
                    <td className="col-start-1 text-xs md:px-4 md:py-3 md:text-sm">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ background: c.color }} aria-hidden />
                        {c.course}
                        <span className="text-ink-mute md:hidden">· {issueName(a.issue_id)}</span>
                      </span>
                    </td>
                    <td className="hidden md:table-cell md:px-4 md:py-3">{issueName(a.issue_id)}</td>
                    <td className="hidden whitespace-nowrap md:table-cell md:px-4 md:py-3">{formatShort(a.published_at ?? a.updated_at)}</td>
                    <td className="col-start-2 row-span-2 row-start-1 self-center md:px-4 md:py-3">
                      <StatusPill status={a.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>
          {q || course || issueId || stato ? "Nessun articolo corrisponde ai filtri." : "Non ci sono ancora articoli."}
        </EmptyState>
      )}
    </>
  );
}
