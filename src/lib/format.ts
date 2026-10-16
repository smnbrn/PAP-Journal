const monthFormatter = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});
const dayFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});
const shortFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Rome",
});

function parse(date: string) {
  // Le date "solo giorno" vengono lette a mezzogiorno per evitare slittamenti di fuso.
  return new Date(date.length === 10 ? `${date}T12:00:00Z` : date);
}

export function formatMonth(date: string) {
  const s = monthFormatter.format(parse(date));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDay(date: string | null) {
  return date ? dayFormatter.format(parse(date)) : "";
}

export function formatShort(date: string | null) {
  return date ? shortFormatter.format(parse(date)) : "";
}

export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(html: string) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "-")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "articolo"
  );
}

export function normalizeForSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function issueLabel(issue: { number: number; month: string }) {
  return `${issue.number === 0 ? "Numero zero" : `Numero ${issue.number}`} · ${formatMonth(issue.month)}`;
}
