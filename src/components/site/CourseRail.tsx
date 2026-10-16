import Link from "next/link";
import { courses, nextCourse, previousCourse } from "@/lib/site.config";
import type { CourseSlug } from "@/lib/types";
import { CourseIcon } from "./CourseIcon";

/** Il percorso del pasto: dove sono, cosa ho già «mangiato», cosa arriva dopo. */
export function CourseRail({ current }: { current: CourseSlug }) {
  const index = courses.findIndex((c) => c.slug === current);
  return (
    <nav aria-label="Percorso delle portate" className="scroll-rail -mx-4 -my-3 overflow-x-auto px-4 py-3 sm:mx-0 sm:px-0">
      <ol className="relative flex min-w-max items-start justify-between gap-2 sm:min-w-0">
        <span aria-hidden className="absolute top-5 right-6 left-6 h-px bg-ink/20" />
        <span
          aria-hidden
          className="absolute top-5 left-6 h-[2px] bg-ink transition-all"
          style={{ width: `calc((100% - 3rem) * ${index / (courses.length - 1)})` }}
        />
        {courses.map((c, i) => {
          const on = c.slug === current;
          const done = i < index;
          return (
            <li key={c.slug} className="relative z-10 w-24 shrink-0 sm:w-auto sm:flex-1">
              <Link
                href={`/menu/${c.slug}`}
                aria-current={on ? "page" : undefined}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
                    on ? "text-paper" : done ? "bg-ink text-paper" : "bg-paper text-ink ring-1 ring-ink/30"
                  }`}
                  style={on ? { background: c.color, boxShadow: `0 0 0 5px ${c.wash}` } : undefined}
                >
                  <CourseIcon course={c.slug} className="size-6" />
                </span>
                <span className={`font-display text-base italic leading-none ${on ? "" : "text-ink-soft"}`} style={on ? { color: c.ink } : undefined}>
                  {c.course}
                </span>
                <span className="kicker hidden text-[0.6rem] text-ink-mute md:block">{c.section}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** «Prossima portata»: accompagna il lettore alla rubrica successiva. */
export function NextCourse({ current }: { current: CourseSlug }) {
  const prev = previousCourse(current);
  const next = nextCourse(current);
  return (
    <nav aria-label="Portate vicine" className="grid gap-px overflow-hidden rounded-md bg-ink/15 sm:grid-cols-2">
      {prev ? (
        <Link href={`/menu/${prev.slug}`} className="group bg-paper p-6 transition hover:bg-paper-2 sm:p-8">
          <span className="kicker text-ink-mute">← Portata precedente</span>
          <span className="mt-2 flex items-center gap-3">
            <CourseIcon course={prev.slug} className="size-8" />
            <span className="font-display-wonk text-4xl italic" style={{ color: prev.ink }}>
              {prev.course}
            </span>
          </span>
          <span className="mt-1 block text-ink-soft">{prev.section}</span>
        </Link>
      ) : (
        <Link href="/" className="group bg-paper p-6 transition hover:bg-paper-2 sm:p-8">
          <span className="kicker text-ink-mute">← Torna alla</span>
          <span className="font-display-wonk mt-2 block text-4xl italic">Prima pagina</span>
        </Link>
      )}
      {next ? (
        <Link href={`/menu/${next.slug}`} className="group bg-paper p-6 text-right transition hover:bg-paper-2 sm:p-8">
          <span className="kicker text-ink-mute">Prossima portata →</span>
          <span className="mt-2 flex items-center justify-end gap-3">
            <span className="font-display-wonk text-4xl italic transition-transform group-hover:-translate-x-1" style={{ color: next.ink }}>
              {next.course}
            </span>
            <CourseIcon course={next.slug} className="size-8" />
          </span>
          <span className="mt-1 block text-ink-soft">{next.section}</span>
        </Link>
      ) : (
        <Link href="/numeri" className="group bg-ink p-6 text-right text-paper transition hover:bg-tomato-ink sm:p-8">
          <span className="kicker opacity-70">Il pasto è finito</span>
          <span className="font-display-wonk mt-2 block text-4xl italic">Sfoglia l&apos;archivio →</span>
          <span className="mt-1 block opacity-80">Tutti i numeri del giornale</span>
        </Link>
      )}
    </nav>
  );
}
