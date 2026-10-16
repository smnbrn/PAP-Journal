import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { backend } from "./env";
import { LocalStore } from "./store/local";
import { SupabaseStore } from "./store/supabase";
import type { AdminStore } from "./store/types";
import { createServerSupabase } from "./supabase/server";

export type Staff = {
  id: string;
  name: string;
  email: string | null;
  role: "editor" | "admin";
};

export type AuthState =
  | { state: "staff"; staff: Staff }
  | { state: "pending"; email: string | null }
  | { state: "anonymous" };

// ─── Modalità prova: una password locale definita in .env.local ─────────────
const LOCAL_COOKIE = "pap_redazione";
const LOCAL_SESSION_HOURS = 12;

export function localLoginEnabled() {
  return (process.env.LOCAL_ADMIN_PASSWORD ?? "").length >= 8;
}

function localSecret() {
  return `${process.env.LOCAL_SESSION_SECRET ?? ""}|${process.env.LOCAL_ADMIN_PASSWORD ?? ""}`;
}

function sign(value: string) {
  return createHmac("sha256", localSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkLocalPassword(password: string) {
  if (!localLoginEnabled()) return false;
  // Confronto tra impronte di uguale lunghezza, a tempo costante.
  return safeEqual(sign(`pw:${password}`), sign(`pw:${process.env.LOCAL_ADMIN_PASSWORD}`));
}

export async function startLocalSession() {
  const expires = Date.now() + LOCAL_SESSION_HOURS * 3600_000;
  const payload = `local-admin:${expires}`;
  (await cookies()).set(LOCAL_COOKIE, `${expires}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOCAL_SESSION_HOURS * 3600,
  });
}

async function readLocalSession() {
  if (!localLoginEnabled()) return false;
  const raw = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!raw) return false;
  const [expires, signature] = raw.split(".");
  await connection();
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(`local-admin:${expires}`));
}

// ─── Stato di accesso ──────────────────────────────────────────────────────
export const getAuthState = cache(async (): Promise<AuthState> => {
  if (backend === "local") {
    return (await readLocalSession())
      ? { state: "staff", staff: { id: "local", name: "Redazione (prova)", email: null, role: "admin" } }
      : { state: "anonymous" };
  }
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "anonymous" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "editor" || profile?.role === "admin") {
    return {
      state: "staff",
      staff: {
        id: user.id,
        name: profile.display_name || user.email || "Redazione",
        email: user.email ?? null,
        role: profile.role,
      },
    };
  }
  return { state: "pending", email: user.email ?? null };
});

/**
 * Da chiamare all'inizio di ogni pagina e di ogni azione della redazione.
 * Se l'utente non è autorizzato lo rimanda alla pagina di accesso.
 */
export async function requireStaff(): Promise<{ staff: Staff; store: AdminStore }> {
  const auth = await getAuthState();
  if (auth.state !== "staff") redirect("/redazione/accesso");
  const store =
    backend === "supabase" ? new SupabaseStore(await createServerSupabase()) : new LocalStore(true);
  return { staff: auth.staff, store };
}

export async function signOut() {
  if (backend === "local") {
    (await cookies()).delete(LOCAL_COOKIE);
    return;
  }
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}
