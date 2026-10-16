import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ConfirmForm } from "@/components/admin/controls";
import { Notice, PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deleteArticle } from "../../../actions";

export const metadata = { title: "Modifica articolo" };
export const instant = false;

export default function EditArticlePage(props: PageProps<"/redazione/articoli/[id]">) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditArticle {...props} />
    </Suspense>
  );
}

const savedMessages: Record<string, string> = {
  "1": "Modifiche salvate.",
  pubblicato: "Articolo pubblicato: è già visibile sul sito.",
  ritirato: "Articolo ritirato: ora è una bozza e non si vede più sul sito.",
};

async function EditArticle({ params, searchParams }: PageProps<"/redazione/articoli/[id]">) {
  const { store } = await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [article, issues] = await Promise.all([store.getArticle(id).catch(() => null), store.listIssues()]);
  if (!article) notFound();
  const saved = typeof sp.salvato === "string" ? savedMessages[sp.salvato] : undefined;
  const issuePublished = !article.issue_id || issues.some((i) => i.id === article.issue_id && i.status === "published");

  return (
    <>
      <PageHeader title={article.title} back={{ href: "/redazione/articoli", label: "Articoli" }}>
        {article.status === "published" && issuePublished && (
          <Link href={`/articoli/${article.slug}`} target="_blank" className="btn btn-outline">
            Vedi sul sito ↗
          </Link>
        )}
      </PageHeader>
      {saved && <Notice>{saved}</Notice>}
      {article.status === "published" && !issuePublished && (
        <Notice tone="info">
          L&apos;articolo è pronto, ma comparirà sul sito solo quando sarà pubblicato anche il suo numero.
        </Notice>
      )}
      {/* La chiave forza un editor nuovo dopo ogni salvataggio */}
      <ArticleEditor key={article.updated_at} article={article} issues={issues} />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
        <p className="text-sm text-ink-mute">L&apos;eliminazione è definitiva. Per nascondere un articolo basta ritirarlo.</p>
        <ConfirmForm action={deleteArticle} id={article.id} message={`Eliminare definitivamente «${article.title}»?`}>
          Elimina articolo
        </ConfirmForm>
      </div>
    </>
  );
}
