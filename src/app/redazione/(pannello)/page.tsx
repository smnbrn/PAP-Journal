import Link from "next/link";
import { Suspense } from "react";
import { ActionButton } from "@/components/admin/controls";
import { EmptyState, PageHeader, Panel, PanelLoading, StatusPill } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { formatShort, issueLabel } from "@/lib/format";
import { courseBySlug, editorialCalendar } from "@/lib/site.config";
import { importDemo, removeDemo } from "../actions";

export const metadata = { title: "Scrivania" };

export default function Dashboard() {
  return (
    <Suspense fallback={<PanelLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const { staff, store } = await requireStaff();
  const [articles, pending, issues, polls] = await Promise.all([
    store.listArticles({ status: "all" }),
    store.listSubmissions("pending"),
    store.listIssues(),
    store.listPolls(),
  ]);
  const drafts = articles.filter((a) => a.status === "draft");
  const published = articles.length - drafts.length;
  const recent = [...articles].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6);
  const demoCount = articles.filter((a) => a.is_demo).length + issues.filter((i) => i.is_demo).length;
  const nextPlanned = editorialCalendar.find((p) => !issues.some((i) => i.number === p.number && i.status === "published"));

  const stats = [
    { label: "Articoli pubblicati", value: published, href: "/redazione/articoli?stato=published" },
    { label: "Bozze", value: drafts.length, href: "/redazione/articoli?stato=draft" },
    { label: "Contributi da leggere", value: pending.length, href: "/redazione/contributi" },
    { label: "Sondaggi aperti", value: polls.filter((p) => p.status === "open").length, href: "/redazione/sondaggi" },
  ];

  return (
    <>
      <PageHeader kicker="La scrivania" title={`Buon lavoro, ${staff.name.split(" ")[0]}`}>
        <Link href="/redazione/articoli/nuovo" className="btn btn-ink">
          + Nuovo articolo
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-md bg-paper p-4 shadow-[0_0_0_1.5px_var(--color-rule)] transition hover:shadow-[0_0_0_1.5px_var(--color-ink)] sm:p-5"
          >
            <p className="font-display-wonk text-5xl leading-none">{s.value}</p>
            <p className="mt-2 text-sm text-ink-soft group-hover:text-ink">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Ultimi articoli modificati">
          {recent.length ? (
            <ul className="divide-y divide-rule">
              {recent.map((a) => {
                const course = courseBySlug[a.course];
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: course.color }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <Link href={`/redazione/articoli/${a.id}`} className="block truncate font-semibold hover:underline">
                        {a.title}
                      </Link>
                      <p className="text-xs text-ink-mute">
                        {course.course} · {a.author_name} · modificato il {formatShort(a.updated_at)}
                      </p>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState>Nessun articolo ancora. Comincia dal primo!</EmptyState>
          )}
          <Link href="/redazione/articoli" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
            Tutti gli articoli →
          </Link>
        </Panel>

        <div className="space-y-6">
          <Panel title="Posta dei lettori">
            {pending.length ? (
              <ul className="space-y-3">
                {pending.slice(0, 3).map((s) => (
                  <li key={s.id} className="rounded bg-paper-2 p-3 text-sm">
                    <p className="kicker text-ink-mute">{s.kind}</p>
                    <p className="mt-1 line-clamp-2">{s.title || s.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-mute">Nessun messaggio in attesa.</p>
            )}
            <Link href="/redazione/contributi" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Vai alla moderazione →
            </Link>
          </Panel>

          <Panel title="Prossima uscita">
            {nextPlanned ? (
              <>
                <p className="font-display text-2xl">{issueLabel({ number: nextPlanned.number, month: nextPlanned.month })}</p>
                <p className="mt-1 text-sm text-ink-mute">
                  {articles.filter((a) => issues.find((i) => i.id === a.issue_id)?.number === nextPlanned.number).length} articoli assegnati
                </p>
              </>
            ) : (
              <p className="text-sm">Tutti i numeri del calendario sono usciti. Bel lavoro!</p>
            )}
            <Link href="/redazione/numeri" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Gestisci i numeri →
            </Link>
          </Panel>
        </div>
      </div>

      <Panel title="Contenuti dimostrativi" className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <p className="max-w-2xl text-sm text-ink-soft">
            Gli articoli di esempio (con il timbro «Esempio») servono a vedere come funziona il giornale. Quando la redazione è pronta, toglili
            con un clic: gli articoli scritti da voi non vengono toccati.
            {demoCount ? ` Ora ce ne sono ${demoCount} tra articoli e numeri.` : " Ora non ce ne sono."}
          </p>
          <div className="flex flex-wrap gap-3">
            {demoCount ? (
              <ActionButton
                action={removeDemo}
                confirm="Rimuovere tutti i contenuti di esempio (articoli, numeri, sondaggi, giochi e messaggi)? Gli articoli della redazione restano."
                className="btn btn-outline text-tomato-ink"
              >
                Rimuovi gli esempi
              </ActionButton>
            ) : null}
            <ActionButton action={importDemo}>{demoCount ? "Ripristina gli esempi" : "Carica gli esempi"}</ActionButton>
          </div>
        </div>
      </Panel>
    </>
  );
}
