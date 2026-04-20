import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartBadge } from "@/components/cart-badge";
import { HeaderSearch } from "@/components/header-search";
import { IconUserCircle } from "@/components/nav-icons";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/peptides", label: "Peptides" },
  { href: "/blog", label: "Blog" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="relative flex h-11 w-[11.5rem] shrink-0 items-center sm:h-12 sm:w-[12.5rem]"
          aria-label="MedicaPlanet home"
        >
          {/* Logo SVG had a huge empty canvas (612×408); file viewBox is cropped to the ink so object-contain fills this slot. */}
          <img
            src="/medicaplanet_logo.svg"
            alt=""
            width={512}
            height={132}
            decoding="async"
            fetchPriority="high"
            className="max-h-full w-full object-contain object-left"
          />
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-700">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-emerald-800">
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className="text-emerald-700 hover:underline">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <a
            href="https://api.whatsapp.com/send?phone=18005551234"
            className="hidden text-emerald-800 hover:underline sm:inline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          <a href="tel:+18005551234" className="text-zinc-600 hover:text-emerald-800">
            (800) 555-1234
          </a>
          <HeaderSearch />
          <CartBadge />
          {user ? (
            <Link
              href="/account"
              title="View profile"
              aria-label="View profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
            >
              <IconUserCircle className="h-[22px] w-[22px] shrink-0" />
            </Link>
          ) : (
            <Link href="/auth/login" className="font-medium text-emerald-800 hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
