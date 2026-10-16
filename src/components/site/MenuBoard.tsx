"use client";
import Link from "next/link";
import { useState } from "react";
import type { Course } from "@/lib/site.config";
import type { CourseSlug } from "@/lib/types";
import { CourseIcon } from "./CourseIcon";

export type BoardPreview = {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  alt: string;
};

/**
 * La carta del menù in prima pagina: sei portate, ognuna con la sua rubrica.
 * Passando sopra (o con il tasto Tab) si vede il «piatto» più recente.
 */
export function MenuBoard({
  courses,
  previews,
  counts,
}: {
  courses: Course[];
  previews: Partial<Record<CourseSlug, BoardPreview>>;
  counts: Partial<Record<CourseSlug, number>>;
}) {
  const [active, setActive] = useState<CourseSlug>("secondo");
  const current = courses.find((c) => c.slug === active)!;
  const preview = previews[active];

  return (
    <div data-menuboard className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      <ol className="relative">
        {courses.map((c) => {
          const on = c.slug === active;
          const p = previews[c.slug];
          return (
            <li key={c.slug} data-course={c.slug}>
              <Link
                href={`/menu/${c.slug}`}
                onMouseEnter={() => setActive(c.slug)}
                onFocus={() => setActive(c.slug)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-dotted border-ink/30 py-4 sm:gap-x-6 sm:py-5"
              >
                <span
                  className="flex size-12 items-center justify-center rounded-full transition-all duration-500 sm:size-14"
                  style={{ background: on ? c.color : "transparent", color: on ? "#f4efe4" : c.ink, boxShadow: on ? "none" : `inset 0 0 0 1.5px ${c.ink}` }}
                >
                  <CourseIcon course={c.slug} className="size-7 sm:size-8" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-3">
                    <span
                      className="font-display-wonk text-[2.1rem] leading-none italic transition-[color,transform] duration-500 group-hover:translate-x-1 sm:text-5xl"
                      style={{ color: on ? c.ink : undefined }}
                    >
                      {c.course}
                    </span>
                    <span className="leader hidden md:block" />
                    <span className="hidden text-right font-semibold md:block">{c.section}</span>
                  </span>
                  <span className="mt-1.5 block text-sm text-ink-soft">
                    <span className="font-semibold text-ink md:hidden">{c.section}. </span>
                    {c.short}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1 text-right">
                  <span className="kicker text-ink-mute">{c.pages}</span>
                  <span className="kicker text-ink-mute">
                    {counts[c.slug] ?? 0} {(counts[c.slug] ?? 0) === 1 ? "articolo" : "articoli"}
                  </span>
                  {p?.image && (
                    // Anteprima piccola visibile solo su telefono
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="mt-1 size-12 rounded-sm object-cover lg:hidden" loading="lazy" />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <div data-board-preview className="hidden lg:block">
        <div className="sticky top-28" aria-live="polite">
          <div className="relative overflow-hidden rounded-md" style={{ background: current.wash }}>
            {preview ? (
              <Link href={`/articoli/${preview.slug}`} className="group block">
                <div className="img-zoom relative aspect-[4/3] overflow-hidden">
                  {preview.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={preview.slug} src={preview.image} alt={preview.alt} className="animate-fade absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-6">
                  <p className="kicker" style={{ color: current.ink }}>
                    Nel piatto · {current.course}
                  </p>
                  <p className="font-display mt-2 text-3xl leading-tight">
                    <span className="link-underline">{preview.title}</span>
                  </p>
                  {preview.excerpt && <p className="mt-3 line-clamp-3 text-ink-soft">{preview.excerpt}</p>}
                </div>
              </Link>
            ) : (
              <div className="p-8">
                <p className="kicker" style={{ color: current.ink }}>
                  {current.course} · {current.section}
                </p>
                <p className="font-display mt-3 text-3xl">In preparazione.</p>
                <p className="mt-3 text-ink-soft">{current.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
