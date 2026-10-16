import { buildCrossword } from "../crossword";
import { defaultSettings } from "../site.config";
import type { Game, Issue, Poll, Settings, Submission } from "../types";
import { ISSUE_ONE, ISSUE_ZERO, demoArticles } from "./articles";

export { demoArticles, ISSUE_ONE, ISSUE_ZERO };

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const demoIssues: Issue[] = [
  {
    id: ISSUE_ZERO,
    number: 0,
    title: "Le prove generali",
    month: "2026-10-01",
    editorial:
      "Il numero zero è il prototipo del giornale: serve a provare rubriche, tempi e lavoro di squadra. Questo è un numero dimostrativo.",
    cover_image: "/demo/numero-zero.svg",
    cover_alt: "Bozza di stampa con un grande zero",
    pdf_url: null,
    status: "published",
    is_demo: true,
    published_at: "2026-10-15",
    created_at: "2026-10-15T08:00:00.000Z",
    updated_at: "2026-10-15T08:00:00.000Z",
  },
  {
    id: ISSUE_ONE,
    number: 1,
    title: "Il numero del pane",
    month: "2026-12-01",
    editorial:
      "Il primo numero apre la tavola: un editoriale sul perché di un giornale, la castagna nella doppia pagina centrale, un racconto di fine servizio e il sondaggio per scegliere il nome della testata. Tutti i contenuti sono dimostrativi.",
    cover_image: "/demo/pane.svg",
    cover_alt: "Una pagnotta dorata su fondo crema",
    pdf_url: null,
    status: "published",
    is_demo: true,
    published_at: "2026-12-01",
    created_at: "2026-12-01T08:00:00.000Z",
    updated_at: "2026-12-01T08:00:00.000Z",
  },
];

export const demoPolls: Poll[] = [
  {
    id: id(201),
    question: "Come volete chiamare il giornale?",
    description:
      "«Pane al Pane» è un titolo provvisorio. Votate la proposta che preferite (sondaggio dimostrativo).",
    status: "open",
    issue_id: ISSUE_ONE,
    is_demo: true,
    created_at: "2026-12-01T08:00:00.000Z",
    options: [
      { id: id(211), label: "Pane al Pane", position: 0 },
      { id: id(212), label: "Il Mestolo", position: 1 },
      { id: id(213), label: "Campo & Tavola", position: 2 },
      { id: id(214), label: "La Gazzetta del Pastore", position: 3 },
    ],
  },
  {
    id: id(202),
    question: "Qual è la portata che leggete per prima?",
    description: "Sondaggio chiuso del numero zero: ecco com'è andata.",
    status: "closed",
    issue_id: ISSUE_ZERO,
    is_demo: true,
    created_at: "2026-10-15T08:00:00.000Z",
    options: [
      { id: id(221), label: "Aperitivo · Prima pagina", position: 0 },
      { id: id(222), label: "Secondo · Dal campo al piatto", position: 1 },
      { id: id(223), label: "Dessert · La Terza Pagina", position: 2 },
      { id: id(224), label: "Caffè · Giochi e posta", position: 3 },
    ],
  },
];

/** Voti dimostrativi, così i risultati non partono da zero. */
export const demoVotes: { poll_id: string; option_id: string; count: number }[] = [
  { poll_id: id(201), option_id: id(211), count: 14 },
  { poll_id: id(201), option_id: id(212), count: 9 },
  { poll_id: id(201), option_id: id(213), count: 11 },
  { poll_id: id(201), option_id: id(214), count: 5 },
  { poll_id: id(202), option_id: id(221), count: 8 },
  { poll_id: id(202), option_id: id(222), count: 12 },
  { poll_id: id(202), option_id: id(223), count: 7 },
  { poll_id: id(202), option_id: id(224), count: 15 },
];

const crossword = buildCrossword([
  { answer: "CASTAGNA", clue: "Frutto protetto dal riccio, protagonista del Secondo" },
  { answer: "SALVIA", clue: "Erba aromatica che si sposa con il burro" },
  { answer: "LIEVITO", clue: "Fa crescere l'impasto mentre dormiamo" },
  { answer: "BRIGATA", clue: "La squadra che lavora in cucina" },
  { answer: "COMANDA", clue: "Collega la sala alla cucina" },
  { answer: "SERRA", clue: "Protegge le piantine dal freddo" },
  { answer: "ZUCCA", clue: "Ortaggio arancione d'autunno" },
  { answer: "MOKA", clue: "Caffettiera italiana da fornello" },
  { answer: "FARINA", clue: "Si ottiene macinando i chicchi" },
  { answer: "SEMINA", clue: "Si fa in primavera per raccogliere in autunno" },
  { answer: "ORTO", clue: "Pezzo di terra coltivato a verdure" },
  { answer: "SALA", clue: "Dove si accolgono gli ospiti del ristorante" },
]).data;

