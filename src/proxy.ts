import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rinnova la sessione Supabase della redazione prima di ogni pagina dell'area
 * riservata. Il controllo dei permessi vero e proprio avviene sul server, in
 * ogni pagina e in ogni azione (vedi src/lib/auth.ts).
 */
export async function proxy(request: NextRequest) {
  // Con Neon l'accesso è gestito da src/lib/auth.ts: non c'è nessuna sessione Supabase da rinnovare.
  if (process.env.DATABASE_URL) return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/redazione/:path*"],
};
