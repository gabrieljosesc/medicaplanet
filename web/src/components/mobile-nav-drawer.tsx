"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { categoryHref } from "@/lib/category-href";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";
import type { NavCategory } from "@/lib/shop-nav-data";

type Sample = { slug: string; title: string };

function HamburgerIcon() {
  return (
    <span className="flex h-3 w-4 flex-col justify-between" aria-hidden>
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
    </span>
  );
}

/**
 * Full-screen mobile menu (FillerSupplies-style): two columns, categories with optional product shortcuts.
 * Portals to `document.body` so `position: fixed` is not clipped by header `backdrop-blur` / stacking contexts.
 */
export function MobileNavDrawer({
  userPresent,
  isAdmin,
  categories,
  othersDropdownCategories,
  productSamples,
}: {
  userPresent: boolean;
  isAdmin: boolean;
  categories: NavCategory[];
  othersDropdownCategories: NavCategory[];
  productSamples: Record<string, Sample[]>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const close = useCallback(() => setOpen(false), []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const overlay =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain p-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        id={panelId}
      >
        <button
          type="button"
          className="absolute inset-0 z-0 bg-filler-ink/40 backdrop-blur-[2px]"
          aria-label="Close menu"
          onClick={close}
        />
        <div className="relative z-10 my-2 flex h-[min(92dvh,calc(100dvh-1rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-filler-peach-200/90 bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-filler-peach-200/80 px-4 py-3">
            <span className="text-base font-bold text-filler-ink">Menu</span>
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-filler-rose-800 transition hover:bg-filler-peach-200/70"
              onClick={close}
            >
              Close
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-row divide-x divide-filler-peach-200/80">
            <nav
              className="min-h-0 w-1/2 min-w-0 overflow-y-auto overscroll-y-contain px-3 py-4 text-sm"
              aria-label="Site pages"
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-filler-ink/45">Site</p>
              <ul className="space-y-1">
                {!userPresent ? (
                  <>
                    <li>
                      <Link
                        href="/auth/register"
                        className="block rounded-lg px-2 py-2 font-semibold text-filler-ink hover:bg-filler-peach-200/50"
                        onClick={close}
                      >
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/auth/login"
                        className="block rounded-lg px-2 py-2 font-medium text-filler-ink hover:bg-filler-peach-200/50"
                        onClick={close}
                      >
                        Log in
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link
                      href="/account/profile"
                      className="block rounded-lg px-2 py-2 font-semibold text-filler-ink hover:bg-filler-peach-200/50"
                      onClick={close}
                    >
                      Account
                    </Link>
                  </li>
                )}
                {TOP_BAR_NAV.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="block rounded-lg px-2 py-2 font-medium text-filler-ink hover:bg-filler-peach-200/50"
                      onClick={close}
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
                {isAdmin ? (
                  <li>
                    <Link
                      href="/admin"
                      className="block rounded-lg px-2 py-2 font-medium text-filler-rose-800 hover:bg-filler-peach-200/50"
                      onClick={close}
                    >
                      Admin
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>

            <nav
              className="min-h-0 w-1/2 min-w-0 overflow-y-auto overscroll-y-contain px-3 py-4 text-sm"
              aria-label="Product categories"
            >
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-filler-ink/45">
                Categories
              </p>
              <ul className="space-y-1">
                {categories.map((c) => {
                  const href = categoryHref(c.slug);
                  const samples = productSamples[c.slug] ?? [];
                  if (c.slug === "other") {
                    const k = "other-hub";
                    const isOpen = expanded[k] ?? false;
                    return (
                      <li key={c.id} className="rounded-lg border border-filler-peach-200/60 bg-filler-cream/40">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left font-semibold text-filler-ink"
                          onClick={() => toggle(k)}
                          aria-expanded={isOpen}
                        >
                          <span>{c.name}</span>
                          <span className="text-filler-ink/50" aria-hidden>
                            {isOpen ? "▾" : "▸"}
                          </span>
                        </button>
                        {isOpen ? (
                          <ul className="border-t border-filler-peach-200/60 px-2 pb-2 pt-1">
                            {othersDropdownCategories.map((x) => (
                              <li key={x.id}>
                                <Link
                                  href={categoryHref(x.slug)}
                                  className="block rounded-md py-1.5 pl-2 text-[13px] font-medium text-filler-ink/90 hover:bg-white/80"
                                  onClick={close}
                                >
                                  {x.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                href={categoryHref("other")}
                                className="block rounded-md py-1.5 pl-2 text-[13px] font-medium text-filler-rose-800 hover:underline"
                                onClick={close}
                              >
                                Others — all listings
                              </Link>
                            </li>
                          </ul>
                        ) : null}
                      </li>
                    );
                  }
                  const subKey = `cat-${c.slug}`;
                  const subOpen = expanded[subKey] ?? false;
                  return (
                    <li key={c.id} className="rounded-lg border border-filler-peach-200/60 bg-white/80">
                      <div className="flex items-stretch">
                        <Link
                          href={href}
                          className="min-w-0 flex-1 px-2 py-2 font-semibold text-filler-ink hover:bg-filler-peach-200/40"
                          onClick={close}
                        >
                          {c.name}
                        </Link>
                        {samples.length > 0 ? (
                          <button
                            type="button"
                            className="shrink-0 border-l border-filler-peach-200/60 px-2 text-filler-ink/50"
                            aria-expanded={subOpen}
                            aria-label={`Products in ${c.name}`}
                            onClick={() => toggle(subKey)}
                          >
                            {subOpen ? "▾" : "▸"}
                          </button>
                        ) : null}
                      </div>
                      {samples.length > 0 && subOpen ? (
                        <ul className="border-t border-filler-peach-200/60 px-2 pb-2 pt-1">
                          {samples.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/product/${p.slug}`}
                                className="block rounded-md py-1.5 pl-2 text-[13px] font-medium text-filler-ink/85 hover:bg-filler-peach-200/40"
                                onClick={close}
                              >
                                {p.title}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={href}
                              className="block py-1.5 pl-2 text-[13px] font-semibold text-filler-rose-800 hover:underline"
                              onClick={close}
                            >
                              View all in {c.name} →
                            </Link>
                          </li>
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-filler-peach-200/80 bg-filler-cream/50 px-4 py-3">
            <a
              href={SITE_PHONE_TEL}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-filler-peach-300 bg-white px-3 py-2 text-xs font-semibold text-filler-ink shadow-sm min-[380px]:flex-none"
            >
              <span aria-hidden>📞</span>
              <span className="truncate">{SITE_PHONE_DISPLAY}</span>
            </a>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-filler-peach-300 bg-white px-3 py-2 text-xs font-semibold text-filler-ink shadow-sm min-[380px]:flex-none"
            >
              <span aria-hidden>✉️</span>
              <span className="truncate">{SITE_EMAIL}</span>
            </a>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-filler-peach-300/90 bg-white px-3 py-1.5 text-sm font-semibold text-filler-ink shadow-sm transition hover:bg-filler-peach-200/60"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <span>Menu</span>
        <HamburgerIcon />
      </button>
      {mounted && open ? createPortal(overlay, document.body) : null}
    </>
  );
}
