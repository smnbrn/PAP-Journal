import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth";
import { PDF_MAX_BYTES } from "@/lib/upload-limits";

/**
 * Caricamento di immagini e PDF su Vercel Blob (solo redazione).
 * Il browser carica il file direttamente su Blob, quindi nessun limite di
 * dimensione della funzione serverless: questa route si limita a controllare
 * che chi carica sia in redazione e a dare un permesso valido per un solo file.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Vercel Blob non è collegato a questo progetto." }, { status: 400 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const auth = await getAuthState();
        if (auth.state !== "staff") throw new Error("Accesso riservato alla redazione.");
        if (!/^(immagini|pdf)\/[\w\-./]+$/.test(pathname) || pathname.includes("..")) {
          throw new Error("Percorso del file non valido.");
        }
        return {
          allowedContentTypes: pathname.startsWith("pdf/")
            ? ["application/pdf"]
            : ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: PDF_MAX_BYTES,
          addRandomSuffix: false,
          cacheControlMaxAge: 31536000,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
