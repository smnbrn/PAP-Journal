import { Suspense } from "react";
import { GameEditor } from "@/components/admin/GameEditor";
import { PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Nuovo gioco" };
export const instant = false;

export default function NewGamePage(props: PageProps<"/redazione/giochi/nuovo">) {
  return (
    <>
      <PageHeader title="Nuovo gioco" back={{ href: "/redazione/giochi", label: "Giochi" }} />
      <Suspense fallback={<PanelLoading />}>
        <NewGame searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function NewGame({ searchParams }: { searchParams: PageProps<"/redazione/giochi/nuovo">["searchParams"] }) {
  const { store } = await requireStaff();
  const sp = await searchParams;
  return <GameEditor game={{ kind: sp.tipo === "quiz" ? "quiz" : "crossword" }} issues={await store.listIssues()} />;
}
