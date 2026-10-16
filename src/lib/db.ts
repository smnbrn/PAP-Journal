import "server-only";
import { Pool, types, type PoolClient } from "pg";

/**
 * Connessione a PostgreSQL (Neon). Usa l'indirizzo «pooled» di Neon
 * (quello con `-pooler` nel nome host): su Vercel ogni richiesta può avviare
 * una nuova istanza e il pooler evita di esaurire le connessioni.
 */
const ISO_TZ_OIDS = new Set([1114, 1184]); // timestamp, timestamptz
const DATE_OID = 1082;

// Restituisce date e orari come testo, come faceva l'API di Supabase: i
// componenti del sito si aspettano stringhe, non oggetti Date.
const typeParsers = {
  getTypeParser(oid: number, format?: "text" | "binary") {
    if (oid === DATE_OID) return (value: string) => value;
    if (ISO_TZ_OIDS.has(oid)) return (value: string) => new Date(value).toISOString();
    return types.getTypeParser(oid, format as "text");
  },
};

const globalForPool = globalThis as unknown as { __papPool?: Pool };

export function getPool(): Pool {
  if (!globalForPool.__papPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL non è impostata.");
    globalForPool.__papPool = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_MAX) || 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000, // Neon può impiegare qualche secondo a risvegliarsi
      types: typeParsers,
    });
  }
  return globalForPool.__papPool;
}

/** Esegue `fn` dentro una transazione: o va tutto a buon fine o non cambia nulla. */
export async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
