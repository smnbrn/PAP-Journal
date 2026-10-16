import Link from "next/link";
import { formatShort } from "@/lib/format";
import type { Article } from "@/lib/types";
import { Byline, CourseTag, DemoBadge, courseStyle } from "./bits";
import { Picture } from "./Picture";

const href = (a: Article) => `/articoli/${a.slug}`;

/** Card grande: immagine alta, titolo importante. */
export function ArticleCardLarge({
  article,
  priority = false,
  aspect = "aspect-[4/5]",
  sizes = "(min-width: 1024px) 40vw, 100vw",
}: {
  article: Article;
  priority?: boolean;
  aspect?: string;
  sizes?: string;
}) {
  return (
    <article className="group relative" style={courseStyle(article.course)}>
      <Link href={href(article)} className="block" aria-label={article.title}>
        <div className={`img-zoom relative overflow-hidden rounded-sm bg-paper-3 ${aspect}`}>
          <Picture src={article.cover_image} alt={article.cover_alt ?? ""} sizes={sizes} priority={priority} />
        </div>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CourseTag course={article.course} />
        {article.is_demo && <DemoBadge />}
      </div>
      <h3 className="font-display mt-2 text-3xl font-medium leading-[1.05] sm:text-4xl">
        <Link href={href(article)} className="link-underline">
          {article.title}
        </Link>
      </h3>
      {article.excerpt && <p className="mt-3 max-w-prose text-[1.05rem] leading-relaxed text-ink-soft">{article.excerpt}</p>}
      <div className="mt-4">
        <Byline article={article} />
      </div>
    </article>
  );
}

/** Card media: immagine orizzontale e titolo. */
export function ArticleCardMedium({ article, sizes = "(min-width: 1024px) 30vw, 100vw" }: { article: Article; sizes?: string }) {
  return (
    <article className="group" style={courseStyle(article.course)}>
      <Link href={href(article)} className="block" tabIndex={-1} aria-hidden>
        <div className="img-zoom relative aspect-[3/2] overflow-hidden rounded-sm bg-paper-3">
          <Picture src={article.cover_image} alt="" sizes={sizes} />
        </div>
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CourseTag course={article.course} />
        {article.is_demo && <DemoBadge />}
      </div>
      <h3 className="font-display mt-1.5 text-2xl font-medium leading-tight">
        <Link href={href(article)} className="link-underline">
          {article.title}
        </Link>
      </h3>
      {article.subtitle && <p className="mt-2 line-clamp-3 text-ink-soft">{article.subtitle}</p>}
      <p className="mt-3 text-sm text-ink-mute">
        {article.author_name} · {formatShort(article.published_at)}
      </p>
    </article>
  );
}

/** Riga di sommario, sul modello del flusso di un magazine. */
export function ArticleRow({ article, thumb = true }: { article: Article; thumb?: boolean }) {
  return (
    <article className="group grid grid-cols-[1fr_auto] gap-4 border-t border-rule py-5 first:border-t-0 first:pt-0" style={courseStyle(article.course)}>
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <CourseTag course={article.course} />
          <span className="kicker text-ink-mute">{formatShort(article.published_at)}</span>
          {article.is_demo && <DemoBadge />}
        </div>
        <h3 className="font-display mt-1.5 text-xl font-medium leading-snug sm:text-2xl">
          <Link href={href(article)} className="link-underline">
            {article.title}
          </Link>
        </h3>
        {article.subtitle && <p className="mt-1.5 line-clamp-2 text-[0.95rem] text-ink-soft">{article.subtitle}</p>}
        <p className="mt-2 text-sm text-ink-mute">A cura di {article.author_name}</p>
      </div>
      {thumb && article.cover_image && (
        <Link href={href(article)} tabIndex={-1} aria-hidden className="img-zoom relative mt-1 block size-20 overflow-hidden rounded-sm bg-paper-3 sm:size-28">
          <Picture src={article.cover_image} alt="" sizes="112px" />
        </Link>
      )}
    </article>
  );
}

/** Voce compatta numerata, per sommari laterali. */
export function ArticleIndexItem({ article, n }: { article: Article; n: number }) {
  return (
    <li className="group flex gap-4 border-t border-rule py-4 first:border-t-0" style={courseStyle(article.course)}>
      <span className="font-display text-3xl leading-none text-[var(--accent)]">{String(n).padStart(2, "0")}</span>
      <div>
        <CourseTag course={article.course} />
        <h3 className="mt-1 font-semibold leading-snug">
          <Link href={href(article)} className="link-underline">
            {article.title}
          </Link>
        </h3>
      </div>
    </li>
  );
}
