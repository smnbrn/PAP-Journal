"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Course } from "@/lib/site.config";
import type { CourseSlug } from "@/lib/types";
import { CourseIcon } from "./CourseIcon";

export type MenuPreview = {
  slug: string;
  title: string;
  image: string | null;
  alt: string;
};

/**
 * «La carta»: il menù del giornale, aperto come la carta di un ristorante.
 * Usa l'elemento <dialog> nativo: tastiera, tasto Esc e lettori di schermo
 * funzionano senza trucchi.
 */
export function MenuOverlay({
  courses,
  previews,
  issueLabel,
  masthead,
}: {
  courses: Course[];
  previews: Partial<Record<CourseSlug, MenuPreview>>;
  issueLabel: string | null;
  masthead: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<CourseSlug>("aperitivo");
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const open = () => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => dialog.current?.close();

  const activeCourse = courses.find((c) => c.slug === active)!;
  const preview = previews[active];

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group inline-flex items-center gap-2.5 rounded-full py-2 pr-3 pl-1 text-sm font-semibold"
        aria-haspopup="dialog"
      >
        <span className="relative flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full bg-ink text-paper transition-colors group-hover:bg-tomato-ink">
          <span className="h-[1.5px] w-4 bg-current transition-transform group-hover:translate-x-0.5" />
          <span className="h-[1.5px] w-4 bg-current" />
          <span className="h-[1.5px] w-4 bg-current transition-transform group-hover:-translate-x-0.5" />
        </span>
        <span className="whitespace-nowrap">
          <span className="max-[400px]:sr-only">Il </span>menù
          <span className="sr-only"> del giornale</span>
        </span>
      </button>

      <dialog
        ref={dialog}
        onClose={() => (document.documentElement.style.overflow = "")}
        onClick={(e) => e.target === dialog.current && close()}
        className="menu-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/55 backdrop:backdrop-blur-[2px] sm:p-4 lg:p-8"
        aria-label="Il menù del giornale"
      >
        <div className="menu-card no-scrollbar relative mx-auto h-full max-w-6xl overflow-y-auto bg-paper bg-[image:var(--paper-grain)] text-ink shadow-2xl sm:rounded-md">
          {/* Contenitore interno: cresce con il contenuto, così la cornice arriva fino in fondo anche scorrendo */}
          <div className="relative flex min-h-full flex-col">
            {/* cornice a doppio filetto, come una carta stampata */}
            <div className="pointer-events-none absolute inset-3 hidden rounded-sm border border-ink/70 sm:block" />
            <div className="pointer-events-none absolute inset-[18px] hidden rounded-sm border border-ink/25 sm:block" />

            <div className="relative flex items-start justify-between gap-4 px-6 pt-6 sm:px-12 sm:pt-12">
              <div>
                <p className="kicker text-ink-mute">{masthead}</p>
                <h2 className="font-display-wonk mt-1 text-5xl italic sm:text-6xl">
                  Il menù
                </h2>
                {issueLabel && (
                  <p className="kicker mt-2 text-tomato-ink">{issueLabel}</p>
                )}
              </div>
              <button
                type="button"
                onClick={close}
                className="flex size-11 items-center justify-center rounded-full border border-ink/30 text-2xl leading-none transition hover:rotate-90 hover:bg-ink hover:text-paper"
                aria-label="Chiudi il menù"
                autoFocus
              >
                ×
              </button>
            </div>

            <div className="relative grid flex-1 gap-10 px-6 py-8 sm:px-12 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
              <nav aria-label="Portate">
                <ol>
                  {courses.map((c, i) => (
                    <li
                      key={c.slug}
                      className="menu-item"
                      style={{ animationDelay: `${80 + i * 55}ms` }}
                    >
                      <Link
                        href={`/menu/${c.slug}`}
                        onMouseEnter={() => setActive(c.slug)}
                        onFocus={() => setActive(c.slug)}
                        onClick={close}
                        className="group block border-b border-dotted border-ink/25 py-3.5 sm:py-4"
                        style={{ color: active === c.slug ? c.ink : undefined }}
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="kicker w-6 shrink-0 text-ink-mute">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display-wonk text-3xl italic transition-transform duration-300 group-hover:translate-x-1 sm:text-[2.6rem]">
                            {c.course}
                          </span>
                          <span className="leader hidden sm:block" />
                          <span className="ml-auto text-right text-sm font-semibold text-ink sm:ml-0 sm:text-base">
                            {c.section}
                            <span className="kicker ml-3 hidden text-ink-mute md:inline">
                              {c.pages}
                            </span>
                          </span>
                        </span>
                        <span className="mt-1 block pl-9 text-sm text-ink-soft">
                          {c.short}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>

              <aside className="hidden self-start lg:block" aria-live="polite">
                <div>
                  <p
                    className="kicker flex items-center gap-2"
                    style={{ color: activeCourse.ink }}
                  >
                    <CourseIcon course={active} className="size-6" /> Nel piatto
                    di oggi
                  </p>
                  {preview ? (
                    <Link
                      href={`/articoli/${preview.slug}`}
                      onClick={close}
                      className="group mt-4 block"
                    >
                      <div className="img-zoom relative aspect-[4/3] overflow-hidden rounded-sm bg-paper-3">
                        {preview.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview.image}
                            alt={preview.alt}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <p className="font-display mt-4 text-2xl leading-tight">
                        <span className="link-underline">{preview.title}</span>
                      </p>
                    </Link>
                  ) : (
                    <p className="mt-4 text-ink-soft">
                      Questa portata è ancora in preparazione.
                    </p>
                  )}
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                    {activeCourse.description}
                  </p>
                </div>
              </aside>
            </div>

            <div className="relative mt-auto border-t border-ink/20 px-6 py-6 sm:mx-[18px] sm:px-[30px] sm:pb-10">
              <p className="kicker mb-3 text-ink-mute">Il coperto</p>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                {[
                  ["/numeri", "Archivio dei numeri"],
                  ["/cerca", "Cerca negli articoli"],
                  ["/scrivi", "Scrivi alla redazione"],
                  ["/progetto", "Il progetto"],
                  ["/crediti", "Crediti"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
                      className="link-underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
