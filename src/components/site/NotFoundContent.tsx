import Link from "next/link";

export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="kicker text-ink-mute">Errore 404</p>
      <h1 className="font-display-wonk mt-4 text-6xl leading-none sm:text-8xl">
        Piatto <span className="italic text-tomato">non disponibile</span>
      </h1>
      <p className="mt-6 text-lg text-ink-soft">
        La pagina che cerchi non è nel menù di oggi: forse è stata spostata, oppure l&apos;indirizzo contiene un errore.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-ink">
          Torna alla prima pagina
        </Link>
        <Link href="/cerca" className="btn btn-outline">
          Cerca un articolo
        </Link>
      </div>
    </div>
  );
}
