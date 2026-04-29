import Link from "next/link";
import { LogoMark } from "@/components/logo-mark";
import { ProductsMegaDropdown } from "@/components/products-mega-dropdown";
import { SiteTopBarClient } from "@/components/site-top-bar-client";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { getCategoryNavData } from "@/lib/shop-nav-data";
import { getSiteUserContext } from "@/lib/site-user-context";

/**
 * Desktop-only header: logo, primary nav (with Products mega dropdown), account/search/cart.
 * Mobile uses `SiteHeader` for logo + search + cart + drawer trigger.
 */
export async function SiteTopBar() {
  const { user, profile, isAdmin } = await getSiteUserContext();
  const { categories, othersDropdownCategories, productSamples } = await getCategoryNavData();
  return (
    <div className="hidden border-b border-filler-peach-300/50 bg-white/95 text-[13px] text-filler-ink/85 shadow-sm backdrop-blur-md md:sticky md:top-0 md:z-50 md:block">
      <div className="mx-auto flex min-h-[3.25rem] max-w-screen-2xl min-w-0 flex-nowrap items-center justify-between gap-4 px-6 py-2 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-filler-rose-600/60"
          >
            <LogoMark />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-filler-ink">
                MedicaPlanet
              </span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-filler-ink/50">
                Trusted Supplier
              </span>
            </span>
          </Link>
          <nav className="flex min-w-0 items-center gap-x-2.5 gap-y-0.5 text-[14px]" aria-label="Site">
            {TOP_BAR_NAV.map((n, i) => {
              const item =
                n.href === "/shop" ? (
                  <ProductsMegaDropdown
                    href={n.href}
                    label={n.label}
                    categories={categories}
                    othersDropdownCategories={othersDropdownCategories}
                    productSamples={productSamples}
                  />
                ) : (
                  <Link
                    href={n.href}
                    className="rounded-sm px-0.5 font-medium text-filler-ink/80 transition hover:text-filler-rose-700"
                  >
                    {n.label}
                  </Link>
                );
              return (
                <span key={n.href} className="inline-flex items-center gap-2 text-filler-ink/70">
                  {i > 0 ? (
                    <span className="text-filler-ink/25" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {item}
                </span>
              );
            })}
          </nav>
        </div>
        <SiteTopBarClient
          isAdmin={isAdmin}
          userPresent={Boolean(user)}
          userEmail={profile?.email ?? user?.email ?? null}
          displayName={
            (profile?.full_name && profile.full_name.trim()) ||
            user?.email?.split("@")[0] ||
            "Account"
          }
          avatarUrl={profile?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
