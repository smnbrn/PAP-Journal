import "server-only";
import { backend } from "../env";
import { getPool } from "../db";
import { createPublicClient } from "../supabase/public";
import { LocalStore } from "./local";
import { NeonStore } from "./neon";
import { SupabaseStore } from "./supabase";
import type { PublicActions, ReadStore } from "./types";

/** Archivio per i lettori: vede solo i contenuti pubblicati. */
export function getPublicStore(): ReadStore & PublicActions {
  if (backend === "neon") return new NeonStore(getPool(), false);
  if (backend === "supabase") return new SupabaseStore(createPublicClient());
  return new LocalStore(false);
}
