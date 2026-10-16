"use client";

import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "pap_analytics";
const CHANGED = "pap-analytics-change";
const OPEN = "pap-analytics-open";

type Choice = "si" | "no" | null;

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  return () => window.removeEventListener(CHANGED, onChange);
}

function readChoice(): Choice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "si" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Google Analytics, attivo solo se NEXT_PUBLIC_GA_ID è impostato e solo dopo il consenso.
 * Alla prima visita compare una finestra al centro; la scelta si può cambiare in ogni momento
 * dal link «Preferenze statistiche» nel piè di pagina.
 */
export function Analytics() {
  // Lato server la scelta è sconosciuta (undefined): non si mostra nulla finché il browser non ha letto la preferenza.
  const choice = useSyncExternalStore<Choice | undefined>(subscribe, readChoice, () => undefined);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN, open);
    return () => window.removeEventListener(OPEN, open);
  }, []);

  useEffect(() => {
    if (!reopened) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setReopened(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reopened]);

  if (!GA_ID || choice === undefined) return null;

  function decide(value: "si" | "no") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* si ripresenterà alla visita successiva */
    }
    setReopened(false);
    window.dispatchEvent(new Event(CHANGED));
    if (value === "no") {
      // Se il permesso viene tolto, il tracciamento già caricato smette alla prossima pagina.
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true;
    }
  }

  const show = choice === null || reopened;

  return (
    <>
      {choice === "si" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ga-titolo"
            className="relative w-full max-w-lg rounded-md bg-paper bg-[image:var(--paper-grain)] p-8 text-ink shadow-2xl sm:p-10"
          >
            <div className="pointer-events-none absolute inset-2 rounded-sm border border-ink/70" />
            <div className="pointer-events-none absolute inset-[14px] rounded-sm border border-ink/25" />
            <div className="relative">
              <p className="kicker text-ink-mute">Il coperto</p>
              <h2 id="ga-titolo" className="font-display-wonk mt-1 text-4xl italic">
                Due parole sulle statistiche
              </h2>
              <p className="mt-4 text-ink-soft">
                Per capire quanto e come viene letto il giornale usiamo, solo se sei d&apos;accordo, Google Analytics: conta le visite
                e le pagine lette, con indirizzo IP anonimizzato. Non serve per leggere e non c&apos;è pubblicità. Puoi cambiare idea
                quando vuoi dal link «Preferenze statistiche» in fondo alla pagina.
              </p>
              <p className="mt-3 text-sm">
                <a href="/privacy" className="link-underline font-semibold">
                  Leggi l&apos;informativa
                </a>
                {choice !== null && (
                  <span className="text-ink-mute"> · Scelta attuale: {choice === "si" ? "accettate" : "rifiutate"}</span>
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => decide("si")}
                  className="rounded-full bg-ink px-6 py-3 font-semibold text-paper transition hover:bg-tomato-ink"
                >
                  Accetta
                </button>
                <button
                  type="button"
                  onClick={() => decide("no")}
                  className="rounded-full border border-ink/40 px-6 py-3 font-semibold transition hover:bg-ink hover:text-paper"
                >
                  Rifiuta
                </button>
                {reopened && (
                  <button type="button" onClick={() => setReopened(false)} className="px-3 py-3 text-ink-mute underline">
                    Chiudi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Link «Preferenze statistiche» per il piè di pagina; compare solo se Analytics è configurato. */
export function AnalyticsPreferences({ className }: { className?: string }) {
  if (!GA_ID) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN))}>
      Preferenze statistiche
    </button>
  );
}
