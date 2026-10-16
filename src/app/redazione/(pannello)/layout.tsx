import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { WheatMark } from "@/components/site/CourseIcon";
import { requireStaff } from "@/lib/auth";
import { backend } from "@/lib/env";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Redazione", template: "%s · Redazione" },
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: LayoutProps<"/redazione">) {
  return (
    <div className="min-h-dvh bg-paper-2/60 lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 lg:px-5 lg:pt-6 lg:pb-6">
          <Link href="/redazione" className="flex items-center gap-2">
            <WheatMark className="size-6 text-saffron" />
            <span className="font-display-wonk text-2xl">Redazione</span>
          </Link>
          <Link href="/" className="kicker text-paper/70 hover:text-paper lg:hidden">
            Vedi il sito ↗
          </Link>
        </div>
        <div className="px-3 pb-3 lg:flex-1 lg:px-3">
          <Suspense fallback={<AdminNav />}>
            <NavWithCount />
          </Suspense>
        </div>
        <div className="hidden border-t border-paper/15 px-5 py-5 text-sm lg:block">
          <Suspense fallback={null}>
            <StaffBox />
          </Suspense>
          <Link href="/" className="mt-4 block text-paper/70 hover:text-paper">
            Vedi il sito ↗
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        {backend === "local" && (
          <p className="border-b border-saffron-ink/30 bg-saffron/40 px-4 py-2 text-sm sm:px-8">
            <strong>Modalità prova.</strong> I contenuti sono salvati solo su questo computer. Per pubblicare online collega Supabase (vedi
            README).
          </p>
        )}
        <main id="contenuto" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {children}
        </main>
        <div className="border-t border-rule px-4 py-6 text-sm lg:hidden">
          <Suspense fallback={null}>
            <StaffBox dark={false} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function NavWithCount() {
  const { store } = await requireStaff();
  const pending = await store.listSubmissions("pending").then((s) => s.length).catch(() => 0);
  return <AdminNav pending={pending} />;
}

async function StaffBox({ dark = true }: { dark?: boolean }) {
  const { staff } = await requireStaff();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{staff.name}</p>
        <p className={`kicker ${dark ? "text-paper/60" : "text-ink-mute"}`}>{staff.role === "admin" ? "Amministratore" : "Redattore"}</p>
      </div>
      <form action={logout}>
        <button className={`rounded-full px-3 py-1 text-sm font-semibold ${dark ? "bg-paper/10 hover:bg-paper/20" : "bg-paper-3 hover:bg-paper-2"}`}>
          Esci
        </button>
      </form>
    </div>
  );
}
