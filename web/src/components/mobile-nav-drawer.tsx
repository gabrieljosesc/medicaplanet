"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categoryHref } from "@/lib/category-href";
import { TOP_BAR_NAV } from "@/lib/nav-config";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";
import type { NavCategory } from "@/lib/shop-nav-data";

type Sample = { slug: string; title: string };

type PopoverGeom = {
  top: number;
  right: number;
  width: number;
  maxHeight: number;
  arrowLeft: number;
};

function HamburgerIcon() {
  return (
    <span className="flex h-3 w-4 flex-col justify-between" aria-hidden>
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
      <span className="h-0.5 w-full rounded-full bg-filler-ink" />
    </span>
  );
}

function measurePopover(trigger: HTMLElement): PopoverGeom {
  const rect = trigger.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 10;
  const width = Math.max(
    240,
    Math.min(380, vw * 0.92, vw - 2 * margin, rect.right - margin)
  );
  const right = vw - rect.right;
  const top = rect.bottom + 6;
  const maxHeight = Math.max(220, vh - top - margin);
  const panelLeft = vw - right - width;
  const triggerCenter = rect.left + rect.width / 2;
  const arrowCenter = triggerCenter - panelLeft;
  const arrowLeft = Math.min(width - 18, Math.max(10, arrowCenter - 7));
  return { top, right, width, maxHeight, arrowLeft };
}

/**
 * Mobile menu as a **popover under the Menu trigger** (FillerSupplies-style), not a full-screen sheet.
 * Portals with `position: fixed` + measured geometry so it clears sticky header / blur contexts.
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
  const [geom, setGeom] = useState<PopoverGeom | null>(null);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const syncPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setGeom(measurePopover(el));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setGeom(null);
      return;
    }
    syncPosition();
  }, [open, syncPosition]);

  useEffect(() => {
    if (!open) return;
    const on = () => syncPosition();
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [open, syncPosition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  const portal =
    open && mounted && geom ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[190] bg-filler-ink/25 md:hidden"
          aria-hidden
          tabIndex={-1}
          onClick={close}
        />
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed z-[200] flex flex-col overflow-hidden rounded-2xl border border-filler-peach-200/90 bg-white shadow-2xl md:hidden"
          style={{
            top: geom.top,
            right: geom.right,
            width: geom.width,
            maxHeight: geom.maxHeight,
          }}
        >
          <div
            className="pointer-events-none absolute h-0 w-0 -translate-y-full border-x-[7px] border-b-[8px] border-x-transparent border-b-white drop-shadow-sm"
            style={{ left: geom.arrowLeft, top: 0 }}
            aria-hidden
          />
          <div className="flex shrink-0 items-center justify-end border-b border-filler-peach-200/80 px-3 py-2">
            <button
              type="button"
              className="rounded-full px-2 py-1 text-sm font-semibold text-filler-rose-800 transition hover:bg-filler-peach-200/70"
              onClick={close}
            >
              Close
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-row divide-x divide-filler-peach-200/80">
            <nav
              className="min-h-0 w-1/2 min-w-0 overflow-y-auto overscroll-y-contain px-2.5 py-3 text-[13px]"
              aria-label="Site pages"
            >
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-filler-ink/45">Site</p>
              <ul className="space-y-0.5">
                {!userPresent ? (
                  <>
                    <li>
                      <Link
                        href="/auth/register"
                        className="block rounded-lg px-1.5 py-1.5 font-semibold text-filler-ink hover:bg-filler-peach-200/50"
                        onClick={close}
                      >
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/auth/login"
                        className="block rounded-lg px-1.5 py-1.5 font-medium text-filler-ink hover:bg-filler-peach-200/50"
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
                      className="block rounded-lg px-1.5 py-1.5 font-semibold text-filler-ink hover:bg-filler-peach-200/50"
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
                      className="block rounded-lg px-1.5 py-1.5 font-medium text-filler-ink hover:bg-filler-peach-200/50"
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
                      className="block rounded-lg px-1.5 py-1.5 font-medium text-filler-rose-800 hover:bg-filler-peach-200/50"
                      onClick={close}
                    >
                      Admin
                    </Link>
                  </li>
                ) : null}
              </ul>
            </nav>

            <nav
              className="min-h-0 w-1/2 min-w-0 overflow-y-auto overscroll-y-contain px-2.5 py-3 text-[13px]"
              aria-label="Product categories"
            >
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-filler-ink/45">
                Categories
              </p>
              <ul className="space-y-0.5">
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
                          className="flex w-full items-center justify-between gap-1 px-1.5 py-1.5 text-left font-semibold text-filler-ink"
                          onClick={() => toggle(k)}
                          aria-expanded={isOpen}
                        >
                          <span className="min-w-0 truncate">{c.name}</span>
                          <span className="shrink-0 text-filler-ink/50" aria-hidden>
                            {isOpen ? "▾" : "▸"}
                          </span>
                        </button>
                        {isOpen ? (
                          <ul className="border-t border-filler-peach-200/60 px-1.5 pb-1.5 pt-1">
                            {othersDropdownCategories.map((x) => (
                              <li key={x.id}>
                                <Link
                                  href={categoryHref(x.slug)}
                                  className="block rounded-md py-1 pl-1 text-[12px] font-medium text-filler-ink/90 hover:bg-white/80"
                                  onClick={close}
                                >
                                  {x.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                href={categoryHref("other")}
                                className="block rounded-md py-1 pl-1 text-[12px] font-medium text-filler-rose-800 hover:underline"
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
                          className="min-w-0 flex-1 truncate px-1.5 py-1.5 font-semibold text-filler-ink hover:bg-filler-peach-200/40"
                          onClick={close}
                        >
                          {c.name}
                        </Link>
                        {samples.length > 0 ? (
                          <button
                            type="button"
                            className="shrink-0 border-l border-filler-peach-200/60 px-1.5 text-filler-ink/50"
                            aria-expanded={subOpen}
                            aria-label={`Products in ${c.name}`}
                            onClick={() => toggle(subKey)}
                          >
                            {subOpen ? "▾" : "▸"}
                          </button>
                        ) : null}
                      </div>
                      {samples.length > 0 && subOpen ? (
                        <ul className="border-t border-filler-peach-200/60 px-1.5 pb-1.5 pt-1">
                          {samples.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={`/product/${p.slug}`}
                                className="block rounded-md py-1 pl-1 text-[12px] font-medium text-filler-ink/85 hover:bg-filler-peach-200/40"
                                onClick={close}
                              >
                                {p.title}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={href}
                              className="block py-1 pl-1 text-[12px] font-semibold text-filler-rose-800 hover:underline"
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

          <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-filler-peach-200/80 bg-filler-cream/50 px-2.5 py-2">
            <a
              href={SITE_PHONE_TEL}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-filler-peach-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-filler-ink shadow-sm"
            >
              <span aria-hidden>📞</span>
              <span className="truncate">{SITE_PHONE_DISPLAY}</span>
            </a>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-filler-peach-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-filler-ink shadow-sm"
            >
              <span aria-hidden>✉️</span>
              <span className="truncate">{SITE_EMAIL}</span>
            </a>
          </div>
        </div>
      </>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-filler-peach-300/90 bg-white px-3 py-1.5 text-sm font-semibold text-filler-ink shadow-sm transition hover:bg-filler-peach-200/60"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Menu</span>
        <HamburgerIcon />
      </button>
      {mounted && portal ? createPortal(portal, document.body) : null}
    </>
  );
}
