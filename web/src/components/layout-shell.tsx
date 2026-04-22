import { PromoBanner } from "@/components/promo-banner";
import { RouteLayoutWrapper } from "@/components/route-layout-wrapper";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteLayoutWrapper
        defaultChrome={
          <>
            <PromoBanner />
            <SiteHeader />
          </>
        }
      >
        {children}
      </RouteLayoutWrapper>
      <SiteFooter />
    </>
  );
}
