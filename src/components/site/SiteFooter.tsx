import Link from "next/link";
import { getSettings } from "@/lib/data";
import { courses } from "@/lib/site.config";
import { CourseIcon, WheatMark } from "./CourseIcon";

export async function SiteFooter() {
  const settings = await getSettings();
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-[88rem] px-6 pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <WheatMark className="h-10 w-10 text-saffron" />
            <p className="font-display-wonk mt-4 text-5xl leading-none sm:text-6xl">{settings.masthead}</p>
            <p className="font-display mt-2 text-xl italic text-paper/80">{settings.tagline}</p>
            <p className="mt-6 max-w-md leading-relaxed text-paper/75">{settings.about}</p>
          </div>

          <nav aria-label="Rubriche">
            <p className="kicker mb-4 text-paper/60">Le portate</p>
            <ul className="space-y-2.5">
              {courses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/menu/${c.slug}`} className="group flex items-center gap-3">
                    <CourseIcon course={c.slug} className="size-5 text-saffron" />
                    <span className="link-underline font-semibold">{c.course}</span>
                    <span className="text-sm text-paper/60">{c.section}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="kicker mb-4 text-paper/60">La scuola</p>
            <p className="font-semibold">{settings.school_name}</p>
            <p className="text-paper/75">Sedi di {settings.school_sites}</p>
            <p className="text-paper/75">Anno scolastico {settings.school_year}</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <Link href="/numeri" className="link-underline">
                  Archivio dei numeri
                </Link>
              </li>
              <li>
                <Link href="/progetto" className="link-underline">
                  Il progetto e la redazione
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="link-underline">
                  Privacy e regole di pubblicazione
                </Link>
              </li>
              <li>
                <Link href="/redazione" className="link-underline">
                  Area redazione
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/20 pt-6 text-sm text-paper/60 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">{settings.footer_note}</p>
          <p className="shrink-0">
            {settings.masthead} · a.s. {settings.school_year}
          </p>
        </div>
      </div>
    </footer>
  );
}
