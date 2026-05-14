"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/actions/auth";

const accountLinks = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/payment-methods", label: "Banks & cards" },
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
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-teal-800">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-zinc-900">{displayName}</p>
          <p className="truncate text-xs text-zinc-500">{email}</p>
          <Link
            href="/account/profile"
            className="mt-1 inline-block text-xs font-medium text-teal-800 hover:underline"
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
                        ? "block border-l-2 border-teal-700 py-2 pl-3 font-medium text-teal-900 -ml-px"
                        : "block py-2 pl-3 text-zinc-700 hover:text-teal-900"
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
                    ? "block border-l-2 border-teal-700 py-2 pl-3 font-medium text-teal-900 -ml-px"
                    : "block py-2 pl-3 text-zinc-700 hover:text-teal-900"
                }
              >
                My purchases
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Session</p>
          <button
            type="button"
            onClick={() => setConfirmLogoutOpen(true)}
            className="block w-full rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-left text-sm font-medium text-rose-800 transition hover:bg-rose-100"
          >
            Log out
          </button>
        </div>
      </nav>
      {mounted && confirmLogoutOpen
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-200/70 bg-white/95 p-5 shadow-2xl ring-1 ring-black/5">
                <h3 className="text-base font-semibold text-zinc-900">Log out?</h3>
                <p className="mt-2 text-sm text-zinc-600">
                  Are you sure you want to log out of your account?
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmLogoutOpen(false)}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-full bg-filler-rose-800 px-4 py-2 text-sm font-medium text-white hover:bg-filler-rose-700"
                    >
                      Yes, log out
                    </button>
                  </form>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </aside>
  );
}
