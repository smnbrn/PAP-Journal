import Link from "next/link";
import { Suspense } from "react";
import { SubmissionCard } from "@/components/admin/SubmissionCard";
import { EmptyState, Notice, PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import type { SubmissionStatus } from "@/lib/types";

export const metadata = { title: "Contributi dei lettori" };
export const instant = false;

const tabs: { value: SubmissionStatus; label: string }[] = [
  { value: "pending", label: "Da leggere" },
  { value: "published", label: "Pubblicati" },
  { value: "archived", label: "Presi in carico" },
  { value: "rejected", label: "Rifiutati" },
];

const outcomes: Record<string, string> = {
  publish: "Pubblicato sul sito: lo trovi nella scheda «Pubblicati».",
  archive: "Segnato come preso in carico.",
  reject: "Rifiutato: non sarà pubblicato.",
  pending: "Riportato tra i messaggi da leggere.",
  save: "Risposta aggiornata sul sito.",
  delete: "Messaggio eliminato definitivamente.",
};

export default function SubmissionsPage(props: PageProps<"/redazione/contributi">) {
  return (
    <>
      <PageHeader kicker="Posta dei lettori" title="Contributi" />
      <p className="-mt-4 mb-6 max-w-3xl text-ink-soft">
        Niente arriva sul sito senza passare da qui. Domande e lettere si pubblicano con la risposta della redazione; racconti e proposte
        si trasformano in articoli. Prima di pubblicare controlla che non ci siano dati personali o riferimenti a persone riconoscibili.
      </p>
      <Suspense fallback={<PanelLoading />}>
        <SubmissionList searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function SubmissionList({ searchParams }: { searchParams: PageProps<"/redazione/contributi">["searchParams"] }) {
  const { store } = await requireStaff();
  const sp = await searchParams;
  const current = tabs.find((t) => t.value === sp.stato)?.value ?? "pending";
  const all = await store.listSubmissions();
  const list = all.filter((s) => s.status === current);

  const outcome = typeof sp.esito === "string" ? outcomes[sp.esito] : undefined;
  return (
    <>
      {outcome && <Notice>{outcome}</Notice>}
      <nav aria-label="Filtra per stato" className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const count = all.filter((s) => s.status === t.value).length;
          const active = t.value === current;
          return (
            <Link
              key={t.value}
              href={t.value === "pending" ? "/redazione/contributi" : `/redazione/contributi?stato=${t.value}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-ink text-paper" : "shadow-[inset_0_0_0_1.5px_var(--color-rule)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
              }`}
            >
              {t.label} <span className="font-mono opacity-70">{count}</span>
            </Link>
          );
        })}
      </nav>
      {list.length ? (
        <div className="space-y-5">
          {list.map((s) => (
            <SubmissionCard key={`${s.id}-${s.status}-${s.answer ?? ""}`} submission={s} />
          ))}
        </div>
      ) : (
        <EmptyState>{current === "pending" ? "Nessun messaggio da leggere. La casella è vuota!" : "Niente in questa sezione."}</EmptyState>
      )}
    </>
  );
}
