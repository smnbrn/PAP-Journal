import { NotFoundContent } from "@/components/site/NotFoundContent";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function GlobalNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenuto">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
