import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { HeaderSearch } from "@/components/header-search";
import { LogoMark } from "@/components/logo-mark";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { getCategoryNavData } from "@/lib/shop-nav-data";
import { getSiteUserContext } from "@/lib/site-user-context";

/**
 * Mobile-only chrome: logo + search + cart + full menu drawer.
 * Desktop chrome lives in `SiteTopBar`.
 */
export async function SiteHeader() {
  const { user, isAdmin } = await getSiteUserContext();
  const { categories, othersDropdownCategories, productSamples } = await getCategoryNavData();

  return (
    <header className="sticky top-0 z-50 max-w-full overflow-visible border-b border-filler-peach-300/50 bg-white/95 shadow-sm backdrop-blur-md md:hidden">
      <div className="mx-auto max-w-6xl min-w-0 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <Link
            href="/"
            className="group flex min-w-0 max-w-[55%] flex-1 items-center gap-2"
          >
            <LogoMark sizeClassName="h-7 w-7" />
            <div className="min-w-0">
              <span className="block text-base font-bold leading-tight tracking-tight text-filler-ink">
                MedicaPlanet
              </span>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex items-center">
              <HeaderSearch />
            </div>
            <CartBadge />
            <MobileNavDrawer
              userPresent={Boolean(user)}
              isAdmin={isAdmin}
              categories={categories}
              othersDropdownCategories={othersDropdownCategories}
              productSamples={productSamples}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
