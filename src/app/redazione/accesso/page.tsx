import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { WheatMark } from "@/components/site/CourseIcon";
import { getAuthState, localLoginEnabled } from "@/lib/auth";
import { backend } from "@/lib/env";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Accesso redazione", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-ink">
          <WheatMark className="size-8" />
          <span className="font-display-wonk text-3xl">Redazione</span>
        </Link>
        <div className="rounded-md bg-paper p-6 shadow-[0_0_0_1.5px_var(--color-ink),6px_6px_0_var(--color-ink)] sm:p-8">
          <Suspense fallback={<p className="text-ink-mute">Controllo dell&apos;accesso…</p>}>
            <LoginGate />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-ink-mute">
          Quest&apos;area è riservata alla redazione del giornale.{" "}
          <Link href="/" className="underline">
            Torna al sito
          </Link>
        </p>
      </div>
    </main>
  );
}

async function LoginGate() {
  const auth = await getAuthState();
  if (auth.state === "staff") redirect("/redazione");
  if (auth.state === "pending") {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl">Account in attesa</h1>
        <p>
          Hai effettuato l&apos;accesso{auth.email ? ` come ${auth.email}` : ""}, ma il tuo account non è ancora stato abilitato. Chiedi a un
          amministratore della redazione di assegnarti il ruolo di redattore.
        </p>
        <form action={logout}>
          <button className="btn btn-outline">Esci</button>
        </form>
      </div>
    );
  }
  return (
    <>
      <h1 className="font-display text-3xl">Accedi</h1>
      {backend === "local" ? (
        <p className="mt-2 mb-6 text-sm text-ink-mute">
          Modalità prova: il sito non è ancora collegato a Supabase. Usa la password scritta in <code>LOCAL_ADMIN_PASSWORD</code> nel file{" "}
          <code>.env.local</code>.
        </p>
      ) : (
        <p className="mt-2 mb-6 text-sm text-ink-mute">Usa l&apos;email e la password che ti ha creato l&apos;amministratore.</p>
      )}
      {backend === "local" && !localLoginEnabled() ? (
        <p role="alert" className="rounded-md border-2 border-tomato-ink bg-[#f6ddd3] px-4 py-3 text-sm font-semibold text-tomato-ink">
          L&apos;accesso di prova è disattivato: aggiungi <code>LOCAL_ADMIN_PASSWORD</code> (almeno 8 caratteri) al file <code>.env.local</code> e
          riavvia il sito.
        </p>
      ) : (
        <LoginForm mode={backend} />
      )}
    </>
  );
}
