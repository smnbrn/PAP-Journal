import Link from "next/link";
import type { ReactNode } from "react";

/** Mattoncini grafici comuni dell'area redazione (componenti server). */

export const inputClass =
  "w-full rounded-md border-2 border-ink/20 bg-paper px-3 py-2.5 text-base outline-none transition focus:border-tomato aria-[invalid=true]:border-tomato-ink";

export function PageHeader({
  kicker,
  title,
  children,
  back,
}: {
  kicker?: string;
  title: string;
  children?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-5">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="kicker mb-2 inline-block text-ink-mute hover:text-ink">
            ← {back.label}
          </Link>
        )}
        {kicker && !back && <p className="kicker text-ink-mute">{kicker}</p>}
        <h1 className="font-display mt-1 text-4xl leading-tight sm:text-5xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
        {optional && <span className="font-normal text-ink-mute"> (facoltativo)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-semibold text-tomato-ink">
          {error}
        </p>
      )}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-md bg-paper p-5 shadow-[0_0_0_1.5px_var(--color-rule)] sm:p-6 ${className}`}>
      {title && <h2 className="kicker mb-4 text-ink-mute">{title}</h2>}
      {children}
    </section>
  );
}

const pills: Record<string, string> = {
  published: "bg-forest text-paper",
  open: "bg-forest text-paper",
  draft: "bg-paper-3 text-ink",
  closed: "bg-ink text-paper",
  pending: "bg-saffron text-ink",
  archived: "bg-paper-3 text-ink",
  rejected: "bg-tomato-ink text-paper",
};

const pillLabels: Record<string, string> = {
  published: "Pubblicato",
  open: "Aperto",
  draft: "Bozza",
  closed: "Chiuso",
  pending: "Da leggere",
  archived: "Preso in carico",
  rejected: "Rifiutato",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-wide ${pills[status] ?? "bg-paper-3"}`}>
      {pillLabels[status] ?? status}
    </span>
  );
}

export function Notice({ tone = "ok", children }: { tone?: "ok" | "error" | "info"; children: ReactNode }) {
  const tones = {
    ok: "border-forest bg-[#dce5d6] text-forest",
    error: "border-tomato-ink bg-[#f6ddd3] text-tomato-ink",
    info: "border-ink/30 bg-paper-2 text-ink",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mb-6 rounded-md border-2 px-4 py-3 font-semibold ${tones[tone]}`}>
      {children}
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border-2 border-dashed border-ink/20 px-6 py-10 text-center text-ink-mute">{children}</p>;
}

export function PanelLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Caricamento">
      <div className="h-12 w-2/3 rounded bg-paper-3" />
      <div className="h-4 w-1/2 rounded bg-paper-3" />
      <div className="h-64 rounded bg-paper-2" />
    </div>
  );
}
