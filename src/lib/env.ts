/**
 * Il sito funziona in tre modalità, scelte dalle variabili d'ambiente:
 *  - "neon": database PostgreSQL (Neon) e accesso della redazione con account
 *    propri, attivo quando c'è `DATABASE_URL` (produzione);
 *  - "supabase": database, login e immagini su Supabase (produzione);
 *  - "local": modalità prova, senza servizi esterni. I contenuti vivono in
 *    `.data/db.json` e le immagini in `.data/uploads`. Serve per provare il sito
 *    sul proprio computer; non è adatta alla pubblicazione online.
 *
 * Attenzione: `DATABASE_URL` esiste solo sul server. Il codice che gira nel
 * browser non deve usare `backend`: per i caricamenti vedi `blobUploads`.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const backend: "neon" | "supabase" | "local" = process.env.DATABASE_URL
  ? "neon"
  : supabaseUrl && supabaseKey
    ? "supabase"
    : "local";

export const STORAGE_BUCKET = "media";

/**
 * I file vanno su Vercel Blob quando il progetto ha un archivio Blob collegato
 * (variabile `BLOB_READ_WRITE_TOKEN`). Il valore viene scritto nel codice del
 * browser in fase di build da `next.config.ts`.
 */
export const blobUploads = process.env.NEXT_PUBLIC_BLOB_UPLOADS === "1";
