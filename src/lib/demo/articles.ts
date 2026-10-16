import type { Article } from "../types";

/**
 * Articoli dimostrativi. Sono testi di esempio scritti per mostrare il
 * funzionamento del sito: non raccontano fatti reali accaduti a scuola.
 * Sono marcati con `is_demo: true` e si possono rimuovere in un clic
 * dall'area redazione.
 */

export const ISSUE_ZERO = "00000000-0000-4000-8000-000000000100";
export const ISSUE_ONE = "00000000-0000-4000-8000-000000000101";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

type DemoArticle = Omit<Article, "created_at" | "updated_at" | "is_demo" | "status"> &
  Partial<Pick<Article, "status">>;

const raw: DemoArticle[] = [
  // ───────────────────────── NUMERO 1 · DICEMBRE 2026 ─────────────────────────
  {
    id: id(1),
    slug: "pane-al-pane-perche-un-giornale",
    title: "Chiamare le cose con il loro nome",
    subtitle:
      "Perché un giornale scritto dagli studenti, perché proprio adesso e perché ha la forma di un menù.",
    excerpt:
      "Un giornale si prepara come un pranzo importante: si scelgono gli ingredienti, si rispettano i tempi, si serve a qualcuno che aspetta. Ecco come abbiamo apparecchiato il primo numero.",
    author_name: "La redazione",
    author_role: "Editoriale",
    course: "aperitivo",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/pane.svg",
    cover_alt: "Illustrazione di una pagnotta dorata su fondo crema",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    extra: null,
    published_at: "2026-12-01",
    body: `<p>«Dire pane al pane e vino al vino» significa parlare chiaro, senza giri di parole. Ci è sembrato un buon modo per cominciare: un giornale scolastico non deve fingere di essere qualcos'altro. Deve raccontare quello che vede, verificare quello che racconta e lasciare spazio a chi ha qualcosa da dire.</p>
<p>Questo è un <strong>testo dimostrativo</strong>: serve a mostrare come apparirà l'editoriale di ogni numero. Ma le idee che contiene sono quelle del progetto. Il Pastore è una scuola in cui si impara facendo: in sala, in cucina, nelle serre, nei campi. Ogni giorno qualcuno semina, qualcuno impasta, qualcuno apparecchia. Mancava un posto in cui tutto questo diventasse racconto.</p>
<h2>Un giornale che si legge come un menù</h2>
<p>Abbiamo scelto di organizzare il giornale come il menù di un pranzo. Non è solo un gioco: è il modo in cui funziona una cucina. Ogni portata ha il suo ritmo, il suo peso, il suo momento.</p>
<ul>
<li><strong>Aperitivo</strong> è la prima pagina: l'editoriale e le brevi, da leggere in piedi.</li>
<li><strong>Primo</strong> racconta la vita del Pastore: i laboratori, le uscite, le persone.</li>
<li><strong>Secondo</strong> è il cuore del giornale, «Dal campo al piatto»: una pianta coltivata dall'agrario diventa la ricetta dell'alberghiero.</li>
<li><strong>Contorno</strong> è La Piazza: attualità, geopolitica e le vostre domande.</li>
<li><strong>Dessert</strong> è la Terza Pagina: racconti, poesie, disegni.</li>
<li><strong>Caffè</strong> chiude con giochi, sondaggi e posta.</li>
</ul>
<blockquote><p>Un buon pranzo non si giudica dal piatto più elaborato, ma da come le portate stanno insieme. Vale anche per un giornale.</p></blockquote>
<h2>Le regole della nostra cucina</h2>
<p>Ogni redazione ha bisogno di poche regole, chiare e condivise. Le scriveremo insieme, ma alcune ci sembrano già irrinunciabili: verificare le notizie prima di pubblicarle, distinguere i fatti dalle opinioni, rispettare le persone di cui si parla, proteggere la privacy di tutti e citare sempre chi ha scritto o fotografato qualcosa.</p>
<p>Chi preferisce può firmare racconti, poesie e disegni con uno pseudonimo, o non firmarli affatto: i docenti referenti sapranno chi sono gli autori e ne tuteleranno la riservatezza.</p>
<h2>Il nome è provvisorio</h2>
<p>«Pane al Pane» è un titolo di lavoro. Il nome definitivo lo sceglierete voi: le classi faranno le loro proposte e poi si voterà. Trovate il sondaggio nella pagina <a href="/menu/caffe">Caffè</a>, insieme al cruciverba e al modulo per scrivere alla redazione.</p>
<p>Buona lettura, e buon appetito.</p>`,
  },
  {
    id: id(2),
    slug: "le-brevi-di-dicembre",
    title: "Le brevi del mese",
    subtitle: "Cinque notizie in poche righe: lo spazio delle cose da sapere prima di girare pagina.",
    excerpt:
      "Esempio di rubrica di notizie brevi: scadenze, appuntamenti, piccoli annunci. Ogni breve sta in un paragrafo.",
    author_name: "La redazione",
    author_role: null,
    course: "aperitivo",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/brevi.svg",
    cover_alt: "Illustrazione di foglietti di appunti appuntati su una bacheca verde",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-12-01",
    body: `<p><em>Le brevi qui sotto sono esempi di formato: mostrano come la redazione potrà presentare piccoli annunci e notizie. Non si riferiscono a eventi reali.</em></p>
<h3>La redazione cerca fotografi</h3>
<p>Non serve una macchina professionale: basta un telefono, un po' di pazienza e la voglia di guardare la scuola con occhi diversi. Le fotografie di persone si pubblicano solo con le autorizzazioni previste dalla scuola.</p>
<h3>Come si propone un articolo</h3>
<p>Si scrive due righe di proposta alla redazione, con l'argomento e il taglio che si vuole dare. Si decide insieme durante la riunione, che si tiene ogni due settimane.</p>
<h3>Il glossario di cucina</h3>
<p>Da questo numero, ogni mese, una parola del mestiere spiegata bene. Si comincia con <strong>brigata</strong>: la squadra che lavora in cucina, ognuno con il proprio ruolo.</p>
<h3>Domande per La Piazza</h3>
<p>Avete una domanda su un fatto di attualità che non vi è chiaro? Scrivetela con il modulo in fondo al giornale. Le risposte arrivano nel numero successivo.</p>
<h3>Il nome del giornale</h3>
<p>Il sondaggio per scegliere il nome definitivo è aperto nella pagina Caffè. Si vota una volta sola.</p>`,
  },
  {
    id: id(3),
    slug: "una-giornata-in-sala",
    title: "Dietro la porta della sala",
    subtitle:
      "Prima che arrivi il primo ospite, una sala è già piena di gesti: tovaglie, posate, bicchieri, sguardi. Viaggio nel servizio, visto da chi lo impara.",
    excerpt:
      "Il servizio in sala è una coreografia: chi la impara scopre che ogni gesto ha una ragione. Un racconto di esempio per la rubrica Vita del Pastore.",
    author_name: "Classe quarta – Sala e vendita",
    author_role: "Testo dimostrativo",
    course: "primo",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/sala.svg",
    cover_alt: "Illustrazione di un coperto apparecchiato visto dall'alto, con forchetta, coltello e bicchiere",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    extra: null,
    published_at: "2026-12-02",
    body: `<p>La prima cosa che si impara in sala è che la sala non è mai vuota. Anche quando non c'è nessuno seduto ai tavoli, è piena di decisioni già prese: la distanza tra le sedie, l'altezza delle tovaglie, la posizione di ogni bicchiere.</p>
<p>Chi entra in un ristorante vede il risultato. Chi lo prepara conosce tutto quello che viene prima. Questo articolo dimostrativo prova a raccontarlo come lo racconterebbe una classe che lo sta imparando.</p>
<h2>La mise en place</h2>
<p>Ogni coperto segue una geometria precisa: la forchetta a sinistra, il coltello a destra con la lama rivolta verso il piatto, il bicchiere dell'acqua in alto, sopra la punta del coltello. Non è pignoleria: è il modo per far sì che l'ospite trovi tutto dove si aspetta di trovarlo, senza pensarci.</p>
<blockquote><p>Un buon servizio è quello che non si nota. Te ne accorgi solo quando manca.</p></blockquote>
<h2>Leggere il tavolo</h2>
<p>Il secondo segreto è l'attenzione. Un cameriere esperto capisce dalla posizione delle posate se un ospite ha finito, dal bicchiere vuoto se è il momento di passare, da uno sguardo se qualcuno ha bisogno di qualcosa. Si impara osservando, sbagliando e riprovando.</p>
<p>Poi c'è la comanda, il foglietto (o il tablet) che collega la sala alla cucina. Deve essere chiara, completa, scritta in un linguaggio che entrambe le squadre conoscono. Una comanda sbagliata è un piatto sbagliato.</p>
<h2>Lavorare in squadra</h2>
<p>La sala e la cucina sono due squadre che lavorano per lo stesso obiettivo, e funzionano solo se si parlano. È forse la lezione più importante, e vale anche fuori dal ristorante: un lavoro ben fatto è quasi sempre un lavoro fatto insieme.</p>`,
  },
  {
    id: id(4),
    slug: "il-laboratorio-delle-sette-e-quarantacinque",
    title: "Il laboratorio comincia prima della campanella",
    subtitle: "Divise, coltelli, liste: come si prepara una brigata di cucina prima di accendere i fuochi.",
    excerpt:
      "In cucina la giornata comincia con l'ordine: la divisa, il posto di lavoro, la lista delle preparazioni. Un articolo di esempio.",
    author_name: "Classe terza – Enogastronomia",
    author_role: "Testo dimostrativo",
    course: "primo",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/laboratorio.svg",
    cover_alt: "Illustrazione di una pentola verde fumante accanto a un cappello da cuoco",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-12-03",
    body: `<p>Chi pensa che in cucina si cominci accendendo i fornelli sbaglia di almeno mezz'ora. Prima viene la divisa: giacca abbottonata, grembiule, cappello, scarpe antiscivolo. Poi viene il posto di lavoro, pulito e ordinato. Solo dopo arrivano gli ingredienti.</p>
<h2>La parola d'ordine è «mise en place»</h2>
<p>Anche in cucina, come in sala, si parla di mise en place: tutto ciò che serve deve essere pronto prima di cominciare. Verdure lavate e tagliate, fondi pronti, attrezzi a portata di mano. È il modo per lavorare veloci senza lavorare di fretta.</p>
<p>Ogni brigata ha i suoi ruoli: chi si occupa dei primi, chi dei secondi, chi dei dolci. E ha un capo, lo chef, che coordina i tempi in modo che tutti i piatti di un tavolo escano insieme.</p>
<h2>Le regole che non si discutono</h2>
<ul>
<li>Le mani si lavano spesso, e sempre dopo aver toccato alimenti crudi.</li>
<li>I taglieri hanno colori diversi a seconda di cosa si taglia.</li>
<li>Il coltello si passa appoggiandolo sul piano, mai di mano in mano.</li>
<li>Si annuncia ad alta voce quando si passa alle spalle di qualcuno: «dietro!».</li>
</ul>
<p>Sono regole semplici, ma tengono al sicuro tutti. E dicono molto di un mestiere in cui la cura per gli altri comincia dalla cura per il proprio lavoro.</p>`,
  },
  {
    id: id(5),
    slug: "castagna-dal-bosco-agli-gnocchi",
    title: "La castagna: dal bosco agli gnocchi",
    subtitle:
      "L'agrario ci porta nel castagneto, l'alberghiero ci porta in cucina. Il frutto che per secoli è stato il «pane dei poveri» torna protagonista.",
    excerpt:
      "La doppia pagina centrale di esempio: la scheda della pianta curata dall'agrario e la ricetta degli gnocchi di castagne preparata dall'alberghiero.",
    author_name: "Agrario & Alberghiero",
    author_role: "Doppia pagina centrale · testo dimostrativo",
    course: "secondo",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/castagna-piatto.svg",
    cover_alt: "Illustrazione di un piatto di gnocchi di castagne con foglie di salvia",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    published_at: "2026-12-04",
    extra: {
      ingredient: "Castagna",
      scientific_name: "Castanea sativa Mill.",
      season: "Raccolta da fine settembre a novembre",
      origin: "Boschi collinari e montani, tra i 300 e i 1000 metri",
      field_notes:
        "Il castagno è un albero longevo, che ama i terreni acidi e ben drenati. I suoi frutti sono protetti dal riccio, che si apre da solo quando la castagna è matura e cade a terra. Per secoli la farina di castagne ha sostituito quella di grano nelle zone di montagna.",
      field_class: "Classe terza – Agrario (esempio)",
      field_image: "/demo/castagna-campo.svg",
      field_image_alt: "Illustrazione di un riccio di castagno aperto e di due castagne",
      recipe_title: "Gnocchi di castagne, burro e salvia",
      servings: "4 persone",
      time: "1 ora e 15 minuti",
      difficulty: "Media",
      ingredients: [
        "500 g di patate a pasta farinosa",
        "150 g di farina di castagne",
        "100 g di farina 00, più quella per la spianatoia",
        "1 uovo",
        "Sale fino",
        "60 g di burro",
        "8 foglie di salvia",
        "Formaggio stagionato grattugiato, a piacere",
      ],
      steps: [
        "Lessa le patate con la buccia partendo da acqua fredda salata, finché una forchetta le attraversa senza fatica.",
        "Sbucciale ancora calde e schiacciale con lo schiacciapatate direttamente sulla spianatoia.",
        "Aggiungi le due farine setacciate, l'uovo e un pizzico di sale. Impasta velocemente, solo finché il composto è liscio.",
        "Forma dei cilindri spessi un dito e tagliali a tocchetti di circa 2 cm. Infarinali leggermente.",
        "Cuoci gli gnocchi in abbondante acqua salata: sono pronti un minuto dopo che sono venuti a galla.",
        "Nel frattempo fai sciogliere il burro con la salvia a fuoco dolce. Scola gli gnocchi, saltali nel burro e servi subito.",
      ],
      kitchen_class: "Classe quarta – Enogastronomia (esempio)",
      plate_image: "/demo/castagna-piatto.svg",
      plate_image_alt: "Illustrazione di un piatto di gnocchi di castagne con foglie di salvia",
    },
    body: `<p>Per secoli, nelle valli e sulle colline, la castagna è stata molto più di un frutto d'autunno. Era il cibo che permetteva di arrivare a primavera: si mangiava fresca, secca, macinata in farina. Non a caso il castagno veniva chiamato «l'albero del pane».</p>
<p>In questa doppia pagina di esempio, gli studenti dell'agrario raccontano la pianta e il suo ciclo, mentre quelli dell'alberghiero la trasformano in un piatto. È lo schema che la rubrica seguirà ogni mese.</p>
<h2>Dal campo</h2>
<p>Il castagno cresce bene nei terreni acidi e freschi delle zone collinari e montane. Un castagneto curato ha bisogno di potature, di pulizia del sottobosco e di attenzione alle malattie che possono colpire la pianta. La raccolta avviene a terra, quando i ricci si aprono e lasciano cadere i frutti.</p>
<p>Una volta raccolte, le castagne si possono conservare in diversi modi: in acqua fredda per qualche giorno, oppure essiccate. Le castagne secche, macinate, diventano la farina che useremo in cucina.</p>
<h2>Al piatto</h2>
<p>La farina di castagne ha un sapore dolce e leggermente affumicato e non contiene glutine. Per questo, negli gnocchi, si unisce a una parte di farina di grano, che aiuta l'impasto a stare insieme. Il condimento è il più semplice possibile: burro e salvia, per non coprire il gusto del frutto.</p>
<blockquote><p>La ricetta migliore è quella che fa sentire da dove viene l'ingrediente.</p></blockquote>
<p>Trovate la scheda della pianta e la ricetta completa, passo per passo, qui sotto.</p>`,
  },
  {
    id: id(6),
    slug: "bufale-a-tavola",
    title: "Bufale a tavola: come riconoscerle",
    subtitle:
      "«Questo cibo fa miracoli», «quello è veleno». Le notizie false sull'alimentazione corrono veloci. Cinque domande da farsi prima di condividerle.",
    excerpt:
      "Un metodo semplice per verificare le notizie sul cibo che girano sui social, prima di crederci e di inoltrarle.",
    author_name: "Redazione La Piazza",
    author_role: "Testo dimostrativo",
    course: "contorno",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/bufale.svg",
    cover_alt: "Illustrazione di una pagina di giornale vista attraverso una lente d'ingrandimento con un punto interrogativo",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-12-05",
    body: `<p>Poche cose generano notizie false come il cibo. Ci riguarda tutti, ogni giorno, e tocca la salute: per questo un titolo allarmante o una promessa miracolosa attirano subito l'attenzione. Imparare a riconoscerle è un'abilità utile, in cucina e fuori.</p>
<h2>Cinque domande prima di condividere</h2>
<ol>
<li><strong>Chi lo dice?</strong> Un ente sanitario, un'università, un giornale con un direttore responsabile? Oppure una pagina anonima?</li>
<li><strong>Quando?</strong> Molte notizie tornano a circolare anni dopo, fuori dal loro contesto.</li>
<li><strong>Su quali prove?</strong> «Uno studio dice» non basta: quale studio, su quante persone, pubblicato dove?</li>
<li><strong>Il titolo corrisponde al testo?</strong> Spesso l'articolo è molto più prudente del titolo che lo accompagna.</li>
<li><strong>Mi sta vendendo qualcosa?</strong> Se la soluzione miracolosa è un prodotto da comprare, conviene diffidare.</li>
</ol>
<blockquote><p>Distinguere i fatti dalle opinioni non significa non avere opinioni. Significa sapere da dove vengono.</p></blockquote>
<h2>Fatti e opinioni</h2>
<p>«Il pane integrale contiene più fibre del pane bianco» è un fatto: si può verificare. «Il pane integrale è più buono» è un'opinione: legittima, ma personale. Un buon articolo dichiara sempre quando sta passando dall'uno all'altra.</p>
<p>Avete visto girare una notizia sul cibo e non sapete se fidarvi? Mandatecela con il modulo della redazione: proveremo a verificarla insieme nel prossimo numero.</p>`,
  },
  {
    id: id(7),
    slug: "il-grano-e-le-rotte-del-mondo",
    title: "Il viaggio di un chicco di grano",
    subtitle:
      "Dal campo al porto, dal porto al mulino: per capire la geopolitica a volte basta seguire il percorso di ciò che mangiamo.",
    excerpt:
      "Una guida di esempio per capire perché il prezzo del pane può dipendere da ciò che accade dall'altra parte del mondo.",
    author_name: "Redazione La Piazza",
    author_role: "Testo dimostrativo",
    course: "contorno",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/grano.svg",
    cover_alt: "Illustrazione di spighe di grano davanti a un mappamondo attraversato da una rotta tratteggiata",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    extra: null,
    published_at: "2026-12-05",
    body: `<p>Il grano è una delle piante più coltivate al mondo e uno dei prodotti più scambiati. Viene seminato in pianure lontanissime tra loro, viaggia su navi enormi e arriva nei mulini che producono la farina del pane, della pasta, dei dolci.</p>
<p>Per questo ciò che accade lungo il suo percorso (una siccità, un porto chiuso, una guerra, un accordo commerciale) può avere effetti anche sui prezzi che troviamo al supermercato. Questo articolo di esempio prova a spiegare il meccanismo, senza riferirsi a fatti specifici.</p>
<h2>Domanda e offerta</h2>
<p>Quando il raccolto è scarso o le spedizioni si interrompono, sul mercato arriva meno grano. Se la domanda resta la stessa, il prezzo sale. È un principio semplice, ma aiuta a leggere molte notizie economiche.</p>
<h2>Perché ci riguarda</h2>
<p>Una scuola che forma agricoltori e cuochi vive dentro questa catena: chi coltiva conosce i rischi del raccolto, chi cucina conosce il costo delle materie prime. Capire la geopolitica significa anche capire il proprio futuro mestiere.</p>
<blockquote><p>Ogni pagnotta contiene un pezzo di mondo.</p></blockquote>
<p>Nella rubrica La Piazza proveremo, numero dopo numero, a spiegare le notizie partendo da domande concrete. Le vostre sono le benvenute.</p>`,
  },
  {
    id: id(8),
    slug: "l-ultimo-tavolo",
    title: "L'ultimo tavolo",
    subtitle: "Un racconto breve. Una sala vuota, una lampada accesa, una cena che nessuno ha ordinato.",
    excerpt:
      "Racconto di esempio per la Terza Pagina: a fine servizio, un ragazzo resta solo in sala e trova un tavolo ancora apparecchiato.",
    author_name: "Penna di Nebbia",
    author_role: "Pseudonimo d'esempio",
    course: "dessert",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/racconto.svg",
    cover_alt: "Illustrazione notturna di un tavolo apparecchiato sotto una lampada accesa",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    extra: null,
    published_at: "2026-12-06",
    body: `<p>L'ultimo cliente se n'era andato alle undici e dieci. Lo sapevo perché avevo guardato l'orologio sopra la porta della cucina almeno quattro volte, sperando che si decidesse a chiedere il conto.</p>
<p>Poi era cominciato il rito della chiusura: le tovaglie sporche nel cesto, i bicchieri in lavastoviglie, le sedie capovolte sui tavoli perché il mattino dopo qualcuno potesse lavare il pavimento. Lo chef aveva spento le luci della cucina e mi aveva lasciato le chiavi. «Chiudi tu, che sei l'ultimo», aveva detto, e io mi ero sentito importante come un capitano.</p>
<p>Fu allora che lo vidi. In fondo alla sala, nell'angolo vicino alla finestra, c'era un tavolo ancora apparecchiato. Tovaglia bianca, due coperti, un bicchiere a stelo e una piccola lampada accesa, di quelle che non usiamo mai.</p>
<p>Ero sicuro di averlo sparecchiato. Me lo ricordavo, quel tavolo: una coppia di anziani, un risotto, due caffè. Avevo portato via io i piatti.</p>
<h2>La comanda</h2>
<p>Mi avvicinai piano, come ci si avvicina a un cane che non si conosce. Sul piattino del pane c'era un foglietto piegato in due. Una comanda, scritta con una grafia che non era la mia né quella dei miei compagni.</p>
<p><em>Tavolo 12. Due coperti. Quello che avete di più semplice.</em></p>
<p>Rimasi lì a guardarla per un tempo che mi parve lunghissimo. Fuori, la nebbia aveva inghiottito il parcheggio e i lampioni sembravano galleggiare nel nulla.</p>
<p>Quello che avete di più semplice. Pensai a tutte le volte che in laboratorio ci avevano detto che la cosa più difficile, in cucina, è proprio la semplicità. Un uovo cotto bene. Un brodo limpido. Pane, olio e sale.</p>
<blockquote><p>La cosa più difficile, in cucina, è la semplicità.</p></blockquote>
<h2>Pane, olio e sale</h2>
<p>Riaccesi una sola luce in cucina. Tagliai due fette dal pane del giorno, le scaldai sulla piastra, le condii con l'olio buono, quello che lo chef tiene sullo scaffale alto, e un pizzico di sale grosso. Le portai al tavolo 12 su un piatto bianco, con il tovagliolo sul braccio, come mi avevano insegnato.</p>
<p>Naturalmente non c'era nessuno. Appoggiai il piatto, sistemai le posate che non servivano, e mi sedetti un momento sulla sedia di fronte. Mangiai una delle due fette. L'altra la lasciai lì, per chi aveva scritto la comanda.</p>
<p>Il giorno dopo il tavolo era sparecchiato, il foglietto sparito, il piatto lavato e riposto. Nessuno mi disse niente e io non chiesi niente a nessuno.</p>
<p>Ma da quella sera, quando chiudo la sala, lascio sempre accesa una lampada un minuto più del necessario. Non si sa mai chi abbia ancora fame.</p>
<p><em>Racconto di fantasia scritto come esempio per la Terza Pagina.</em></p>`,
  },
  {
    id: id(9),
    slug: "lievito",
    title: "Lievito",
    subtitle: "Una poesia sull'attesa, sulla notte e su ciò che cresce quando nessuno guarda.",
    excerpt: "Poesia d'esempio per la Terza Pagina: il pane che lievita di notte come metafora del crescere.",
    author_name: "Anonimo",
    author_role: "Testo dimostrativo",
    course: "dessert",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/poesia.svg",
    cover_alt: "Illustrazione di un impasto che lievita in una ciotola rossa sotto la luna",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-12-06",
    body: `<p>Di notte la cucina è un'altra stanza:<br>le pentole dormono a testa in giù,<br>il frigo canticchia da solo<br>una canzone che non finisce.</p>
<p>Sotto un panno di cotone, nella ciotola,<br>l'impasto respira piano,<br>fa la cosa che nessuno gli ha insegnato:<br>cresce.</p>
<p>Non chiede di essere guardato.<br>Non ha fretta. Non ha paura<br>di essere ancora poco,<br>di essere ancora informe.</p>
<p>Anche noi, a volte, siamo così:<br>farina e acqua e un pizzico di sale,<br>e quella cosa viva, invisibile,<br>che lavora mentre dormiamo.</p>
<p>Domattina qualcuno aprirà il forno<br>e dirà: guarda com'è venuto bene.<br>Nessuno saprà della notte.<br>Ma il pane, sì. Il pane lo sa.</p>`,
  },
  {
    id: id(10),
    slug: "giochi-e-posta-di-dicembre",
    title: "Il cruciverba della dispensa e le vostre lettere",
    subtitle: "Una pausa caffè con le parole della cucina e dei campi, il sondaggio del mese e la posta dei lettori.",
    excerpt:
      "Presentazione di esempio della pagina Caffè: dove trovare il cruciverba interattivo, il quiz, il sondaggio e come scrivere alla redazione.",
    author_name: "La redazione",
    author_role: null,
    course: "caffe",
    issue_id: ISSUE_ONE,
    cover_image: "/demo/caffe.svg",
    cover_alt: "Illustrazione di una moka fumante su fondo rosa",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-12-07",
    body: `<p>Ogni pranzo che si rispetti finisce con un caffè, e ogni numero del giornale finisce con questa pagina. Qui trovate:</p>
<ul>
<li><strong>Il cruciverba della dispensa</strong>, da risolvere direttamente sul sito, anche dal telefono.</li>
<li><strong>Il quiz delle stagioni</strong>: cinque domande per scoprire quanto conoscete frutta e verdura di stagione.</li>
<li><strong>Il sondaggio del mese</strong>: questa volta si sceglie il nome del giornale.</li>
<li><strong>La posta</strong>: le lettere dei lettori, con le risposte della redazione.</li>
</ul>
<p>Volete scrivere alla redazione? Usate il modulo «Scrivi alla redazione». Ogni messaggio viene letto e approvato dalla redazione prima di essere pubblicato: non serve lasciare email o numeri di telefono, e potete firmarvi con uno pseudonimo.</p>`,
  },

  // ───────────────────────── NUMERO ZERO · OTTOBRE 2026 ─────────────────────────
  {
    id: id(11),
    slug: "numero-zero-le-prove-generali",
    title: "Numero zero: le prove generali",
    subtitle: "Ogni giornale nasce da un numero che non esce davvero. Questo è il nostro.",
    excerpt:
      "Nei giornali il «numero zero» è il prototipo: serve a provare l'impaginazione, i tempi e il lavoro di squadra prima dell'uscita vera.",
    author_name: "La redazione",
    author_role: "Editoriale",
    course: "aperitivo",
    issue_id: ISSUE_ZERO,
    cover_image: "/demo/numero-zero.svg",
    cover_alt: "Illustrazione di una bozza di stampa con un grande zero e i segni di taglio",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    extra: null,
    published_at: "2026-10-15",
    body: `<p>Nel mondo dei giornali si chiama «numero zero» la prima versione completa di una testata, quella che si prepara prima dell'uscita ufficiale. Serve a capire se le rubriche funzionano, se i tempi sono realistici, se la squadra sa lavorare insieme.</p>
<p>Questo numero zero è dimostrativo: è stato preparato per mostrare come appare l'archivio del sito e come si naviga tra i numeri precedenti. I contenuti veri arriveranno con la redazione.</p>
<h2>Cosa si prova in un numero zero</h2>
<ul>
<li>L'impaginazione: le pagine stanno in piedi? I titoli si leggono?</li>
<li>I tempi: quanto serve davvero per scrivere, rivedere e impaginare?</li>
<li>I ruoli: chi scrive, chi fotografa, chi corregge, chi decide?</li>
</ul>
<p>Sbagliare in un numero zero non è un problema: è esattamente il suo scopo.</p>`,
  },
  {
    id: id(12),
    slug: "le-prime-settimane",
    title: "Le prime settimane, raccontate da chi arriva",
    subtitle: "Orari nuovi, divise nuove, compagni nuovi. Come si diventa parte di una scuola in cui si impara facendo.",
    excerpt: "Articolo di esempio sulla vita degli studenti: l'inizio dell'anno visto da chi frequenta la classe prima.",
    author_name: "Classe prima (esempio)",
    author_role: "Testo dimostrativo",
    course: "primo",
    issue_id: ISSUE_ZERO,
    cover_image: "/demo/accoglienza.svg",
    cover_alt: "Illustrazione di una porta aperta su una stanza luminosa, con uno zaino verde",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-10-15",
    body: `<p>Il primo giorno in una scuola professionale è diverso dagli altri primi giorni. Oltre ai libri ci sono le divise, gli attrezzi, i laboratori. Si scopre presto che una parte importante delle lezioni si fa in piedi: in cucina, in sala, nelle serre.</p>
<p>Questo è un testo dimostrativo, ma prova a raccogliere le domande più comuni di chi arriva: dove si trovano i laboratori? Come si indossa la divisa? Chi si può chiedere aiuto?</p>
<h2>Tre consigli dai più grandi</h2>
<ol>
<li>Chiedere sempre, anche le cose che sembrano ovvie.</li>
<li>Tenere in ordine la propria divisa e i propri attrezzi: è il primo segno di professionalità.</li>
<li>Non avere paura di sbagliare in laboratorio: è il posto giusto per farlo.</li>
</ol>`,
  },
  {
    id: id(13),
    slug: "zucca-dall-orto-alla-vellutata",
    title: "La zucca: dall'orto alla vellutata",
    subtitle: "Un ortaggio che arriva da lontano e che oggi è il simbolo dell'autunno nei nostri orti.",
    excerpt:
      "Doppia pagina centrale di esempio del numero zero: la coltivazione della zucca e la ricetta della vellutata con semi tostati.",
    author_name: "Agrario & Alberghiero",
    author_role: "Doppia pagina centrale · testo dimostrativo",
    course: "secondo",
    issue_id: ISSUE_ZERO,
    cover_image: "/demo/zucca-piatto.svg",
    cover_alt: "Illustrazione di una vellutata di zucca vista dall'alto, su fondo verde",
    cover_credit: "Illustrazione dimostrativa",
    featured: true,
    published_at: "2026-10-15",
    extra: {
      ingredient: "Zucca",
      scientific_name: "Cucurbita maxima Duchesne",
      season: "Semina in primavera, raccolta da settembre a ottobre",
      origin: "Originaria delle Americhe, oggi coltivata in tutti gli orti",
      field_notes:
        "La zucca ha bisogno di sole, di spazio e di un terreno ricco di sostanza organica. Si raccoglie quando il picciolo si secca e la buccia diventa dura. Ben conservata in un luogo fresco e asciutto, dura per mesi.",
      field_class: "Classe seconda – Agrario (esempio)",
      field_image: "/demo/zucca-campo.svg",
      field_image_alt: "Illustrazione di una grande zucca arancione nell'orto",
      recipe_title: "Vellutata di zucca con semi tostati",
      servings: "4 persone",
      time: "45 minuti",
      difficulty: "Facile",
      ingredients: [
        "800 g di zucca già pulita",
        "1 patata media",
        "1 porro o 1 cipolla dorata",
        "750 ml di brodo vegetale",
        "Olio extravergine d'oliva",
        "Sale e pepe",
        "Una manciata di semi di zucca",
      ],
      steps: [
        "Taglia la zucca e la patata a cubetti regolari e affetta sottilmente il porro.",
        "Fai appassire il porro in una casseruola con un filo d'olio, a fuoco dolce.",
        "Aggiungi zucca e patata, lascia insaporire due minuti e copri con il brodo caldo.",
        "Cuoci per circa 25 minuti, finché le verdure sono morbide.",
        "Frulla con il frullatore a immersione fino a ottenere una crema liscia. Regola di sale e pepe.",
        "Tosta i semi in una padella asciutta per pochi minuti e usali per guarnire, con un filo d'olio a crudo.",
      ],
      kitchen_class: "Classe terza – Enogastronomia (esempio)",
      plate_image: "/demo/zucca-piatto.svg",
      plate_image_alt: "Illustrazione di una vellutata di zucca vista dall'alto, su fondo verde",
    },
    body: `<p>La zucca è arrivata in Europa dalle Americhe e si è adattata così bene ai nostri orti da diventare uno dei simboli dell'autunno. In questa doppia pagina di esempio, gli studenti dell'agrario ne raccontano la coltivazione e quelli dell'alberghiero ne fanno una vellutata.</p>
<h2>Dal campo</h2>
<p>Si semina in primavera, quando il terreno si è scaldato. Le piante crescono in fretta e occupano molto spazio, con lunghi tralci e foglie grandi. I frutti si raccolgono a fine estate o in autunno, lasciando un pezzo di picciolo per conservarli meglio.</p>
<h2>Al piatto</h2>
<p>Una vellutata è una delle preparazioni più semplici e più utili da imparare: valorizza l'ingrediente, si adatta alle stagioni e non spreca nulla. Anche i semi, tostati, diventano una guarnizione croccante.</p>`,
  },
  {
    id: id(14),
    slug: "ottobre-in-valle",
    title: "Ottobre in valle",
    subtitle: "Una poesia d'autunno, tra montagne, nebbie e castagne.",
    excerpt: "Poesia di esempio pubblicata nel numero zero della Terza Pagina.",
    author_name: "L. (pseudonimo d'esempio)",
    author_role: null,
    course: "dessert",
    issue_id: ISSUE_ZERO,
    cover_image: "/demo/valsesia.svg",
    cover_alt: "Illustrazione di montagne verdi con le cime innevate e un fiume azzurro",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-10-15",
    body: `<p>Ottobre scende dalla montagna<br>con le mani piene di nebbia,<br>la appoggia sui tetti, sui campi,<br>sulle spalle di chi va a scuola.</p>
<p>Il fiume ha cambiato voce,<br>i castagni hanno aperto i ricci<br>come piccole porte spinose<br>su una stanza calda.</p>
<p>E noi, in mezzo, impariamo<br>a riconoscere le stagioni<br>dal profumo che esce dalle cucine<br>prima ancora che dal calendario.</p>`,
  },
  {
    id: id(15),
    slug: "domande-e-risposte-numero-zero",
    title: "Come funziona La Piazza",
    subtitle: "Le vostre domande sull'attualità, le nostre risposte nel numero successivo.",
    excerpt: "Spiegazione di esempio della rubrica delle domande dei lettori.",
    author_name: "Redazione La Piazza",
    author_role: null,
    course: "contorno",
    issue_id: ISSUE_ZERO,
    cover_image: "/demo/grano.svg",
    cover_alt: "Illustrazione di spighe di grano davanti a un mappamondo",
    cover_credit: "Illustrazione dimostrativa",
    featured: false,
    extra: null,
    published_at: "2026-10-15",
    body: `<p>La Piazza è il luogo in cui si discute. In un paese, la piazza è lo spazio di tutti: ci si incontra, ci si informa, ci si confronta con rispetto anche quando non si è d'accordo.</p>
<p>Nella nostra Piazza potete fare domande su ciò che succede nel mondo e che non vi è chiaro. La redazione sceglierà le domande, cercherà fonti affidabili e risponderà nel numero successivo.</p>
<p>Le domande si inviano con il modulo «Scrivi alla redazione». Non servono dati personali: basta la domanda e, se volete, una firma o uno pseudonimo.</p>`,
  },
];

export const demoArticles: Article[] = raw.map((a) => ({
  ...a,
  status: a.status ?? "published",
  is_demo: true,
  created_at: `${a.published_at}T08:00:00.000Z`,
  updated_at: `${a.published_at}T08:00:00.000Z`,
}));
