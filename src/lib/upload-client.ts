"use client";
import { backend, STORAGE_BUCKET } from "./env";
import { getBrowserSupabase } from "./supabase/browser";
import { IMAGE_INPUT_MAX_BYTES, IMAGE_MAX_BYTES, IMAGE_MAX_SIDE, IMAGE_QUALITY, mb, PDF_MAX_BYTES } from "./upload-limits";

/**
 * Riduce e comprime le fotografie prima di caricarle: una foto del telefono
 * pesa 3-8 MB, sul sito ne bastano 150-400 KB senza differenze visibili.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", IMAGE_QUALITY));
    // Se il browser non sa produrre WebP, o il risultato non è più leggero, si tiene l'originale.
    if (!blob || blob.type !== "image/webp" || (scale === 1 && blob.size >= file.size)) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadFile(original: File, folder: "immagini" | "pdf"): Promise<string> {
  const allowed = folder === "pdf" ? ["application/pdf"] : ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(original.type)) {
    throw new Error(folder === "pdf" ? "Scegli un file PDF." : "Scegli un'immagine JPG, PNG, WebP o GIF.");
  }
  if (folder === "pdf" && original.size > PDF_MAX_BYTES) {
    throw new Error(
      `Il PDF pesa ${mb(original.size)}: il massimo è ${mb(PDF_MAX_BYTES)}. Esportalo di nuovo scegliendo «Dimensione file minima» o «Per il web» (in Word: Salva con nome → PDF → Dimensioni minime).`,
    );
  }
  if (folder === "immagini" && original.size > IMAGE_INPUT_MAX_BYTES) {
    throw new Error(`L'immagine pesa ${mb(original.size)}: il massimo è ${mb(IMAGE_INPUT_MAX_BYTES)}.`);
  }
  const file = folder === "pdf" ? original : await shrinkImage(original);
  if (folder === "immagini" && file.size > IMAGE_MAX_BYTES) {
    throw new Error(
      file.type === "image/gif"
        ? `La GIF pesa ${mb(file.size)}: il massimo è ${mb(IMAGE_MAX_BYTES)}. Usa una foto JPG o PNG, che il sito riduce da solo.`
        : `L'immagine pesa ancora ${mb(file.size)} dopo la riduzione: il massimo è ${mb(IMAGE_MAX_BYTES)}.`,
    );
  }

  if (backend === "local") {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/caricamenti", { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Caricamento non riuscito.");
    return json.url as string;
  }

  const supabase = getBrowserSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const now = new Date();
  const path = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    throw new Error(
      error.message.includes("row-level security")
        ? "Permesso negato: il tuo account non è abilitato a caricare file."
        : `Caricamento non riuscito: ${error.message}`,
    );
  }
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
