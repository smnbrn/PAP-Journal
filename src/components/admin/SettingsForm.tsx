"use client";
import { useActionState } from "react";
import { saveSettings, setStaffRole, type FormState } from "@/app/redazione/actions";
import type { Settings, StaffMember } from "@/lib/types";
import { FormMessage, useFormAction } from "./controls";
import { Field, inputClass } from "./ui";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { state, pending, onSubmit } = useFormAction(saveSettings);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="masthead" label="Nome della testata" error={e.masthead} hint="Il nome è provvisorio? Cambialo qui: si aggiorna in tutto il sito.">
          <input id="masthead" name="masthead" required maxLength={80} defaultValue={settings.masthead} aria-invalid={!!e.masthead} className={`${inputClass} font-display text-xl`} />
        </Field>
        <Field id="tagline" label="Sottotitolo della testata">
          <input id="tagline" name="tagline" maxLength={120} defaultValue={settings.tagline} className={inputClass} />
        </Field>
        <Field id="school_name" label="Nome della scuola">
          <input id="school_name" name="school_name" maxLength={120} defaultValue={settings.school_name} className={inputClass} />
        </Field>
        <Field id="school_sites" label="Sedi">
          <input id="school_sites" name="school_sites" maxLength={120} defaultValue={settings.school_sites} className={inputClass} />
        </Field>
        <Field id="school_year" label="Anno scolastico">
          <input id="school_year" name="school_year" maxLength={20} defaultValue={settings.school_year} className={inputClass} />
        </Field>
      </div>
      <Field id="about" label="Chi siamo" hint="Usato nel piè di pagina e nelle anteprime dei link.">
        <textarea id="about" name="about" rows={3} maxLength={1200} defaultValue={settings.about} className={inputClass} />
      </Field>
      <Field id="footer_note" label="Nota a piè di pagina">
        <textarea id="footer_note" name="footer_note" rows={3} maxLength={1200} defaultValue={settings.footer_note} className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className="btn btn-ink">
        {pending ? "Salvataggio…" : "Salva le impostazioni"}
      </button>
    </form>
  );
}

const roles = { pending: "In attesa (nessun accesso)", editor: "Redattore", admin: "Amministratore" };

export function StaffRow({ member, isSelf, canEdit }: { member: StaffMember; isSelf: boolean; canEdit: boolean }) {
  const [state, action, pending] = useActionState(setStaffRole, {} as FormState);
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">
          {member.display_name || member.email}
          {isSelf && <span className="font-normal text-ink-mute"> (tu)</span>}
        </p>
        {member.display_name && <p className="truncate text-sm text-ink-mute">{member.email}</p>}
      </div>
      {canEdit && !isSelf ? (
        <form action={action} className="flex items-center gap-2">
          <input type="hidden" name="id" value={member.id} />
          <label className="sr-only" htmlFor={`role-${member.id}`}>
            Ruolo di {member.email}
          </label>
          <select id={`role-${member.id}`} name="role" defaultValue={member.role} className={`${inputClass} py-1.5 text-sm`}>
            {Object.entries(roles).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <button disabled={pending} className="btn btn-outline px-3 py-1.5 text-sm">
            {pending ? "…" : "Salva"}
          </button>
        </form>
      ) : (
        <span className="text-sm">{roles[member.role]}</span>
      )}
      {state.message && (
        <p role="status" className={`w-full text-sm font-semibold ${state.ok ? "text-forest" : "text-tomato-ink"}`}>
          {state.message}
        </p>
      )}
    </li>
  );
}
