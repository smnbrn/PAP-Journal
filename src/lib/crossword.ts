import type { CrosswordData, CrosswordWord } from "./types";

/** Lettere maiuscole senza accenti, spazi o apostrofi: «Caffè» → «CAFFE». */
export function normalizeAnswer(answer: string) {
  return answer
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

type Placed = { answer: string; clue: string; row: number; col: number; dir: "across" | "down" };

const SIZE = 41;

/**
 * Dispone automaticamente le parole in una griglia di cruciverba.
 * La redazione scrive solo «parola – definizione»; l'incrocio lo calcola il sito.
 * Restituisce anche le parole che non è stato possibile incrociare.
 */
export function buildCrossword(entries: { answer: string; clue: string }[]): {
  data: CrosswordData;
  skipped: string[];
} {
  const clean = entries
    .map((e) => ({ answer: normalizeAnswer(e.answer), clue: e.clue.trim() }))
    .filter((e) => e.answer.length >= 2 && e.clue.length > 0);

  // Parole lunghe per prime: fanno da spina dorsale alla griglia.
  const ordered = [...clean].sort((a, b) => b.answer.length - a.answer.length);
  const grid: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  const placed: Placed[] = [];
  const skipped: string[] = [];

  const cell = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < SIZE && c < SIZE ? grid[r][c] : null;

  function fits(word: string, row: number, col: number, dir: "across" | "down") {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    const endR = row + dr * (word.length - 1);
    const endC = col + dc * (word.length - 1);
    if (row < 0 || col < 0 || endR >= SIZE || endC >= SIZE) return -1;
    // La casella prima e quella dopo la parola devono essere vuote.
    if (cell(row - dr, col - dc) || cell(endR + dr, endC + dc)) return -1;
    let crossings = 0;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = grid[r][c];
      if (existing) {
        if (existing !== word[i]) return -1;
        crossings++;
      } else {
        // Niente parole parallele attaccate.
        if (cell(r + dc, c + dr) || cell(r - dc, c - dr)) return -1;
      }
    }
    return crossings;
  }

  function place(p: Placed) {
    const dr = p.dir === "down" ? 1 : 0;
    const dc = p.dir === "across" ? 1 : 0;
    for (let i = 0; i < p.answer.length; i++) grid[p.row + dr * i][p.col + dc * i] = p.answer[i];
    placed.push(p);
  }

  for (const entry of ordered) {
    if (placed.length === 0) {
      const col = Math.floor((SIZE - entry.answer.length) / 2);
      place({ ...entry, row: Math.floor(SIZE / 2), col, dir: "across" });
      continue;
    }
    let best: { p: Placed; score: number } | null = null;
    for (const other of placed) {
      for (let i = 0; i < other.answer.length; i++) {
        for (let j = 0; j < entry.answer.length; j++) {
          if (other.answer[i] !== entry.answer[j]) continue;
          const dir = other.dir === "across" ? "down" : "across";
          const r = other.dir === "across" ? other.row - j : other.row + i;
          const c = other.dir === "across" ? other.col + i : other.col - j;
          const crossings = fits(entry.answer, r, c, dir);
          if (crossings < 1) continue;
          // Preferisce più incroci e una griglia compatta, vicina al centro.
          const centre = Math.abs(r - SIZE / 2) + Math.abs(c - SIZE / 2);
          const score = crossings * 100 - centre;
          if (!best || score > best.score) best = { p: { ...entry, row: r, col: c, dir }, score };
        }
      }
    }
    if (best) place(best.p);
    else skipped.push(entry.answer);
  }

  if (placed.length === 0) {
    return { data: { entries: clean, layout: { width: 0, height: 0, words: [] } }, skipped };
  }

  // Ritaglia la griglia sulle parole collocate.
  let minR = SIZE, minC = SIZE, maxR = 0, maxC = 0;
  for (const p of placed) {
    const endR = p.row + (p.dir === "down" ? p.answer.length - 1 : 0);
    const endC = p.col + (p.dir === "across" ? p.answer.length - 1 : 0);
    minR = Math.min(minR, p.row);
    minC = Math.min(minC, p.col);
    maxR = Math.max(maxR, endR);
    maxC = Math.max(maxC, endC);
  }

  // Numerazione classica: da sinistra a destra, dall'alto in basso.
  const shifted = placed.map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }));
  const starts = [...new Set(shifted.map((p) => `${p.row}:${p.col}`))].sort((a, b) => {
    const [ar, ac] = a.split(":").map(Number);
    const [br, bc] = b.split(":").map(Number);
    return ar - br || ac - bc;
  });
  const numbers = new Map(starts.map((key, i) => [key, i + 1]));
  const words: CrosswordWord[] = shifted
    .map((p) => ({ ...p, number: numbers.get(`${p.row}:${p.col}`)! }))
    .sort((a, b) => a.number - b.number);

  return {
    data: {
      entries: clean,
      layout: { width: maxC - minC + 1, height: maxR - minR + 1, words },
    },
    skipped,
  };
}

/** Converte il testo dell'editor («PAROLA - definizione» per riga) in voci. */
export function parseCrosswordText(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s*[-–—:|]\s*(.+)$/);
      return match ? { answer: match[1], clue: match[2] } : { answer: line, clue: "" };
    });
}
