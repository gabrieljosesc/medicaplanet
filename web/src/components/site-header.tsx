import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { CategoryMegaNav } from "@/components/category-mega-nav";
import { HeaderSearch } from "@/components/header-search";
import { LogoMark } from "@/components/logo-mark";
import { getCategoryNavData } from "@/lib/shop-nav-data";
import { getSiteUserContext } from "@/lib/site-user-context";
import { UserMenu } from "@/components/user-menu";

export async function SiteHeader() {
  const { user, profile, isAdmin } = await getSiteUserContext();
  const { categories, productSamples } = await getCategoryNavData();

  return (
    <header className="sticky top-0 z-50 border-b border-filler-peach-300/50 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 sm:gap-4">
          <Link
            href="/"
            className="group flex min-w-0 max-w-full flex-1 items-center gap-2.5 sm:flex-none"
          >
            <LogoMark />
            <div className="min-w-0">
              <span className="block text-lg font-bold leading-tight tracking-tight text-filler-ink">
                MedicaPlanet
              </span>
              <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-filler-ink/50 sm:block">
                Professional supply
              </span>
            </div>
          </Link>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2 sm:flex-initial">
            {user ? null : (
              <Link
                href="/auth/register"
                className="order-first rounded-full bg-filler-peach-300 px-3.5 py-1.5 text-sm font-semibold text-filler-ink shadow-sm transition hover:bg-filler-peach-200 sm:order-none"
              >
                Register
              </Link>
            )}
            {user ? null : (
              <Link
                href="/auth/login"
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-filler-ink/90 transition hover:bg-filler-peach-200/70"
              >
                Log in
              </Link>
            )}
            {user ? (
              <UserMenu
                email={profile?.email ?? user.email ?? ""}
                displayName={
                  (profile?.full_name && profile.full_name.trim()) ||
                  user.email?.split("@")[0] ||
                  "Account"
                }
                avatarUrl={profile?.avatar_url ?? null}
              />
            ) : null}
            <div className="ml-0.5 flex items-center">
              <HeaderSearch />
            </div>
            <CartBadge />
            {isAdmin ? (
              <Link
                href="/admin"
                className="hidden rounded-full px-2.5 py-1.5 text-sm font-medium text-filler-rose-800 sm:inline transition hover:bg-filler-peach-200/80"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border-t border-filler-peach-200/90 py-2.5">
          <div className="-mx-1 overflow-x-auto overflow-y-visible pb-1 [scrollbar-width:thin]">
            <div className="min-w-0 sm:px-0">
              <CategoryMegaNav categories={categories} productSamples={productSamples} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
