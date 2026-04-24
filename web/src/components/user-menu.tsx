"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/actions/auth";

export function UserMenu({
  email,
  displayName,
  avatarUrl,
  variant = "default",
}: {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  variant?: "default" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "light"
            ? "flex max-w-[200px] items-center gap-2 rounded-full px-1 py-1 text-left text-sm text-white hover:bg-white/10"
            : "flex max-w-[200px] items-center gap-2 rounded-md px-1 py-1 text-left text-sm text-filler-ink hover:bg-filler-peach-200/90"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className={
            variant === "light"
              ? "relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/40"
              : "relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200"
          }
        >
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
            <span
              className={
                variant === "light"
                  ? "flex h-full w-full items-center justify-center text-xs font-semibold text-white"
                  : "flex h-full w-full items-center justify-center text-xs font-semibold text-filler-rose-800"
              }
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        <span
          className={`hidden min-w-0 truncate font-medium sm:inline ${variant === "light" ? "text-white" : ""}`}
        >
          {displayName}
        </span>
      </button>
      {open ? (
        <div
          className={`absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200/60 bg-white/85 py-1.5 text-zinc-900 shadow-xl backdrop-blur-xl backdrop-saturate-150 ring-1 ring-black/5 ${variant === "light" ? "z-[115]" : "z-[60]"}`}
          role="menu"
        >
          <p className="truncate px-3 py-2 text-xs text-zinc-500" title={email}>
            {email}
          </p>
          <Link
            href="/account/profile"
            className="block px-3 py-2 text-sm text-zinc-800 transition hover:bg-white/60"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My account
          </Link>
          <Link
            href="/account/purchases"
            className="block px-3 py-2 text-sm text-zinc-800 transition hover:bg-white/60"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My purchases
          </Link>
          <div className="mt-0.5 border-t border-zinc-200/50 pt-1">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-white/60"
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
      {mounted && confirmLogoutOpen
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-200/70 bg-white/90 p-5 shadow-2xl backdrop-blur-xl backdrop-saturate-150 ring-1 ring-black/5">
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
    </div>
  );
}
