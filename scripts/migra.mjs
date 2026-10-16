// Applica le migrazioni di neon/migrations/ al database indicato da DATABASE_URL.
// Si può ripetere senza danni: ogni file usa «if not exists» / «create or replace».
//   npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // nessun .env.local: si usano le variabili già presenti
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL non è impostata. Copiala da Neon (Connect → pooled connection) in .env.local.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "neon", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  for (const file of files) {
    process.stdout.write(`› ${file} … `);
    await client.query("begin");
    try {
      await client.query(readFileSync(path.join(dir, file), "utf8"));
      await client.query("commit");
      console.log("ok");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }
  console.log("\nDatabase pronto.");
} catch (error) {
  console.error(`\nErrore: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
