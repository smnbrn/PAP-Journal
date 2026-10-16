/**
 * Configurazione della testata.
 *
 * Il nome del giornale, il sottotitolo e le informazioni sulla scuola si possono
 * cambiare in due modi:
 *  1. dall'area redazione → Impostazioni (consigliato: nessuna modifica al codice);
 *  2. modificando i valori predefiniti qui sotto, usati finché le impostazioni
 *     non vengono salvate dalla redazione.
 */
import type { CourseSlug, Settings } from "./types";

export const defaultSettings: Settings = {
  masthead: "Pane al Pane",
  tagline: "Il giornale degli studenti",
  school_name: "IPSEOA «Giulio Pastore»",
  school_sites: "Varallo e Gattinara",
  school_year: "2026/2027",
  about:
    "Un giornale scritto dagli studenti del Pastore. Agrario e alberghiero lavorano nella stessa redazione: la pianta raccontata da chi la coltiva diventa l'ingrediente di una ricetta preparata da chi la cucina.",
  footer_note:
    "Progetto editoriale scolastico. I testi sono rivisti dalla redazione e dai docenti referenti; nomi e fotografie degli studenti sono pubblicati solo con le autorizzazioni previste dalla scuola.",
};

export type Course = {
  slug: CourseSlug;
  /** Nome gastronomico della portata */
  course: string;
  /** Nome giornalistico della rubrica */
  section: string;
  /** Pagine del numero stampato */
  pages: string;
  short: string;
  description: string;
  /** Colore di accento (sfondi, filetti, titoli grandi) */
  color: string;
  /** Variante scura del colore, sicura per testo piccolo su carta */
  ink: string;
  /** Colore chiaro per fondi tenui */
  wash: string;
};

export const courses: Course[] = [
  {
    slug: "aperitivo",
    course: "Aperitivo",
    section: "Prima pagina",
    pages: "pag. 1",
    short: "Editoriale, il numero in breve e le notizie flash.",
    description:
      "Si comincia da qui: l'editoriale della redazione, la presentazione del numero e le brevi del mese, da leggere in piedi come un buon aperitivo.",
    color: "#C8432B",
    ink: "#A3311B",
    wash: "#F6DDD3",
  },
  {
    slug: "primo",
    course: "Primo",
    section: "Vita del Pastore",
    pages: "pag. 2–3",
    short: "Iniziative, laboratori ed esperienze raccontate dagli studenti.",
    description:
      "Le iniziative della scuola raccontate da chi le vive: laboratori, uscite, stage, sala e cucina, serre e campi. Il Pastore visto da dentro.",
    color: "#C98A1B",
    ink: "#875A00",
    wash: "#F5E6C4",
  },
  {
    slug: "secondo",
    course: "Secondo",
    section: "Dal campo al piatto",
    pages: "pag. 4–5",
    short: "La pianta dell'agrario diventa la ricetta dell'alberghiero.",
    description:
      "La doppia pagina centrale: una pianta o un ingrediente raccontato dagli studenti dell'agrario diventa il protagonista di una ricetta preparata dagli studenti dell'alberghiero.",
    color: "#22402F",
    ink: "#22402F",
    wash: "#DCE5D6",
  },
  {
    slug: "contorno",
    course: "Contorno",
    section: "La Piazza",
    pages: "pag. 6",
    short: "Attualità, geopolitica e le domande dei lettori.",
    description:
      "Attualità e geopolitica spiegate con calma, distinguendo i fatti dalle opinioni. E le vostre domande: le risposte arrivano nel numero successivo.",
    color: "#6F8F6A",
    ink: "#45633F",
    wash: "#E2EADD",
  },
  {
    slug: "dessert",
    course: "Dessert",
    section: "La Terza Pagina",
    pages: "pag. 7",
    short: "Racconti, poesie, vignette e altre creazioni.",
    description:
      "Lo spazio della scrittura creativa: racconti, poesie, vignette e disegni. Si può firmare con il proprio nome, con uno pseudonimo o non firmare affatto.",
    color: "#9C4565",
    ink: "#86324F",
    wash: "#F1DDE3",
  },
  {
    slug: "caffe",
    course: "Caffè",
    section: "Giochi e posta",
    pages: "pag. 8",
    short: "Cruciverba, sondaggi e lettere alla redazione.",
    description:
      "Per chiudere in bellezza: il cruciverba, il sondaggio del mese e la posta dei lettori. Qui si gioca, si vota e si scrive alla redazione.",
    color: "#6B4630",
    ink: "#6B4630",
    wash: "#EADCCF",
  },
];

export const courseBySlug = Object.fromEntries(
  courses.map((c) => [c.slug, c]),
) as Record<CourseSlug, Course>;

export function isCourseSlug(value: string): value is CourseSlug {
  return value in courseBySlug;
}

export function nextCourse(slug: CourseSlug): Course | null {
  const i = courses.findIndex((c) => c.slug === slug);
  return courses[i + 1] ?? null;
}

export function previousCourse(slug: CourseSlug): Course | null {
  const i = courses.findIndex((c) => c.slug === slug);
  return i > 0 ? courses[i - 1] : null;
}

/** Calendario editoriale dell'anno scolastico: sette uscite mensili. */
export const editorialCalendar: { number: number; month: string; note?: string }[] = [
  { number: 1, month: "2026-12-01" },
  { number: 2, month: "2027-01-01" },
  { number: 3, month: "2027-02-01" },
  { number: 4, month: "2027-03-01" },
  { number: 5, month: "2027-04-01" },
  { number: 6, month: "2027-05-01" },
  { number: 7, month: "2027-06-01", note: "Numero speciale di fine anno" },
];
