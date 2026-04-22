"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { CartBadge } from "@/components/cart-badge";
import { HeaderSearch } from "@/components/header-search";
import { SITE_NAV } from "@/lib/nav-config";
import type { SiteProfile } from "@/lib/site-user-context";
import { UserMenu } from "@/components/user-menu";

/** After this scroll offset, switch pills to dark-on-light so they stay visible over white sections. */
const SCROLL_SOLID_PX = 80;

export function HomeHeroChrome({
  user,
  profile,
  isAdmin,
}: {
  user: User | null;
  profile: SiteProfile | null;
  isAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solidNav, setSolidNav] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setSolidNav(window.scrollY > SCROLL_SOLID_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const pillLight =
    "rounded-full border border-zinc-200/90 bg-white/90 py-1.5 shadow-md backdrop-blur-xl ring-1 ring-black/5 sm:shadow-lg md:py-2";
  const pillDark =
    "rounded-full border border-white/25 bg-white/15 py-1.5 shadow-lg backdrop-blur-md md:py-2";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto mx-auto flex max-w-6xl items-start justify-between gap-4">
        <div
          className={`flex max-w-[min(100%,42rem)] items-center gap-1 pl-4 pr-1.5 md:gap-2 md:pl-5 ${solidNav ? pillLight : pillDark}`}
        >
          <Link
            href="/"
            className={`shrink-0 text-sm font-semibold tracking-tight md:text-base ${solidNav ? "text-emerald-900" : "text-white"}`}
          >
            MedicaPlanet
          </Link>
          <nav
            className={`hidden items-center gap-1 pl-3 md:flex md:gap-3 md:pl-4 ${solidNav ? "border-l border-zinc-200/80" : "border-l border-white/25"}`}
          >
            {SITE_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={
                  solidNav
                    ? "text-sm font-medium text-zinc-700 transition hover:text-emerald-900"
                    : "text-sm font-medium text-white/90 transition hover:text-white"
                }
              >
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin"
                className={
                  solidNav
                    ? "text-sm font-medium text-emerald-800 transition hover:text-emerald-950"
                    : "text-sm font-medium text-emerald-200 transition hover:text-white"
                }
              >
                Admin
              </Link>
            ) : null}
          </nav>
          <button
            type="button"
            className="ml-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm md:hidden"
            aria-expanded={menuOpen}
            aria-controls="home-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menu
          </button>
        </div>

        <div
          className={`flex items-center gap-1 pl-2 pr-2 sm:gap-2 sm:pl-3 sm:pr-3 ${solidNav ? pillLight : pillDark}`}
        >
          <HeaderSearch variant={solidNav ? "default" : "hero"} />
          <CartBadge tone={solidNav ? "default" : "light"} showLabel />
          {user ? (
            <UserMenu
              email={profile?.email ?? user.email ?? ""}
              displayName={
                (profile?.full_name && profile.full_name.trim()) ||
                user.email?.split("@")[0] ||
                "Account"
              }
              avatarUrl={profile?.avatar_url ?? null}
              variant={solidNav ? "default" : "light"}
            />
          ) : (
            <Link
              href="/auth/login"
              className={
                solidNav
                  ? "rounded-full px-3 py-1.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
                  : "rounded-full px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
              }
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="pointer-events-auto fixed inset-0 z-[110] md:hidden" id="home-mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col gap-1 border-l border-zinc-200 bg-white p-6 pt-20 shadow-xl">
            {SITE_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
                onClick={() => setMenuOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
