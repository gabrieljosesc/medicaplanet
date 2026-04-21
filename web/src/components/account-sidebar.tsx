"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const accountLinks = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/payment-methods", label: "Payment methods" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/password", label: "Change password" },
  { href: "/account/privacy", label: "Privacy" },
  { href: "/account/notifications", label: "Notifications" },
] as const;

export function AccountSidebar({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string;
  email: string;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const purchasesActive =
    pathname === "/account/purchases" || pathname?.startsWith("/account/orders");

  return (
    <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
              unoptimized={avatarUrl.includes("%")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-emerald-800">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900">{displayName}</p>
          <p className="truncate text-xs text-zinc-500">{email}</p>
          <Link
            href="/account/profile"
            className="mt-1 inline-block text-xs font-medium text-emerald-800 hover:underline"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <nav className="space-y-6 text-sm">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            My account
          </p>
          <ul className="space-y-0.5 border-l border-zinc-200">
            {accountLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      active
                        ? "block border-l-2 border-emerald-700 py-2 pl-3 font-medium text-emerald-900 -ml-px"
                        : "block py-2 pl-3 text-zinc-700 hover:text-emerald-900"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Orders</p>
          <ul className="space-y-0.5 border-l border-zinc-200">
            <li>
              <Link
                href="/account/purchases"
                className={
                  purchasesActive
                    ? "block border-l-2 border-emerald-700 py-2 pl-3 font-medium text-emerald-900 -ml-px"
                    : "block py-2 pl-3 text-zinc-700 hover:text-emerald-900"
                }
              >
                My purchases
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
