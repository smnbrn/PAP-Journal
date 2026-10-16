import { Suspense } from "react";
import { SettingsForm, StaffRow } from "@/components/admin/SettingsForm";
import { PageHeader, Panel, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Impostazioni" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader kicker="La testata" title="Impostazioni" />
      <Suspense fallback={<PanelLoading />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}

async function SettingsContent() {
  const { store, staff } = await requireStaff();
  const [settings, members] = await Promise.all([store.getSettings(), store.listStaff().catch(() => null)]);
  return (
    <div className="space-y-8">
      <Panel title="Nome e descrizione del giornale">
        <SettingsForm settings={settings} />
      </Panel>
      <Panel title="La redazione">
        {members ? (
          <>
            <p className="mb-4 max-w-2xl text-sm text-ink-soft">
              Chi crea un account parte «in attesa» e non può modificare nulla finché un amministratore non gli assegna un ruolo. I
              redattori scrivono e pubblicano; gli amministratori gestiscono anche i ruoli. Gli account si creano dal pannello di Supabase
              (Authentication → Users → Add user).
            </p>
            <ul className="divide-y divide-rule">
              {members.map((m) => (
                <StaffRow key={`${m.id}-${m.role}`} member={m} isSelf={m.id === staff.id} canEdit={staff.role === "admin"} />
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            In modalità prova c&apos;è un solo accesso, protetto dalla password in <code>.env.local</code>. Quando collegherai Supabase,
            qui potrai gestire gli account della redazione e i loro ruoli.
          </p>
        )}
      </Panel>
    </div>
  );
}
