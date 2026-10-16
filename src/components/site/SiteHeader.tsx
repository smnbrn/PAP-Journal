import Link from "next/link";
import { getCurrentIssue, getLatestByCourse, getSettings } from "@/lib/data";
import { issueLabel } from "@/lib/format";
import { courses } from "@/lib/site.config";
import type { CourseSlug } from "@/lib/types";
import { HeaderTitle } from "./HeaderTitle";
import { MenuOverlay, type MenuPreview } from "./MenuOverlay";
import { SearchToggle } from "./SearchToggle";

export async function SiteHeader() {
  const [settings, issue, latest] = await Promise.all([getSettings(), getCurrentIssue(), getLatestByCourse()]);
  const previews: Partial<Record<CourseSlug, MenuPreview>> = {};
  for (const [course, a] of Object.entries(latest)) {
    previews[course as CourseSlug] = { slug: a.slug, title: a.title, image: a.cover_image, alt: a.cover_alt ?? "" };
  }
  const label = issue ? issueLabel(issue) : null;

  return (
    <>
      <a
        href="#contenuto"
        className="sr-only z-50 rounded bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Vai al contenuto
      </a>
      <header className="sticky top-0 z-40 border-b border-ink/80 bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
        <div className="mx-auto grid max-w-[88rem] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 sm:px-6">
          <div className="justify-self-start">
            <MenuOverlay courses={courses} previews={previews} issueLabel={label} masthead={settings.masthead} />
          </div>
          <HeaderTitle masthead={settings.masthead} issueLabel={label} />
          <div className="flex items-center gap-1 justify-self-end sm:gap-2">
            <SearchToggle />
            <Link href="/scrivi" className="btn btn-outline hidden px-4 py-2 text-sm sm:inline-flex">
              Scrivi alla redazione
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