export const demoGames: Game[] = [
  {
    id: id(301),
    kind: "crossword",
    title: "Il cruciverba della dispensa",
    intro: "Dodici parole tra campi, cucina e sala. Si gioca direttamente qui, anche dal telefono.",
    status: "published",
    issue_id: ISSUE_ONE,
    is_demo: true,
    created_at: "2026-12-01T08:00:00.000Z",
    data: crossword,
  },
  {
    id: id(302),
    kind: "quiz",
    title: "Quiz: di che stagione sei?",
    intro: "Cinque domande su frutta e verdura di stagione. Alla fine trovi il punteggio e le spiegazioni.",
    status: "published",
    issue_id: ISSUE_ONE,
    is_demo: true,
    created_at: "2026-12-01T08:00:00.000Z",
    data: {
      questions: [
        {
          question: "In quale stagione si raccolgono le castagne?",
          options: ["Primavera", "Estate", "Autunno", "Inverno"],
          answer: 2,
          explanation: "I ricci si aprono e le castagne cadono tra fine settembre e novembre.",
        },
        {
          question: "Quale di questi ortaggi è tipicamente invernale?",
          options: ["Pomodoro", "Cavolo nero", "Zucchina", "Melanzana"],
          answer: 1,
          explanation: "Il cavolo nero resiste al freddo e anzi diventa più dolce dopo le gelate.",
        },
        {
          question: "Quando si seminano di solito le zucche?",
          options: ["Ad aprile-maggio", "A luglio", "A novembre", "A gennaio"],
          answer: 0,
          explanation: "Si seminano quando il terreno si è scaldato, per raccoglierle a fine estate.",
        },
        {
          question: "Qual è il frutto simbolo della stagione estiva tra questi?",
          options: ["Arancia", "Cachi", "Albicocca", "Mandarino"],
          answer: 2,
          explanation: "Le albicocche maturano tra giugno e luglio; arance, mandarini e cachi sono autunnali o invernali.",
        },
        {
          question: "Perché conviene cucinare con prodotti di stagione?",
          options: [
            "Sono più saporiti e di solito costano meno",
            "Sono sempre biologici",
            "Non vanno lavati",
            "Si conservano per anni",
          ],
          answer: 0,
          explanation:
            "Raccolti al momento giusto hanno più sapore e, quando sono abbondanti, costano meno. Non sono per forza biologici.",
        },
      ],
    },
  },
];

export const demoSubmissions: Submission[] = [
  {
    id: id(401),
    kind: "domanda",
    title: "Perché il pane raffermo diventa duro?",
    message:
      "Il pane del giorno prima è duro ma non è secco come un biscotto. Che cosa succede davvero?",
    signature: "Una lettrice curiosa",
    class_label: null,
    status: "published",
    answer:
      "Non è solo questione di acqua che evapora. L'amido del pane, dopo la cottura, si riorganizza lentamente in una struttura più rigida: si chiama retrogradazione. Per questo una fetta di pane raffermo, scaldata in forno, torna in parte morbida. (Risposta dimostrativa)",
    is_demo: true,
    created_at: "2026-11-10T09:00:00.000Z",
    published_at: "2026-12-01",
  },
  {
    id: id(402),
    kind: "domanda",
    title: "Biologico e «a km zero» sono la stessa cosa?",
    message: "Al supermercato vedo entrambe le scritte. Cambia qualcosa?",
    signature: "G., classe seconda",
    class_label: null,
    status: "published",
    answer:
      "No. «Biologico» indica un metodo di produzione regolato da norme europee e controllato da enti certificatori. «A km zero» indica invece che il prodotto viene da vicino, ma non dice nulla sul metodo di coltivazione. Un prodotto può essere l'uno, l'altro, entrambi o nessuno dei due. (Risposta dimostrativa)",
    is_demo: true,
    created_at: "2026-11-12T09:00:00.000Z",
    published_at: "2026-12-01",
  },
  {
    id: id(403),
    kind: "lettera",
    title: "Più spazio ai disegni",
    message:
      "Non mi piace scrivere, ma disegno molto. Ci sarà spazio anche per le vignette e le illustrazioni nel giornale?",
    signature: "Matita Rossa",
    class_label: null,
    status: "published",
    answer:
      "Certo: la Terza Pagina è aperta a vignette, disegni e fumetti. Puoi proporre il tuo lavoro alla redazione e, se vuoi, firmarlo con uno pseudonimo. (Risposta dimostrativa)",
    is_demo: true,
    created_at: "2026-11-15T09:00:00.000Z",
    published_at: "2026-12-01",
  },
  {
    id: id(404),
    kind: "contributo",
    title: "Proposta: una rubrica sulla musica",
    message:
      "Potremmo fare una piccola rubrica con le canzoni che ascoltiamo in laboratorio mentre lavoriamo? (Contributo dimostrativo in attesa di moderazione)",
    signature: "DJ Mestolo",
    class_label: null,
    status: "pending",
    answer: null,
    is_demo: true,
    created_at: "2026-11-20T09:00:00.000Z",
    published_at: null,
  },
];

export const demoSettings: Settings = defaultSettings;
