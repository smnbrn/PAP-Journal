import { Suspense } from "react";
import { IssueEditor } from "@/components/admin/IssueEditor";
import { PageHeader, PanelLoading } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Nuovo numero" };
export const instant = false;

export default function NewIssuePage(props: PageProps<"/redazione/numeri/nuovo">) {
  return (
    <>
      <PageHeader title="Nuovo numero" back={{ href: "/redazione/numeri", label: "Numeri" }} />
      <Suspense fallback={<PanelLoading />}>
        <NewIssue searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function NewIssue({ searchParams }: { searchParams: PageProps<"/redazione/numeri/nuovo">["searchParams"] }) {
  await requireStaff();
  const sp = await searchParams;
  const number = typeof sp.numero === "string" && /^\d{1,2}$/.test(sp.numero) ? Number(sp.numero) : undefined;
  const month = typeof sp.mese === "string" && /^\d{4}-\d{2}$/.test(sp.mese) ? `${sp.mese}-01` : undefined;
  return <IssueEditor issue={{ number, month, status: "draft" }} />;
}
