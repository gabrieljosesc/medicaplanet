import Link from "next/link";
import { SiteTopBarClient } from "@/components/site-top-bar-client";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { getSiteUserContext } from "@/lib/site-user-context";

/**
 * Secondary nav + account/search/cart. Hidden below `md` (same links live in the mobile menu).
 */
export async function SiteTopBar() {
  const { user, profile, isAdmin } = await getSiteUserContext();
  return (
    <div className="hidden border-b border-filler-peach-400/30 bg-filler-cream/90 text-[13px] text-filler-ink/85 md:block">
      <div className="mx-auto flex min-h-[2.75rem] max-w-6xl min-w-0 flex-nowrap items-center justify-between gap-2 px-4 py-1.5">
        <nav className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5" aria-label="Site">
          {TOP_BAR_NAV.map((n, i) => (
            <span key={n.href} className="inline-flex items-center gap-1.5 text-filler-ink/70">
              {i > 0 ? (
                <span className="text-filler-ink/25" aria-hidden>
                  ·
                </span>
              ) : null}
              <Link
                href={n.href}
                className="rounded-sm px-0.5 font-medium text-filler-ink/80 transition hover:text-filler-rose-700"
              >
                {n.label}
              </Link>
            </span>
          ))}
        </nav>
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
