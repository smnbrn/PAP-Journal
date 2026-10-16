import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./store/local";
import { IMAGE_MAX_BYTES, mb, PDF_MAX_BYTES } from "./upload-limits";

/** Caricamenti della modalità prova: file salvati in `.data/uploads`. */
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export async function saveLocalUpload(file: File) {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Formato non supportato: usa JPG, PNG, WebP, GIF oppure PDF.");
  const max = ext === "pdf" ? PDF_MAX_BYTES : IMAGE_MAX_BYTES;
  if (file.size > max) throw new Error(`Il file supera ${mb(max)}.`);
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/media/local/${name}`;
}

export async function readLocalUpload(name: string) {
  // Solo nomi generati dal sito: niente percorsi, niente sorprese.
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf)$/.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop()!;
    const type = Object.entries(ALLOWED_TYPES).find(([, e]) => e === ext)![0];
    return { data, type };
  } catch {
    return null;
  }
}
