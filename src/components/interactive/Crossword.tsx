"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CrosswordData, CrosswordWord } from "@/lib/types";

type Dir = "across" | "down";
type Cell = { answer: string; number?: number; across?: number; down?: number };
const key = (r: number, c: number) => `${r}:${c}`;

/** Cruciverba giocabile: tastiera, tocco, controllo e soluzione. */
export function Crossword({ id, data }: { id: string; data: CrosswordData }) {
  const { width, height, words } = data.layout;
  const cells = useMemo(() => {
    const map = new Map<string, Cell>();
    words.forEach((w, i) => {
      for (let k = 0; k < w.answer.length; k++) {
        const r = w.row + (w.dir === "down" ? k : 0);
        const c = w.col + (w.dir === "across" ? k : 0);
        const cell = map.get(key(r, c)) ?? { answer: w.answer[k] };
        if (k === 0) cell.number = w.number;
        cell[w.dir] = i;
        map.set(key(r, c), cell);
      }
    });
    return map;
  }, [words]);

  const storage = `pap-cruciverba-${id}`;
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);
  const [dir, setDir] = useState<Dir>("across");
  const [checked, setChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // I progressi restano nel browser. Si leggono dopo il primo disegno,
  // così la pagina resta identica a quella preparata dal server.
  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const saved = localStorage.getItem(storage);
        if (saved) setLetters(JSON.parse(saved));
      } catch {}
      setLoaded(true);
    });
  }, [storage]);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storage, JSON.stringify(letters));
    } catch {}
  }, [letters, storage, loaded]);

  const activeCell = active ? cells.get(key(active.r, active.c)) : undefined;
  const effectiveDir: Dir = activeCell ? (activeCell[dir] !== undefined ? dir : dir === "across" ? "down" : "across") : dir;
  const activeWord: CrosswordWord | undefined =
    activeCell && activeCell[effectiveDir] !== undefined ? words[activeCell[effectiveDir]!] : undefined;

  const inWord = (r: number, c: number) => {
    if (!activeWord) return false;
    const k = activeWord.dir === "across" ? c - activeWord.col : r - activeWord.row;
    return activeWord.dir === "across"
      ? r === activeWord.row && k >= 0 && k < activeWord.answer.length
      : c === activeWord.col && k >= 0 && k < activeWord.answer.length;
  };

  const focus = useCallback(
    (r: number, c: number) => {
      document.getElementById(`cw-${id}-${r}-${c}`)?.focus();
    },
    [id],
  );

  const step = (r: number, c: number, delta: number, d: Dir) => {
    const nr = r + (d === "down" ? delta : 0);
    const nc = c + (d === "across" ? delta : 0);
    if (cells.has(key(nr, nc))) focus(nr, nc);
  };

  const total = cells.size;
  const filled = [...cells.keys()].filter((k) => letters[k]).length;
  const solved = filled === total && [...cells.entries()].every(([k, cell]) => letters[k] === cell.answer);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const arrows: Record<string, [number, Dir]> = {
      ArrowRight: [1, "across"],
      ArrowLeft: [-1, "across"],
      ArrowDown: [1, "down"],
      ArrowUp: [-1, "down"],
    };
    if (e.key in arrows) {
      e.preventDefault();
      const [delta, d] = arrows[e.key];
      setDir(d);
      step(r, c, delta, d);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      const k = key(r, c);
      setChecked(false);
      if (letters[k]) setLetters((l) => ({ ...l, [k]: "" }));
      else step(r, c, -1, effectiveDir);
    } else if (e.key === " ") {
      e.preventDefault();
      setDir((d) => (d === "across" ? "down" : "across"));
    }
  };

  const onInput = (value: string, r: number, c: number) => {
    const letter = value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(-1);
    if (!letter) return;
    setChecked(false);
    setLetters((l) => ({ ...l, [key(r, c)]: letter }));
    step(r, c, 1, effectiveDir);
  };

  const clues = (d: Dir) => words.map((w, i) => ({ w, i })).filter(({ w }) => w.dir === d);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <div className="sticky top-16 z-10 mb-4 min-h-14 rounded-md bg-ink px-4 py-3 text-paper" aria-live="polite">
          {activeWord ? (
            <p>
              <span className="kicker mr-2 text-saffron">
                {activeWord.number} {activeWord.dir === "across" ? "orizzontale" : "verticale"}
              </span>
              {activeWord.clue}
            </p>
          ) : (
            <p className="text-paper/70">Tocca una casella per cominciare. Tocca di nuovo per cambiare direzione.</p>
          )}
        </div>
        <div
          className="mx-auto grid select-none gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`, maxWidth: `min(100%, ${width * 3}rem)` }}
          role="grid"
          aria-label="Griglia del cruciverba"
        >
          {Array.from({ length: height }).map((_, r) =>
            Array.from({ length: width }).map((_, c) => {
              const cell = cells.get(key(r, c));
              if (!cell) return <div key={key(r, c)} aria-hidden />;
              const k = key(r, c);
              const isActive = active?.r === r && active?.c === c;
              const wrong = checked && letters[k] && letters[k] !== cell.answer;
              return (
                <div key={k} className="relative aspect-square" role="gridcell">
                  {cell.number && (
                    <span className="pointer-events-none absolute top-0.5 left-1 z-10 font-mono text-[0.55rem] leading-none sm:text-[0.65rem]">
                      {cell.number}
                    </span>
                  )}
                  <input
                    id={`cw-${id}-${r}-${c}`}
                    value={letters[k] ?? ""}
                    onChange={(e) => onInput(e.target.value, r, c)}
                    onKeyDown={(e) => onKey(e, r, c)}
                    onFocus={() => setActive({ r, c })}
                    onClick={() => {
                      if (isActive) setDir((d) => (d === "across" ? "down" : "across"));
                    }}
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={2}
                    aria-label={`Casella riga ${r + 1}, colonna ${c + 1}${cell.number ? `, numero ${cell.number}` : ""}`}
                    className={`absolute inset-0 h-full w-full rounded-[3px] border-2 text-center font-mono text-base font-medium uppercase caret-transparent outline-none sm:text-xl ${
                      isActive
                        ? "border-tomato bg-saffron/60"
                        : inWord(r, c)
                          ? "border-ink bg-saffron/25"
                          : "border-ink bg-paper"
                    } ${wrong ? "text-tomato-ink line-through" : ""}`}
                  />
                </div>
              );
            }),
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-ink" onClick={() => setChecked(true)}>
            Controlla
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setLetters(Object.fromEntries([...cells.entries()].map(([k, cell]) => [k, cell.answer])))}
          >
            Mostra la soluzione
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setLetters({});
              setChecked(false);
            }}
          >
            Ricomincia
          </button>
          <span className="font-mono text-sm text-ink-mute">
            {filled}/{total} caselle
          </span>
        </div>
        <p role="status" className="mt-4 min-h-7 font-semibold">
          {solved
            ? "Complimenti, cruciverba risolto!"
            : checked
              ? filled < total
                ? "Le lettere sbagliate sono barrate. Mancano ancora alcune caselle."
                : "Ci sono ancora lettere sbagliate: le trovi barrate."
              : ""}
        </p>
      </div>

      <div className="grid content-start gap-8 sm:grid-cols-2 lg:grid-cols-1">
        {(["across", "down"] as Dir[]).map((d) => (
          <div key={d}>
            <h2 className="kicker mb-3 border-b border-ink pb-2 text-ink-mute">{d === "across" ? "Orizzontali" : "Verticali"}</h2>
            <ol className="space-y-2">
              {clues(d).map(({ w }) => {
                const on = activeWord === w;
                return (
                  <li key={`${d}-${w.number}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setDir(d);
                        focus(w.row, w.col);
                      }}
                      className={`w-full rounded px-2 py-1.5 text-left transition ${on ? "bg-saffron/40" : "hover:bg-paper-2"}`}
                    >
                      <span className="font-mono mr-2 font-semibold">{w.number}</span>
                      {w.clue}
                      <span className="ml-1 text-ink-mute">({w.answer.length})</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
