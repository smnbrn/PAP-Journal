import { Suspense } from "react";
import { ArticleEditor, type ArticleDraft } from "@/components/admin/ArticleEditor";
import { Notice, PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { isCourseSlug } from "@/lib/site.config";

export const metadata = { title: "Nuovo articolo" };
export const instant = false;

export default function NewArticlePage(props: PageProps<"/redazione/articoli/nuovo">) {
  return (
    <>
      <PageHeader title="Nuovo articolo" back={{ href: "/redazione/articoli", label: "Articoli" }} />
      <Suspense fallback={<PanelLoading />}>
        <NewArticle searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function NewArticle({ searchParams }: { searchParams: PageProps<"/redazione/articoli/nuovo">["searchParams"] }) {
  const { store } = await requireStaff();
  const sp = await searchParams;
  const issues = await store.listIssues();
  const portata = typeof sp.portata === "string" && isCourseSlug(sp.portata) ? sp.portata : undefined;
  // L'ultimo numero in preparazione è quello su cui di solito si lavora.
  const working = issues.find((i) => i.status === "draft") ?? issues[0];
  const draft: ArticleDraft = { course: portata ?? "primo", issue_id: working?.id ?? null, status: "draft" };

  const fromId = typeof sp.contributo === "string" ? sp.contributo : "";
  const submission = fromId ? await store.getSubmission(fromId).catch(() => null) : null;
  if (submission) {
    Object.assign(draft, {
      title: submission.title ?? "",
      body: submission.message
        .split(/\n{2,}/)
        .map((p) => `<p>${escape(p).replace(/\n/g, "<br>")}</p>`)
        .join(""),
      author_name: submission.signature ?? "",
      author_role: submission.class_label,
      course: submission.kind === "contributo" ? "dessert" : "contorno",
      from_submission: submission.id,
    } satisfies ArticleDraft);
  }

  return (
    <>
      {submission && (
        <Notice tone="info">
          Stai trasformando un contributo dei lettori in articolo. Rileggilo e correggilo prima di pubblicarlo: quando salvi, il contributo
          verrà segnato come preso in carico.
        </Notice>
      )}
      <ArticleEditor article={draft} issues={issues} />
    </>
  );
}
