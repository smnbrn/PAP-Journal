/**
 * Il sito funziona in due modalità:
 *  - "supabase": database, login e immagini su Supabase (produzione);
 *  - "local": modalità prova, senza servizi esterni. I contenuti vivono in
 *    `.data/db.json` e le immagini in `.data/uploads`. Serve per provare il sito
 *    sul proprio computer; non è adatta alla pubblicazione online.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const backend: "supabase" | "local" =
  supabaseUrl && supabaseKey ? "supabase" : "local";

export const STORAGE_BUCKET = "media";
