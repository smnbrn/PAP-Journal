import Link from "next/link";
import { Suspense } from "react";
import { EmptyState, Notice, PageHeader, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Sondaggi" };
export const instant = false;

export default function PollsPage(props: PageProps<"/redazione/sondaggi">) {
  return (
    <>
      <PageHeader kicker="Caffè" title="Sondaggi">
        <Link href="/redazione/sondaggi/nuovo" className="btn btn-ink">
          + Nuovo sondaggio
        </Link>
      </PageHeader>
      <Suspense fallback={<PanelLoading />}>
        <PollList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function PollList({ searchParams }: { searchParams: PageProps<"/redazione/sondaggi">["searchParams"] }) {
  const { store } = await requireStaff();
  const [polls, sp] = await Promise.all([store.listPolls(), searchParams]);
  const results = await Promise.all(polls.map((p) => store.getPollResults(p.id).catch(() => ({ total: 0, counts: {} }))));
  return (
    <>
      {sp.eliminato && <Notice>Sondaggio eliminato.</Notice>}
      {polls.length ? (
        <ul className="divide-y divide-rule rounded-md bg-paper shadow-[0_0_0_1.5px_var(--color-rule)]">
          {polls.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
              <Link href={`/redazione/sondaggi/${p.id}`} className="min-w-0 flex-1 font-semibold hover:underline">
                {p.question}
              </Link>
              <span className="font-mono text-sm text-ink-mute">
                {results[i].total} vot{results[i].total === 1 ? "o" : "i"}
              </span>
              <StatusPill status={p.status} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>Nessun sondaggio. Creane uno per il prossimo Caffè!</EmptyState>
      )}
    </>
  );
}
