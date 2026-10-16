import { Suspense } from "react";
import { PollEditor } from "@/components/admin/PollEditor";
import { PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Nuovo sondaggio" };

export default function NewPollPage() {
  return (
    <>
      <PageHeader title="Nuovo sondaggio" back={{ href: "/redazione/sondaggi", label: "Sondaggi" }} />
      <Suspense fallback={<PanelLoading />}>
        <NewPoll />
      </Suspense>
    </>
  );
}

async function NewPoll() {
  const { store } = await requireStaff();
  return <PollEditor poll={{}} issues={await store.listIssues()} hasVotes={false} />;
}
