# Pane al Pane: riepilogo della consegna

## 1. Cosa è stato realizzato

Una piattaforma web completa e funzionante, non un prototipo.

**Il sito pubblico**
- **Prima pagina:** testata, numero del mese, articolo d'apertura con «In questo numero» e il menù interattivo delle sei portate (passando sopra una portata compare l'anteprima). Poi gli ultimi articoli, la doppia pagina «Dal campo al piatto», la Terza Pagina, le domande dei lettori, il sondaggio, i giochi e l'archivio dei sette numeri.
- **Navigazione a menù:** la carta «Il menù» si apre dal pulsante in alto. Ogni portata (Aperitivo, Primo, Secondo, Contorno, Dessert, Caffè) ha il suo colore, la sua icona disegnata e la sua pagina, con il filtro per numero e il passaggio alla portata successiva.
- **Articoli** pensati per la lettura lunga: barra di avanzamento, condivisione con il pulsante nativo del telefono, articoli correlati. «Dal campo al piatto» ha un'impaginazione propria: a sinistra il campo (agraria), a destra il piatto (cucina), con la scheda della pianta e la ricetta stampabile.
- **Archivio dei numeri** con il PDF da sfogliare e scaricare, oltre a ricerca, cruciverba e quiz giocabili.
- **Sondaggi:** i risultati si vedono dopo il voto, un voto per persona e anonimo.
- **Modulo «Scrivi alla redazione»:** niente viene pubblicato senza approvazione.

**L'area redazione** (`/redazione`, protetta da accesso)
- **Scrivania** con riepilogo, ultimi articoli, posta in arrivo e prossima uscita.
- **Articoli:** elenco con ricerca e filtri, editor comodo per i testi lunghi (titoletti, grassetto, elenchi, citazioni, link, immagini con descrizione obbligatoria) e caricamento delle foto, che il sito ridimensiona da solo. Si possono salvare bozze, pubblicare, ritirare, vedere l'anteprima ed eliminare. Per «Dal campo al piatto» c'è una scheda dedicata.
- **Numeri:** si crea ciascun numero, si caricano copertina e PDF e si decide quando pubblicarlo. Gli articoli di un numero non ancora pubblicato restano nascosti.
- **Contributi dei lettori:** si leggono, si pubblicano con la risposta, si rifiutano. Racconti e proposte si trasformano in articolo con un clic.
- **Sondaggi** con i risultati e **giochi**: il cruciverba si crea da solo scrivendo «PAROLA - definizione», il quiz si compone domanda per domanda.
- **Impostazioni:** il nome della testata (è provvisorio, si cambia qui e cambia in tutto il sito) e i ruoli della redazione.
- Pubblicando, il sito si aggiorna subito.

**Contenuti dimostrativi**
- Due numeri d'esempio (zero e uno), 15 articoli, un cruciverba, un quiz, due sondaggi e alcune lettere, tutti marcati «Esempio».
- Le illustrazioni sono disegni originali, senza problemi di licenza.
- Si tolgono con un pulsante dalla Scrivania.

**Verifiche fatte**
- Ho provato davvero tutto il percorso: accesso, password errata, scrittura, pubblicazione, ritiro, anteprima, invio di una domanda da lettore, moderazione e pubblicazione, sondaggio, voto, cruciverba, quiz, nuovo numero, cambio del nome della testata e uscita.
- Il sito è controllato su computer (1440 px) e telefono (360–390 px), senza pagine che escono dallo schermo.
- La build di produzione e i controlli del codice passano. Ho controllato il contrasto dei colori e corretto i due punti che non bastavano. `npm audit` non segnala vulnerabilità.

## 2. Come avviarlo sul computer

Serve Node.js 20 o successivo. Nella cartella del progetto:

```bash
npm install
cp .env.example .env.local
```

In `.env.local` scrivi `LOCAL_ADMIN_PASSWORD=` seguita da una password a scelta di almeno 8 caratteri, poi:

```bash
npm run dev
```

Apri <http://localhost:3000>. Senza Supabase il sito parte in **modalità prova**: tutto funziona e i dati restano nella cartella `.data/` del computer.

## 3. Come entrare nell'area redazione

- **In modalità prova:** vai su <http://localhost:3000/redazione> e usa la password scritta in `.env.local`.
- **Online con Supabase:** ogni redattore ha email e password personali, create dall'amministratore. Chi entra senza ruolo resta «in attesa» e non può toccare nulla. I ruoli si assegnano da Impostazioni → La redazione.
- Nel codice non c'è nessuna password: i lettori non possono modificare nulla e le regole sono applicate direttamente dal database.

## 4. Come configurare database, accesso e file

Tutto è spiegato passo passo in `docs/SETUP-SUPABASE.md`. In sintesi:

1. Crea un progetto gratuito su Supabase (regione europea).
2. Nell'editor SQL esegui in ordine i tre file di `supabase/migrations/`, che creano le tabelle, le regole di sicurezza e lo spazio per immagini e PDF.
3. Disattiva le registrazioni pubbliche e crea gli account della redazione.
4. Nomina il primo amministratore con una riga SQL (è indicata nella guida).
5. Copia URL e chiave pubblica in Vercel e il sito va online.

## 5. Cosa manca per andare online e cosa devi fare tu

Queste cose posso farle solo con te, perché richiedono account a nome della scuola:

1. **Creare gli account gratuiti di Supabase e Vercel**, meglio con un indirizzo della scuola o della redazione.
2. **Seguire la guida** `docs/SETUP-SUPABASE.md`: circa 30 minuti.
3. **Decidere dove tenere il codice.** Serve un repository GitHub per pubblicare su Vercel. Se vuoi, lo creo io: dimmi tu il nome e l'account da usare.
4. **Primo collegamento a Supabase:** la parte del sito che parla con Supabase è scritta e il database è stato provato su un Postgres locale, ma non ho potuto provarla su un vero progetto Supabase. Al primo collegamento conviene fare un giro di prova (accesso, un articolo, una foto, un voto). Se qualcosa non va, sistemo io.
5. **Autorizzazioni:** controllare con la scuola le liberatorie per nomi e foto degli studenti, e il riferimento al regolamento d'istituto nella pagina Privacy.
6. **Contenuti veri:** il nome definitivo della testata (ci sono anche un sondaggio d'esempio e il campo nelle Impostazioni), le foto della redazione al posto delle illustrazioni e il Numero 1 di dicembre.
7. **Facoltativo:** un dominio della scuola, da collegare in Vercel.
