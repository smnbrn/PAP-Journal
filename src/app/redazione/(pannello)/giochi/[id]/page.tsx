import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConfirmForm } from "@/components/admin/controls";
import { GameEditor } from "@/components/admin/GameEditor";
import { Notice, PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";
import { deleteGame } from "../../../actions";

export const metadata = { title: "Modifica gioco" };
export const instant = false;

export default function EditGamePage(props: PageProps<"/redazione/giochi/[id]">) {
  return (
    <Suspense fallback={<PanelLoading />}>
      <EditGame {...props} />
    </Suspense>
  );
}

async function EditGame({ params, searchParams }: PageProps<"/redazione/giochi/[id]">) {
  const { store } = await requireStaff();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const game = await store.getGame(id).catch(() => null);
  if (!game) notFound();
  const issues = await store.listIssues();
  const skipped = typeof sp.escluse === "string" ? sp.escluse.split(",").filter(Boolean) : [];

  return (
    <>
      <PageHeader title={game.title} back={{ href: "/redazione/giochi", label: "Giochi" }}>
        {game.status === "published" && (
          <Link href={`/giochi/${game.id}`} target="_blank" className="btn btn-outline">
            Vedi sul sito ↗
          </Link>
        )}
      </PageHeader>
      {sp.salvato && <Notice>Gioco salvato.</Notice>}
      {skipped.length > 0 && (
        <Notice tone="error">Queste parole non si incrociavano con le altre e sono state lasciate fuori: {skipped.join(", ")}.</Notice>
      )}
      <GameEditor key={JSON.stringify(game.data).length + game.title} game={game} issues={issues} />
      <div className="mt-12 flex justify-end border-t border-rule pt-6">
        <ConfirmForm action={deleteGame} id={game.id} message={`Eliminare «${game.title}»?`}>
          Elimina gioco
        </ConfirmForm>
      </div>
    </>
  );
}
