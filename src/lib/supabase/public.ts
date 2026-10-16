import { createClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "../env";

/** Client anonimo: legge solo ciò che le regole del database rendono pubblico. */
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
