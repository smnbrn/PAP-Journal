# Mettere online «Pane al Pane»

Servono due account gratuiti: **Supabase** (database, accesso della redazione, immagini e PDF) e **Vercel** (pubblicazione del sito). Meglio crearli con un indirizzo della scuola o della redazione, non personale, così restano alla scuola anche quando cambiano gli studenti.

Tempo previsto: circa 30 minuti.

---

## 1. Creare il progetto Supabase

1. Vai su <https://supabase.com>, crea un account e poi **New project**.
2. Nome: per esempio `pane-al-pane`. Regione: **Europe (Frankfurt)** o un'altra regione europea.
3. Scegli una password del database robusta e conservala in un posto sicuro (non serve al sito, ma serve all'amministratore).
4. Piano: **Free**.

> Nota: sul piano gratuito un progetto che resta inattivo per una settimana viene messo in pausa. Si riattiva con un clic dal pannello di Supabase. Durante l'anno scolastico, con il sito visitato, non succede.

## 2. Creare tabelle e regole di sicurezza

Nel pannello Supabase apri **SQL Editor → New query**. Copia e incolla, **uno alla volta e in quest'ordine**, il contenuto dei tre file della cartella `supabase/migrations/`, premendo **Run** dopo ciascuno:

1. `20261016000000_schema.sql` (tabelle e funzioni)
2. `20261016000100_security.sql` (chi può leggere e scrivere cosa)
3. `20261016000200_storage.sql` (spazio per immagini e PDF)

Ognuno deve terminare con «Success. No rows returned».

## 3. Chiudere le registrazioni pubbliche

Il sito non ha una pagina di registrazione, ma è bene chiuderle anche su Supabase:

- **Authentication → Sign In / Providers** (o «Settings»): disattiva **Allow new users to sign up**.
- Lascia attivo il provider **Email**.

## 4. Creare gli account della redazione

1. **Authentication → Users → Add user → Create new user**.
2. Inserisci email e password provvisoria, spunta **Auto Confirm User**.
3. Ripeti per ogni membro della redazione.

Ogni nuovo account parte «in attesa»: può accedere ma non vede né modifica nulla.

## 5. Nominare il primo amministratore

Nel **SQL Editor** esegui, sostituendo l'email:

```sql
update public.profiles set role = 'admin' where email = 'redazione@esempio.it';
```

Da quel momento l'amministratore può assegnare i ruoli agli altri direttamente dal sito: **Redazione → Impostazioni → La redazione**.

- **Redattore**: scrive, pubblica, modera, gestisce numeri, sondaggi e giochi.
- **Amministratore**: tutto quello del redattore, più la gestione dei ruoli.

## 6. Copiare le chiavi

**Project Settings → API Keys** (o «Data API»). Servono due valori:

- **Project URL**, per esempio `https://abcdefgh.supabase.co`
- **Publishable key** (`sb_publishable_…`), oppure la «anon public key» nei progetti più vecchi.

⚠️ Non usare mai la **secret key** / **service_role key**: al sito non serve e non va messa da nessuna parte.

Per provare in locale con Supabase, inseriscile in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
LOCAL_ADMIN_PASSWORD=
```

## 7. Pubblicare su Vercel

1. Metti il codice su un repository GitHub (privato va benissimo).
2. Su <https://vercel.com> crea un account (piano **Hobby**, gratuito) e scegli **Add New → Project**, poi importa il repository.
3. In **Environment Variables** aggiungi `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con i valori del punto 6. Non aggiungere `LOCAL_ADMIN_PASSWORD`.
4. Premi **Deploy**. Dopo un paio di minuti il sito è online a un indirizzo tipo `pane-al-pane.vercel.app`.
5. Su Supabase, in **Authentication → URL Configuration**, imposta **Site URL** con l'indirizzo del sito.

Se la scuola ha un dominio (per esempio `giornale.nomescuola.edu.it`), si collega da **Vercel → Settings → Domains** seguendo le istruzioni per il record DNS.

> Il piano Hobby di Vercel è pensato per uso non commerciale: un giornale scolastico rientra in questo uso.

## 8. Primo accesso e contenuti

1. Apri `https://…/redazione`, entra con l'account amministratore.
2. Il database è vuoto: se vuoi vedere il sito con gli esempi, nella **Scrivania** premi **Carica gli esempi**.
3. Quando la redazione è pronta, premi **Rimuovi gli esempi** e crea il Numero 1 da **Numeri**.

## Domande frequenti

**Ho modificato un articolo ma il sito non cambia.** Le modifiche compaiono subito dopo il salvataggio. Se una pagina era aperta da prima, ricaricala.

**Ho dimenticato la password.** L'amministratore può reimpostarla da Supabase → Authentication → Users → (utente) → «Send password recovery» oppure creando una nuova password.

**Quanto spazio c'è?** Il piano gratuito di Supabase include 1 GB per i file e 500 MB per il database. Il sito riduce ogni foto prima di caricarla (al massimo 1600 pixel sul lato lungo, formato WebP: di solito 150-400 KB invece dei 3-8 MB di una foto del telefono) e accetta PDF fino a 20 MB. Stima per un numero: circa 25 immagini (8 MB) più il PDF (5-20 MB). Sette numeri occupano quindi tra 100 e 200 MB, cioè il 10-20% dello spazio. I testi degli articoli occupano pochi MB. Se il PDF supera i 20 MB, esportalo di nuovo con «Dimensione file minima». Lo spazio usato si vede in Supabase → Project Settings → Usage. Le immagini sostituite o degli articoli eliminati restano nell'archivio: a fine anno si possono cancellare da Storage → media.

**Si può cambiare il nome del giornale?** Sì: Redazione → Impostazioni → Nome della testata. Si aggiorna in tutto il sito.
