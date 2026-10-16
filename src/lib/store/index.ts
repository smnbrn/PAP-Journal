import "server-only";
import { backend } from "../env";
import { createPublicClient } from "../supabase/public";
import { LocalStore } from "./local";
import { SupabaseStore } from "./supabase";
import type { PublicActions, ReadStore } from "./types";

/** Archivio per i lettori: vede solo i contenuti pubblicati. */
export function getPublicStore(): ReadStore & PublicActions {
  return backend === "supabase" ? new SupabaseStore(createPublicClient()) : new LocalStore(false);
}
