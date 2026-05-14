"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const TABS: { href: string; label: string }[] = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/payment-methods", label: "Banks & cards" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/password", label: "Change password" },
  { href: "/account/privacy", label: "Privacy" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/purchases", label: "My purchases" },
];

/**
 * Mobile-only horizontal section switcher for the account area. Hidden on
 * `lg` and up, where the full vertical sidebar is shown beside the content
 * instead. The active section is highlighted and auto-scrolled into view
 * so users always know where they are.
 */
export function AccountMobileTabs() {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) =>
    pathname === href ||
    (href === "/account/purchases" && pathname.startsWith("/account/orders"));

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = containerRef.current?.querySelector<HTMLAnchorElement>("[data-active='true']");
    if (active) {
      active.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    }
  }, [pathname]);

  return (
    <nav
      aria-label="Account sections"
      className="-mx-4 mb-4 border-b border-zinc-200 bg-white/70 px-4 lg:hidden"
    >
      <div
        ref={containerRef}
        className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              data-active={active}
              className={
                "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition " +
                (active
                  ? "border-teal-700 text-teal-900"
                  : "border-transparent text-zinc-600 hover:text-zinc-900")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
