import { connection } from "next/server";
import { readLocalUpload } from "@/lib/uploads";

/** Restituisce i file caricati nella modalità prova. */
export async function GET(_request: Request, { params }: RouteContext<"/media/local/[file]">) {
  await connection();
  const { file } = await params;
  const found = await readLocalUpload(file);
  if (!found) return new Response("File non trovato", { status: 404 });
  return new Response(new Uint8Array(found.data), {
    headers: {
      "Content-Type": found.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
