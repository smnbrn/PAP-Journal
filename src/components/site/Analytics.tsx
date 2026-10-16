"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const KEY = "pap_analytics";

type Choice = "si" | "no" | null;

const EVENT = "pap-analytics-change";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
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
 * Google Analytics, attivo solo se la variabile NEXT_PUBLIC_GA_ID è impostata
 * e solo dopo che il lettore ha accettato. Senza consenso non viene caricato nulla.
 */
export function Analytics() {
  // Lato server la scelta è sconosciuta (undefined): non si mostra nulla finché il browser non ha letto la preferenza.
  const choice = useSyncExternalStore<Choice | undefined>(subscribe, readChoice, () => undefined);

  if (!GA_ID || choice === undefined) return null;

  function decide(value: "si" | "no") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* si ripresenterà alla visita successiva */
    }
    window.dispatchEvent(new Event(EVENT));
  }

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
      {choice === null && (
        <div
          role="dialog"
          aria-label="Statistiche di visita"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-md border border-ink/30 bg-paper p-4 text-sm shadow-2xl sm:p-5"
        >
          <p className="text-ink-soft">
            Vuoi aiutarci a capire quanto viene letto il giornale? Con il tuo permesso usiamo Google Analytics per statistiche di visita
            anonime. Se rifiuti, il sito funziona uguale e non carichiamo nulla.{" "}
            <a href="/privacy" className="link-underline font-semibold text-ink">
              Maggiori informazioni
            </a>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => decide("si")}
              className="rounded-full bg-ink px-4 py-2 font-semibold text-paper transition hover:bg-tomato-ink"
            >
              Accetta
            </button>
            <button
              type="button"
              onClick={() => decide("no")}
              className="rounded-full border border-ink/40 px-4 py-2 font-semibold transition hover:bg-ink hover:text-paper"
            >
              Rifiuta
            </button>
          </div>
        </div>
      )}
    </>
  );
}
