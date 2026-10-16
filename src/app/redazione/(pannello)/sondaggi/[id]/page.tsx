import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmForm } from "@/components/admin/controls";
import { PollEditor } from "@/components/admin/PollEditor";
import { Notice, PageHeader, Panel, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deletePoll } from "../../../actions";

export const metadata = { title: "Modifica sondaggio" };
export const instant = false;

export default function EditPollPage(props: PageProps<"/redazione/sondaggi/[id]">) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditPoll {...props} />
    </Suspense>
  );
}

async function EditPoll({ params, searchParams }: PageProps<"/redazione/sondaggi/[id]">) {
  const { store } = await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const poll = await store.getPoll(id).catch(() => null);
  if (!poll) notFound();
  const [issues, results] = await Promise.all([store.listIssues(), store.getPollResults(poll.id)]);

  return (
    <>
      <PageHeader title={poll.question} back={{ href: "/redazione/sondaggi", label: "Sondaggi" }} />
      {sp.salvato && <Notice>Sondaggio salvato.</Notice>}
      <Panel title={`Risultati · ${results.total} vot${results.total === 1 ? "o" : "i"}`} className="mb-8">
        <ul className="space-y-3">
          {poll.options.map((o) => {
            const n = results.counts[o.id] ?? 0;
            const pct = results.total ? Math.round((n / results.total) * 100) : 0;
            return (
              <li key={o.id}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold">{o.label}</span>
                  <span className="font-mono">
                    {pct}% · {n}
                  </span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-paper-3">
                  <div className="h-full rounded-full bg-forest" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <PollEditor key={JSON.stringify(poll)} poll={poll} issues={issues} hasVotes={results.total > 0} />
      <div className="mt-12 flex justify-end border-t border-rule pt-6">
        <ConfirmForm action={deletePoll} id={poll.id} message="Eliminare il sondaggio e tutti i suoi voti?">
          Elimina sondaggio
        </ConfirmForm>
      </div>
    </>
  );
}
