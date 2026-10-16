import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

const LINKEDIN_SIMONE = "https://www.linkedin.com/in/simonebruni14/";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

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
            <strong>Progettazione e sviluppo del sito:</strong> Simone Bruni{" "}
            <a
              href={LINKEDIN_SIMONE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Simone Bruni su LinkedIn"
              title="Simone Bruni su LinkedIn"
              className="inline-flex align-[-0.15em] text-ink-soft transition hover:text-tomato"
            >
              <LinkedInIcon className="size-[1.1em]" />
            </a>.
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
