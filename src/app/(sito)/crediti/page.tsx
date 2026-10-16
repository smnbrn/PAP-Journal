import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

const LINKEDIN_SIMONE = "https://www.linkedin.com/in/simonebruni14/";

export const metadata: Metadata = {
  title: "Crediti",
  description: "Chi ha realizzato il sito del giornale, con quali strumenti e con quali licenze.",
};

export default async function CreditsPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
      <p className="kicker text-ink-mute">{settings.masthead}</p>
      <h1 className="font-display-wonk mt-3 text-[clamp(2.6rem,7vw,5rem)] leading-[0.95]">Crediti</h1>
      <div className="prose-pap mt-10 [&>p:first-of-type]:first-letter:float-none [&>p:first-of-type]:first-letter:text-[1em]">
        <p>
          Chi ha messo insieme questo giornale, con che cosa e a quali condizioni si può riutilizzare. I testi, le fotografie e i
          disegni pubblicati negli articoli sono opera della redazione e restano degli autori.
        </p>

        <h2>Il giornale</h2>
        <ul>
          <li>
            <strong>Redazione e contenuti:</strong> gli studenti di {settings.school_name} ({settings.school_sites}), con i docenti
            referenti.
          </li>
          <li>
            <strong>Progetto editoriale:</strong> {settings.school_name}, anno scolastico {settings.school_year}.
          </li>
        </ul>

        <h2>Il sito</h2>
        <ul>
          <li>
            <strong>Ideazione e struttura del giornale:</strong> Andrea Giardina.
          </li>
          <li>
            <strong>Progettazione e sviluppo del sito:</strong>{" "}
            <a
              href={LINKEDIN_SIMONE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Simone Bruni su LinkedIn (si apre in una nuova scheda)"
              className="group text-ink! no-underline! hover:no-underline!"
            >
              <span className="border-b-[1.5px] border-tomato pb-px">Simone Bruni</span>
              <span className="kicker ml-2.5 align-middle text-tomato-ink transition group-hover:text-ink" aria-hidden="true">
                LinkedIn ↗
              </span>
            </a>
          </li>
          <li>
            <strong>Illustrazioni dimostrative:</strong> disegni originali creati per il progetto, in stile risograph. Si sostituiscono
            con le foto e i disegni della redazione.
          </li>
          <li>
            <strong>Codice:</strong> distribuito con licenza MIT (vedi il file <code>LICENSE</code> nel repository).
          </li>
        </ul>

        <h2>Strumenti e caratteri</h2>
        <ul>
          <li>
            <strong>Caratteri:</strong> Fraunces, Instrument Sans e IBM Plex Mono, tutti con licenza SIL Open Font License.
          </li>
          <li>
            <strong>Tecnologie:</strong> Next.js e React, Tailwind CSS, l&apos;editor Tiptap, il database Neon (PostgreSQL), Vercel
            per la pubblicazione e Vercel Blob per le immagini e i PDF.
          </li>
          <li>
            <strong>Icone:</strong> Lucide.
          </li>
        </ul>

        <p>
          Per segnalazioni sul sito o sui contenuti, usa il modulo «Scrivi alla redazione».
        </p>
      </div>
    </div>
  );
}
