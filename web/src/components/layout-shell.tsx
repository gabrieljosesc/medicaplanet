import { PromoBanner } from "@/components/promo-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBanner />
      <SiteHeader />
      <div className="mx-auto min-h-[55vh] w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
      <SiteFooter />
    </>
  );
}
