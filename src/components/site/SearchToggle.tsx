"use client";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Lente nella barra: apre un campo di ricerca senza cambiare pagina. */
export function SearchToggle() {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-full transition hover:bg-ink hover:text-paper"
        aria-expanded={open}
        aria-controls="ricerca-rapida"
        aria-label={open ? "Chiudi la ricerca" : "Cerca negli articoli"}
      >
        {open ? <X className="size-5" /> : <Search className="size-5" />}
      </button>
      {open && (
        <form
          id="ricerca-rapida"
          role="search"
          className="animate-rise absolute top-12 right-0 z-50 flex w-[min(88vw,24rem)] gap-2 rounded-md border border-ink bg-paper p-2 shadow-xl"
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.current?.value.trim();
            setOpen(false);
            router.push(q ? `/cerca?q=${encodeURIComponent(q)}` : "/cerca");
          }}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <label htmlFor="q-rapida" className="sr-only">
            Cerca per titolo o parola chiave
          </label>
          <input
            ref={input}
            id="q-rapida"
            name="q"
            type="search"
            placeholder="Castagne, sala, racconto…"
            className="min-w-0 flex-1 rounded bg-paper-2 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-tomato"
          />
          <button type="submit" className="btn btn-ink px-4 py-2">
            Cerca
          </button>
        </form>
      )}
    </div>
  );
}
