import type { Metadata } from "next";
import { Suspense } from "react";
import { ContributionForm } from "@/components/interactive/ContributionForm";
import { CourseIcon } from "@/components/site/CourseIcon";

export const metadata: Metadata = {
  title: "Scrivi alla redazione",
  description: "Invia una domanda, una lettera o un contributo creativo alla redazione del giornale.",
};

export default function WritePage({ searchParams }: PageProps<"/scrivi">) {
  return (
    <div className="mx-auto grid max-w-[88rem] gap-12 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.4fr]">
      <header>
        <p className="kicker flex items-center gap-2 text-coffee">
          <CourseIcon course="caffe" className="size-5" /> Caffè · La posta
        </p>
        <h1 className="font-display-wonk mt-4 text-[clamp(3rem,8vw,6.5rem)] leading-[0.88]">
          Scrivi alla <span className="italic">redazione</span>
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          Domande per La Piazza, lettere per la posta, racconti e poesie per la Terza Pagina: ogni messaggio viene letto dalla
          redazione prima di essere pubblicato.
        </p>
        <ul className="mt-8 max-w-md space-y-4 border-t border-ink pt-6 text-sm">
          <li>
            <strong>Niente dati personali.</strong> Non chiediamo email né telefono: puoi firmarti con le iniziali o con uno pseudonimo.
          </li>
          <li>
            <strong>Sempre moderato.</strong> Nessun messaggio compare sul sito senza l&apos;approvazione della redazione.
          </li>
          <li>
            <strong>Rispetto per tutti.</strong> Non verranno pubblicati messaggi offensivi o che parlano di altre persone senza il loro
            consenso.
          </li>
        </ul>
      </header>
      <div className="rounded-md bg-paper p-6 shadow-[0_0_0_1.5px_var(--color-ink)] sm:p-10">
        <Suspense fallback={<ContributionForm />}>
          <FormWithKind searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FormWithKind({ searchParams }: { searchParams: PageProps<"/scrivi">["searchParams"] }) {
  const { tipo } = await searchParams;
  return <ContributionForm defaultKind={typeof tipo === "string" ? tipo : undefined} />;
}
