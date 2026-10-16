"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "../env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Client del browser, usato dalla redazione per caricare immagini e PDF. */
export function getBrowserSupabase() {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}
