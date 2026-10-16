import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PanelLoading } from "@/components/admin/ui";
import { ArticleView } from "@/components/site/ArticleView";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Anteprima", robots: { index: false, follow: false } };
export const instant = false;

export default function PreviewPage(props: PageProps<"/redazione/anteprima/[id]">) {
  return (
    <Suspense fallback={<div className="p-10"><PanelLoading /></div>}>
      <Preview params={props.params} />
    </Suspense>
  );
}

async function Preview({ params }: { params: PageProps<"/redazione/anteprima/[id]">["params"] }) {
  const { store } = await requireStaff();
  const { id } = await params;
  const article = await store.getArticle(id).catch(() => null);
  if (!article) notFound();
  const issues = await store.listIssues();
  const issue = issues.find((i) => i.id === article.issue_id) ?? null;
  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-ink px-4 py-2.5 text-sm text-paper sm:px-6">
        <p>
          <strong>Anteprima</strong> · {article.status === "published" ? "articolo pubblicato" : "bozza: i lettori non la vedono"}
        </p>
        <Link href={`/redazione/articoli/${article.id}`} className="rounded-full bg-paper/15 px-3 py-1 font-semibold hover:bg-paper/25">
          ← Torna a modificare
        </Link>
      </div>
      <main id="contenuto">
        <ArticleView article={article} issue={issue} preview />
      </main>
    </>
  );
}
