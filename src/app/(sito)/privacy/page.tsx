import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy e regole di pubblicazione",
  description: "Quali dati raccoglie il giornale, come vengono moderati i contributi e come si pubblicano nomi e fotografie.",
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 sm:pt-16">
      <p className="kicker text-ink-mute">{settings.masthead}</p>
      <h1 className="font-display-wonk mt-3 text-[clamp(2.6rem,7vw,5rem)] leading-[0.95]">Privacy e regole di pubblicazione</h1>
      <div className="prose-pap mt-10 [&>p:first-of-type]:first-letter:float-none [&>p:first-of-type]:first-letter:text-[1em]">
        <p>
          {settings.masthead} è un giornale scolastico realizzato dagli studenti di {settings.school_name} ({settings.school_sites}).
          Questa pagina spiega in modo semplice quali dati tratta il sito e con quali regole vengono pubblicati i contenuti.
          L&apos;informativa ufficiale è quella della scuola, che ne è titolare.
        </p>
        <h2>Che cosa raccogliamo dai lettori</h2>
        <ul>
          <li>
            <strong>Niente registrazione.</strong> Per leggere il giornale non serve creare un account.
          </li>
          <li>
            <strong>Modulo «Scrivi alla redazione».</strong> Salviamo solo ciò che scrivi: il messaggio e, se vuoi, un titolo, una firma
            (anche uno pseudonimo) e la classe. Non chiediamo email né numero di telefono.
          </li>
          <li>
            <strong>Sondaggi.</strong> Il voto è anonimo. Per evitare voti doppi il browser conserva un codice casuale in un cookie
            tecnico; nel database ne finisce solo un&apos;impronta cifrata, che non permette di risalire a chi ha votato.
          </li>
          <li>
            <strong>Nessun cookie di profilazione</strong> e nessuno strumento pubblicitario.
          </li>
        </ul>
        <h2>Moderazione</h2>
        <p>
          Nessun contributo dei lettori compare sul sito senza l&apos;approvazione della redazione. I messaggi offensivi, quelli che
          contengono dati personali di altre persone o che non rispettano il codice della redazione non vengono pubblicati.
        </p>
        <h2>Nomi e fotografie degli studenti</h2>
        <p>
          Nomi, fotografie e lavori degli studenti vengono pubblicati soltanto secondo le autorizzazioni e le procedure stabilite
          dalla scuola. Per gli studenti minorenni è previsto il coinvolgimento delle famiglie. Racconti, poesie e disegni possono essere
          pubblicati senza firma o con uno pseudonimo.
        </p>
        <h2>Contenuti dimostrativi</h2>
        <p>
          Gli articoli contrassegnati come «Esempio» sono testi dimostrativi preparati per mostrare l&apos;impaginazione del sito. Non
          raccontano fatti reali e non contengono dati personali.
        </p>
        <h2>Chiedere una correzione o una rimozione</h2>
        <p>
          Chi ritiene che un contenuto pubblicato lo riguardi e voglia chiederne la correzione o la rimozione può rivolgersi al docente
          referente del progetto o alla segreteria della scuola.
        </p>
      </div>
    </div>
  );
}
