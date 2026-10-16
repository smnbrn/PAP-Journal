import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, Notice, PageHeader, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Giochi" };
export const instant = false;

export default function GamesPage(props: PageProps<"/redazione/giochi">) {
  return (
    <>
      <PageHeader kicker="Caffè" title="Giochi">
        <Link href="/redazione/giochi/nuovo?tipo=crossword" className="btn btn-ink">
          + Cruciverba
        </Link>
        <Link href="/redazione/giochi/nuovo?tipo=quiz" className="btn btn-outline">
          + Quiz
        </Link>
      </PageHeader>
      <Suspense fallback={<PanelLoading />}>
        <GameList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function GameList({ searchParams }: { searchParams: PageProps<"/redazione/giochi">["searchParams"] }) {
  const { store } = await requireStaff();
  const [games, sp] = await Promise.all([store.listGames(), searchParams]);
  return (
    <>
      {sp.eliminato && <Notice>Gioco eliminato.</Notice>}
      {games.length ? (
        <ul className="divide-y divide-rule rounded-md bg-paper shadow-[0_0_0_1.5px_var(--color-rule)]">
          {games.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
              <span className="kicker w-24 text-ink-mute">{g.kind === "crossword" ? "Cruciverba" : "Quiz"}</span>
              <Link href={`/redazione/giochi/${g.id}`} className="min-w-0 flex-1 font-semibold hover:underline">
                {g.title}
              </Link>
              <StatusPill status={g.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>Nessun gioco ancora.</EmptyState>
      )}
    </>
  );
}
