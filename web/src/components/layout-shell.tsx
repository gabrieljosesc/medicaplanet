import { PromoBanner } from "@/components/promo-banner";
import { RouteLayoutWrapper } from "@/components/route-layout-wrapper";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteTopBar } from "@/components/site-top-bar";

export async function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteLayoutWrapper
        defaultChrome={
          <>
            <PromoBanner />
            <SiteTopBar />
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
