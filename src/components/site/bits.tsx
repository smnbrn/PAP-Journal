import Link from "next/link";
import type { ReactNode } from "react";
import { formatDay, readingMinutes } from "@/lib/format";
import { courseBySlug } from "@/lib/site.config";
import type { Article, CourseSlug } from "@/lib/types";
import { CourseIcon } from "./CourseIcon";

export function courseStyle(slug: CourseSlug) {
  const c = courseBySlug[slug];
  return {
    "--accent": c.color,
    "--accent-ink": c.ink,
    "--accent-wash": c.wash,
  } as React.CSSProperties;
}

/** «Secondo · Dal campo al piatto»: portata e rubrica sempre insieme. */
export function CourseTag({
  course,
  link = true,
  icon = false,
  className = "",
}: {
  course: CourseSlug;
  link?: boolean;
  icon?: boolean;
  className?: string;
}) {
  const c = courseBySlug[course];
  const content = (
    <>
      {icon && <CourseIcon course={course} className="size-4" strokeWidth={2.2} />}
      <span>{c.course}</span>
      <span aria-hidden className="opacity-50">
        ·
      </span>
      <span className="opacity-80">{c.section}</span>
    </>
  );
  const cls = `kicker inline-flex items-center gap-1.5 ${className}`;
  const style = { color: c.ink };
  return link ? (
    <Link href={`/menu/${course}`} className={`${cls} hover:underline`} style={style}>
      {content}
    </Link>
  ) : (
    <span className={cls} style={style}>
      {content}
    </span>
  );
}

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`stamp text-ink-mute ${className}`} title="Contenuto di esempio, non pubblicato dalla redazione">
      Esempio
    </span>
  );
}

export function Byline({ article, showReading = false }: { article: Article; showReading?: boolean }) {
  return (
    <p className="text-sm text-ink-soft">
      <span className="text-ink-mute">A cura di </span>
      <span className="font-semibold text-ink">{article.author_name}</span>
      {article.published_at && (
        <>
          <span aria-hidden className="mx-2 text-ink-mute">
            /
          </span>
          <time dateTime={article.published_at}>{formatDay(article.published_at)}</time>
        </>
      )}
      {showReading && (
        <>
          <span aria-hidden className="mx-2 text-ink-mute">
            /
          </span>
          {readingMinutes(article.body)} min di lettura
        </>
      )}
    </p>
  );
}

export function SectionHeading({
  index,
  title,
  kicker,
  action,
  tone = "ink",
  id,
}: {
  index?: string;
  title: ReactNode;
  kicker?: string;
  action?: ReactNode;
  tone?: "ink" | "paper";
  id?: string;
}) {
  return (
    <div className={`mb-8 flex flex-wrap items-end gap-x-6 gap-y-3 border-b pb-4 ${tone === "paper" ? "border-paper/30" : "border-ink"}`}>
      <div className="flex-1">
        {(index || kicker) && (
          <p className={`kicker mb-2 ${tone === "paper" ? "text-paper/70" : "text-ink-mute"}`}>
            {index && <span className="mr-3">{index}</span>}
            {kicker}
          </p>
        )}
        <h2 id={id} className="font-display text-4xl font-medium leading-[0.95] sm:text-5xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2 text-sm font-semibold ${className}`}>
      <span className="link-underline">{children}</span>
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
