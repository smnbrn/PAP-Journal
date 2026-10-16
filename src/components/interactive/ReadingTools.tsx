"use client";
import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Barra sottile che mostra quanto manca alla fine dell'articolo. */
export function ReadingProgress({ color }: { color: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = document.getElementById("testo-articolo");
    if (!target) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
      bar.current?.style.setProperty("--progress", String(progress));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1" aria-hidden>
      <div ref={bar} className="reading-bar h-full" style={{ background: color }} />
    </div>
  );
}

/**
 * Condivisione con il menù nativo del telefono; sui computer copia il link.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2500);
  };
  return (
    <button type="button" onClick={share} className="btn btn-outline px-4 py-2 text-sm">
      {state === "copied" ? <Check className="size-4" /> : state === "error" ? <Link2 className="size-4" /> : <Share2 className="size-4" />}
      <span aria-live="polite">
        {state === "copied" ? "Link copiato" : state === "error" ? "Copia il link dalla barra" : "Condividi"}
      </span>
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-outline px-4 py-2 text-sm print:hidden">
      Stampa la ricetta
    </button>
  );
}
