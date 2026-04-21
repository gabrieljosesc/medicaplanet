"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";

export function UserMenu({
  email,
  displayName,
  avatarUrl,
}: {
  email: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[200px] items-center gap-2 rounded-md px-1 py-1 text-left text-sm text-emerald-900 hover:bg-emerald-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="36px"
              unoptimized={avatarUrl.includes("%")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-800">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        <span className="hidden min-w-0 truncate font-medium sm:inline">{displayName}</span>
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-1 w-52 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <p className="truncate px-3 py-2 text-xs text-zinc-500" title={email}>
            {email}
          </p>
          <Link
            href="/account/profile"
            className="block px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My account
          </Link>
          <Link
            href="/account/purchases"
            className="block px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My purchases
          </Link>
          <div className="border-t border-zinc-100 pt-1">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmLogoutOpen(true);
              }}
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
      {confirmLogoutOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl">
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
                  className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900"
                >
                  Yes, log out
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
