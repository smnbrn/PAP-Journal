import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { backend } from "@/lib/env";
import { saveLocalUpload } from "@/lib/uploads";

/**
 * Caricamento di immagini e PDF nella modalità prova (solo redazione).
 * Con Vercel Blob (o con Supabase) i file vanno direttamente al servizio di archiviazione.
 */
export async function POST(request: Request) {
  if (backend !== "local" || process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          backend === "neon" && !process.env.BLOB_READ_WRITE_TOKEN
            ? "Per caricare file serve un archivio Vercel Blob collegato al progetto (variabile BLOB_READ_WRITE_TOKEN)."
            : "Questo percorso serve solo alla modalità prova: i file vanno su Vercel Blob o su Supabase Storage.",
      },
      { status: 400 },
    );
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
