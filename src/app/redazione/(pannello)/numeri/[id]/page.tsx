import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmForm } from "@/components/admin/controls";
import { IssueEditor } from "@/components/admin/IssueEditor";
import { Notice, PageHeader, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { issueLabel } from "@/lib/format";
import { courseBySlug, courses } from "@/lib/site.config";
import { deleteIssue } from "../../../actions";

export const metadata = { title: "Modifica numero" };
export const instant = false;

export default function EditIssuePage(props: PageProps<"/redazione/numeri/[id]">) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditIssue {...props} />
    </Suspense>
  );
}

async function EditIssue({ params, searchParams }: PageProps<"/redazione/numeri/[id]">) {
  const { store } = await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const issue = await store.getIssue(id).catch(() => null);
  if (!issue) notFound();
  const articles = (await store.listArticles({ status: "all", issueId: issue.id })).sort(
    (a, b) => courses.findIndex((c) => c.slug === a.course) - courses.findIndex((c) => c.slug === b.course),
  );

  return (
    <>
      <PageHeader title={issueLabel(issue)} back={{ href: "/redazione/numeri", label: "Numeri" }}>
        {issue.status === "published" && (
          <Link href={`/numeri/${issue.number}`} target="_blank" className="btn btn-outline">
            Vedi sul sito ↗
          </Link>
        )}
      </PageHeader>
      {sp.salvato && <Notice>Numero salvato.</Notice>}
      <IssueEditor key={issue.updated_at} issue={issue} />

      <section className="mt-12">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl">Il menù di questo numero</h2>
          <Link href="/redazione/articoli/nuovo" className="text-sm font-semibold underline underline-offset-4">
            + Aggiungi un articolo
          </Link>
        </div>
        {articles.length ? (
          <ul className="divide-y divide-rule rounded-md bg-paper shadow-[0_0_0_1.5px_var(--color-rule)]">
            {articles.map((a) => {
              const c = courseBySlug[a.course];
              return (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-24 shrink-0 font-mono text-xs uppercase" style={{ color: c.ink }}>
                    {c.course}
                  </span>
                  <Link href={`/redazione/articoli/${a.id}`} className="min-w-0 flex-1 truncate font-semibold hover:underline">
                    {a.title}
                  </Link>
                  <StatusPill status={a.status} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-ink-mute">Nessun articolo assegnato a questo numero.</p>
        )}
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
        <p className="text-sm text-ink-mute">Eliminando il numero, gli articoli restano ma non saranno più assegnati a nessun numero.</p>
        <ConfirmForm action={deleteIssue} id={issue.id} message={`Eliminare il ${issueLabel(issue)}?`}>
          Elimina numero
        </ConfirmForm>
      </div>
    </>
  );
}
