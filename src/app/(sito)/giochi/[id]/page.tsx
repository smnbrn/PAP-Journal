import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crossword } from "@/components/interactive/Crossword";
import { Quiz } from "@/components/interactive/Quiz";
import { DemoBadge } from "@/components/site/bits";
import { CourseIcon } from "@/components/site/CourseIcon";
import { NextCourse } from "@/components/site/CourseRail";
import { getGame, getGames } from "@/lib/data";

export const instant = false;

export async function generateStaticParams() {
  const games = await getGames();
  return games.length ? games.map((g) => ({ id: g.id })) : [{ id: "00000000-0000-4000-8000-000000000000" }];
}

export async function generateMetadata({ params }: PageProps<"/giochi/[id]">): Promise<Metadata> {
  const { id } = await params;
  const game = await getGame(id);
  return { title: game?.title ?? "Gioco non trovato", description: game?.intro ?? undefined };
}

export default async function GamePage({ params }: PageProps<"/giochi/[id]">) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();

  return (
    <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
      <header className="border-b border-ink pt-12 pb-8 sm:pt-16">
        <p className="kicker flex items-center gap-2 text-coffee">
          <CourseIcon course="caffe" className="size-5" />
          <Link href="/menu/caffe" className="hover:underline">
            Caffè · Giochi e posta
          </Link>
          <span>/ {game.kind === "crossword" ? "Cruciverba" : "Quiz"}</span>
          {game.is_demo && <DemoBadge className="ml-2" />}
        </p>
        <h1 className="font-display-wonk mt-4 text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92]">{game.title}</h1>
        {game.intro && <p className="mt-4 max-w-2xl text-lg text-ink-soft">{game.intro}</p>}
      </header>
      <div className="mt-10">
        {game.kind === "crossword" ? <Crossword id={game.id} data={game.data} /> : <div className="max-w-3xl"><Quiz data={game.data} /></div>}
      </div>
      <div className="mt-20">
        <NextCourse current="caffe" />
      </div>
    </div>
  );
}
