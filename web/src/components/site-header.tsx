import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { HeaderSearch } from "@/components/header-search";
import { UserMenu } from "@/components/user-menu";
import { SITE_NAV } from "@/lib/nav-config";
import { getSiteUserContext } from "@/lib/site-user-context";

export async function SiteHeader() {
  const { user, profile, isAdmin } = await getSiteUserContext();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 max-w-full flex-[1_1_16rem] flex-wrap items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-2 shadow-sm backdrop-blur-xl sm:flex-1 sm:gap-0 sm:px-4">
          <Link
            href="/"
            className="shrink-0 pr-2 font-serif text-base font-semibold tracking-tight text-slate-900 sm:pr-3"
          >
            MedicaPlanet
          </Link>
          <span className="hidden h-5 w-px shrink-0 bg-slate-200/90 sm:mx-1 sm:block" aria-hidden />
          <nav className="flex flex-wrap items-center gap-0.5 text-sm font-medium sm:gap-1">
            {SITE_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full px-2.5 py-1.5 text-slate-600 transition hover:bg-white hover:text-teal-900 sm:px-3"
              >
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-full px-2.5 py-1.5 text-teal-800 transition hover:bg-teal-50/90 sm:px-3"
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 px-2 py-1.5 shadow-sm backdrop-blur-xl sm:gap-1.5 sm:px-3">
          <HeaderSearch />
          <CartBadge />
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
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-50/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
