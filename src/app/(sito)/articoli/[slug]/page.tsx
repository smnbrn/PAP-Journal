import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/interactive/Reveal";
import { ArticleCardMedium } from "@/components/site/ArticleCards";
import { ArticleView } from "@/components/site/ArticleView";
import { SectionHeading } from "@/components/site/bits";
import { NextCourse } from "@/components/site/CourseRail";
import { getArticle, getArticles, getIssues, getSettings } from "@/lib/data";

// La pagina attende il proprio indirizzo prima di mostrarsi: così un indirizzo
// sbagliato risponde con un vero «pagina non trovata».
export const instant = false;

export async function generateStaticParams() {
  const articles = await getArticles({ limit: 200 });
  // Con Cache Components serve almeno un valore: se non ci sono ancora
  // articoli, la pagina segnaposto risponde semplicemente «non trovato».
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: "benvenuti" }];
}

export async function generateMetadata({ params }: PageProps<"/articoli/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);
  if (!article) return { title: "Articolo non trovato" };
  return {
    title: article.title,
    description: article.excerpt ?? article.subtitle ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.subtitle ?? undefined,
      type: "article",
      siteName: settings.masthead,
      publishedTime: article.published_at ?? undefined,
      authors: [article.author_name],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/articoli/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const issues = await getIssues();
  const issue = issues.find((i) => i.id === article.issue_id) ?? null;
  const related = (await getArticles(issue ? { issueId: issue.id } : { limit: 8 }))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <>
      <ArticleView article={article} issue={issue} />
      <div className="mx-auto mt-20 max-w-[88rem] px-4 sm:px-6">
        {related.length > 0 && (
          <Reveal as="section" aria-labelledby="stesso-numero">
            <SectionHeading id="stesso-numero" index="Continua a leggere" title={issue ? "Dallo stesso numero" : "Altri articoli"} />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCardMedium key={a.id} article={a} />
              ))}
            </div>
          </Reveal>
        )}
        <div className="mt-16">
          <NextCourse current={article.course} />
        </div>
      </div>
    </>
  );
}
