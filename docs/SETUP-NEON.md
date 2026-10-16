# Mettere online «Pane al Pane» con Neon e Vercel Blob

Alternativa a [SETUP-SUPABASE.md](SETUP-SUPABASE.md). Servono tre servizi, tutti con un piano gratuito:

- **Neon**: database PostgreSQL;
- **Vercel**: pubblicazione del sito **e** archivio di immagini e PDF (Vercel Blob);
- nessun servizio per l'accesso: gli account della redazione stanno nello stesso database.

Meglio creare gli account con un indirizzo della scuola o della redazione, non personale.

Tempo previsto: circa 30 minuti.

> **Cosa cambia rispetto a Supabase.** Il sito sceglie da solo il database: se esiste la variabile `DATABASE_URL` usa Neon, altrimenti Supabase, altrimenti la modalità prova. Con Neon non ci sono le regole RLS: chi può leggere cosa lo decide il codice del sito (`src/lib/store/neon.ts`). L'accesso della redazione usa email e password salvate (cifrate con scrypt) nella tabella `profiles`.

---

## 1. Creare il progetto Neon

1. Vai su <https://neon.com>, crea un account e poi **New project**.
2. Nome: `pane-al-pane`. Regione: una europea (per esempio **Frankfurt**).
3. Apri **Connect** e copia l'indirizzo **con «Connection pooling» attivo** (nel nome host compare `-pooler`). Ha la forma `postgresql://utente:password@ep-…-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require`. Sarà `DATABASE_URL`.

> Sul piano gratuito il database si «addormenta» dopo 5 minuti senza visite e si risveglia da solo alla visita successiva (la prima pagina può impiegare un secondo in più). Non serve fare niente.

## 2. Creare le tabelle

Sul tuo computer, nella cartella del sito:

```
npm install
cp .env.example .env.local
```

Apri `.env.local`, incolla `DATABASE_URL=…` e (per il passo 4) una `SESSION_SECRET` casuale. Per generarla:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Poi:

```
npm run db:migrate
```

Deve scrivere `› 001_schema.sql … ok` e «Database pronto.». Si può ripetere senza danni.

## 3. Creare gli account della redazione

```
npm run utente:crea -- redazione@esempio.it "Nome Cognome" admin
```

Ti chiede la password (almeno 10 caratteri, non si vede mentre la scrivi). Per i redattori usa `editor` al posto di `admin`. Per **reimpostare una password** basta rilanciare lo stesso comando con la stessa email.

- **Redattore** (`editor`): scrive, pubblica, modera, gestisce numeri, sondaggi e giochi.
- **Amministratore** (`admin`): tutto quello del redattore, più i ruoli (Redazione → Impostazioni → La redazione).

Gli account si creano solo da qui: il sito non ha una pagina di registrazione.

## 4. Pubblicare su Vercel

1. Su <https://vercel.com> crea un account, poi **Add New → Project** e importa il repository.
2. In **Settings → Environment Variables** aggiungi:
   - `DATABASE_URL`: l'indirizzo di Neon del passo 1;
   - `SESSION_SECRET`: la stringa casuale del passo 2 (almeno 32 caratteri; **non cambiarla** dopo: chi è collegato dovrebbe rifare l'accesso).
3. **Storage → Create Database → Blob**, nome `pane-al-pane-media`, accesso **Public**. Collegalo al progetto: Vercel aggiunge da solo `BLOB_READ_WRITE_TOKEN`.
4. **Deploy**. (Le variabili vanno impostate *prima* del deploy: il collegamento con Blob viene letto durante la costruzione del sito. Se colleghi Blob dopo, premi **Redeploy**.)

## 5. Primo giro di prova

Apri `https://<il-tuo-sito>/redazione`, entra, e controlla: un articolo salvato, una foto caricata (l'immagine deve comparire nell'articolo), un voto a un sondaggio, un messaggio dal modulo «Scrivi alla redazione».

## Limiti da conoscere

- **Neon gratis**: 1 GB di database e 100 ore di calcolo al mese per progetto. Per un giornale scolastico sono ampiamente sufficienti.
- **Vercel Blob gratis**: spazio e trasferimento limitati e mensili (vedi la pagina prezzi di Vercel). Le foto vengono ridotte nel browser prima del caricamento e i PDF hanno un tetto di 20 MB, come con Supabase.
- **Sessioni**: durano 7 giorni. Cambiare la password di un account chiude le sue sessioni; per toglierlo subito dalla redazione, mettilo in attesa da Impostazioni (ruolo `pending`).
- **Tentativi di accesso**: ogni errore rallenta la risposta di mezzo secondo, ma non c'è un blocco dopo N tentativi. Usa password lunghe.

## Passare da Supabase a Neon (o tornare indietro)

I contenuti non si spostano da soli. Con un sito già in uso: esporta le tabelle da Supabase (SQL Editor → `copy … to` oppure *Table Editor → Export*), importale in Neon dopo `npm run db:migrate`, e sposta i file di `storage/media` su Blob aggiornando gli indirizzi nelle colonne `cover_image`, `cover_alt`/`pdf_url` e nel testo degli articoli. Per un sito appena nato è più semplice ripartire da zero.
