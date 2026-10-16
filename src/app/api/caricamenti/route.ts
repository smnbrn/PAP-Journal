import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { backend } from "@/lib/env";
import { saveLocalUpload } from "@/lib/uploads";

/**
 * Caricamento di immagini e PDF nella modalità prova (solo redazione).
 * Con Supabase configurato i file vanno direttamente su Supabase Storage.
 */
export async function POST(request: Request) {
  if (backend !== "local") {
    return NextResponse.json({ error: "Con Supabase i file si caricano su Supabase Storage." }, { status: 400 });
  }
  const auth = await getAuthState();
  if (auth.state !== "staff") return NextResponse.json({ error: "Accesso riservato alla redazione." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nessun file ricevuto." }, { status: 400 });
  try {
    return NextResponse.json({ url: await saveLocalUpload(file) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
