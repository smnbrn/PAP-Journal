import type { Metadata } from "next";
import Link from "next/link";
import { CourseIcon, WheatMark } from "@/components/site/CourseIcon";
import { getSettings } from "@/lib/data";
import { courses } from "@/lib/site.config";

export const metadata: Metadata = {
  title: "Il progetto",
  description: "Perché un giornale degli studenti, come funziona la redazione e quali regole segue.",
};

const reasons = [
  ["Voce agli studenti", "Si scrive per lettori veri: si impara a scegliere gli argomenti, organizzare il lavoro e rivolgersi a un pubblico diverso."],
  ["Identità della scuola", "Agrario e alberghiero si incontrano in una redazione comune e collaborano alla doppia pagina centrale."],
  ["Competenze", "Scrivere, intervistare, verificare le notizie e rispettare le scadenze: abilità utili anche nel mondo del lavoro."],
  ["Inclusione", "C'è spazio per chi ama scrivere, ma anche per chi preferisce fotografie, disegni, racconti o poesie."],
  ["Lettori critici", "Attualità e geopolitica per capire il mondo, distinguere i fatti dalle opinioni e confrontarsi con rispetto."],
  ["Orientamento", "Agli open day il giornale può raccontare la scuola attraverso gli occhi degli studenti."],
];

const rules = [
  "Notizie verificate, sempre con fonti affidabili.",
  "Distinzione chiara fra fatti e opinioni.",
  "Rispetto delle persone di cui si parla.",
  "Tutela della privacy e del diritto d'autore.",
  "Racconti, poesie e disegni possono uscire senza firma o con uno pseudonimo: il docente referente conosce gli autori e ne tutela la riservatezza.",
  "I temi e la linea editoriale li scelgono gli studenti; i docenti aiutano a verificare le informazioni e a rivedere i testi.",
];

export default async function ProjectPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
      <header className="grid gap-10 border-b border-ink pt-12 pb-12 sm:pt-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="kicker text-ink-mute">
            {settings.school_name} · {settings.school_sites} · a.s. {settings.school_year}
          </p>
          <h1 className="font-display-wonk animate-rise mt-4 text-[clamp(3rem,9vw,7.5rem)] leading-[0.88]">
            Il progetto <span className="italic">{settings.masthead}</span>
          </h1>
        </div>
        <p className="font-display self-end text-2xl leading-snug italic text-ink-soft">{settings.about}</p>
      </header>

      <section className="mt-16 grid gap-12 lg:grid-cols-[18rem_1fr]" aria-labelledby="perche">
        <h2 id="perche" className="font-display text-4xl">
          Perché un giornale
        </h2>
        <div>
          <p className="max-w-3xl text-xl leading-relaxed">
            Scrivere un giornale significa mettersi alla prova: cercare notizie, verificare le fonti, ascoltare punti di vista diversi e
            scegliere come raccontarli. È un modo per conoscere meglio la propria scuola e ciò che accade fuori, imparando anche a
            riconoscere le notizie false.
          </p>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {reasons.map(([t, d]) => (
              <div key={t} className="border-t-2 border-ink pt-4">
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-1 text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-20 grid gap-12 lg:grid-cols-[18rem_1fr]" aria-labelledby="menu-numero">
        <h2 id="menu-numero" className="font-display text-4xl">
          Il menù di ogni numero
        </h2>
        <ol className="rounded-md border-[3px] border-double border-ink p-6 sm:p-10">
          {courses.map((c) => (
            <li key={c.slug} className="border-b border-dotted border-ink/30 py-4 last:border-0">
              <Link href={`/menu/${c.slug}`} className="group flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <CourseIcon course={c.slug} className="size-6 self-center" />
                <span className="font-display-wonk text-3xl italic" style={{ color: c.ink }}>
                  {c.course}
                </span>
                <span className="leader hidden sm:block" />
                <span className="font-semibold">{c.section}</span>
                <span className="kicker text-ink-mute">{c.pages}</span>
              </Link>
              <p className="mt-1 pl-9 text-ink-soft">{c.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 grid gap-12 lg:grid-cols-[18rem_1fr]" aria-labelledby="regole">
        <h2 id="regole" className="font-display text-4xl">
          Il codice della redazione
        </h2>
        <div>
          <p className="max-w-3xl text-lg text-ink-soft">
            Poche regole chiare, scritte insieme agli studenti. Prima del primo numero sono previsti incontri pratici su come si scrive
            un articolo, si conduce un&apos;intervista e si verificano le fonti.
          </p>
          <ul className="mt-8 space-y-4">
            {rules.map((r) => (
              <li key={r} className="flex gap-4 text-lg">
                <WheatMark className="mt-1 h-5 w-5 shrink-0 text-tomato" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20 grid gap-12 lg:grid-cols-[18rem_1fr]" aria-labelledby="tempi">
        <h2 id="tempi" className="font-display text-4xl">
          I tempi
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            ["Avvio", "Ottobre–novembre 2026", "Delibera, formazione della redazione e scelta del nome."],
            ["In uscita", "Dicembre 2026 – maggio 2027", "Primo numero a dicembre, poi un'uscita al mese."],
            ["Gran finale", "Giugno 2027", "Numero speciale, questionari di gradimento e relazione al Collegio."],
          ].map(([t, when, d], i) => (
            <li key={t} className="rounded-md bg-paper-2 p-6">
              <span className="font-display-wonk text-5xl text-tomato">{i + 1}</span>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="kicker mt-1 text-ink-mute">{when}</p>
              <p className="mt-3 text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
