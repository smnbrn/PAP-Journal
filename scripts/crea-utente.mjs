// Crea (o aggiorna) un account della redazione.
//   npm run utente:crea -- mario@scuola.it "Mario Rossi" admin
// Il ruolo è «admin» o «editor» (predefinito: editor). Se l'email esiste già,
// la password e il ruolo vengono aggiornati: è anche il modo per reimpostarla.
// La password si scrive quando richiesto (non resta nella cronologia del terminale).
import { randomBytes, scrypt } from "node:crypto";
import readline from "node:readline";
import pg from "pg";

try {
  process.loadEnvFile(".env.local");
} catch {
  // nessun .env.local: si usano le variabili già presenti
}

const [email, displayName, roleArg = "editor"] = process.argv.slice(2);
if (!email || !email.includes("@") || !["admin", "editor"].includes(roleArg)) {
  console.error('Uso: npm run utente:crea -- email@scuola.it "Nome Cognome" [admin|editor]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL non è impostata (vedi .env.local).");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) process.stdout.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

// Stesso formato di src/lib/password.ts: scrypt$<sale>$<impronta> (base64url).
function hashPassword(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(`scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`),
    ),
  );
}

const password = process.env.PAP_PASSWORD ?? (await askHidden("Password (almeno 10 caratteri): "));
if (password.length < 10) {
  console.error("La password deve avere almeno 10 caratteri.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const { rows } = await client.query(
    `insert into profiles (email, display_name, password_hash, role)
     values ($1, coalesce(nullif($4, ''), split_part($1, '@', 1)), $2, $3)
     on conflict ((lower(email))) do update
       set password_hash = excluded.password_hash,
           role = excluded.role,
           display_name = coalesce(nullif($4, ''), profiles.display_name)
     returning (xmax = 0) as created`,
    [email.trim(), await hashPassword(password), roleArg, displayName?.trim() ?? ""],
  );
  console.log(`${rows[0].created ? "Creato" : "Aggiornato"}: ${email} (${roleArg}).`);
} catch (error) {
  console.error(`Errore: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
