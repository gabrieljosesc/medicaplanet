"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { categoryHref } from "@/lib/category-href";
import type { NavCategory } from "@/lib/shop-nav-data";

type Sample = { slug: string; title: string };

function isDesktop() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

/**
 * Desktop "Products" dropdown — single-column accordion mirroring the mobile drawer:
 *  - "All Products" shortcut at the top
 *  - One row per category (clickable name + expand arrow)
 *  - Click the arrow to expand inline products / sub-categories
 */
export function ProductsMegaDropdown({
  href,
  label,
  categories,
  othersDropdownCategories,
  productSamples,
}: {
  href: string;
  label: string;
  categories: NavCategory[];
  othersDropdownCategories: NavCategory[];
  productSamples: Record<string, Sample[]>;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelClose();
    setOpen(false);
    setExpanded({});
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setExpanded({});
    }, 160);
  }, [cancelClose]);

  const toggle = useCallback((key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      className="relative inline-block"
      onMouseEnter={() => {
        if (isDesktop()) {
          cancelClose();
          setOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (isDesktop()) scheduleClose();
      }}
    >
      <Link
        href={href}
        className={
          "inline-flex items-center gap-1 rounded-sm px-0.5 font-medium text-filler-ink/80 transition hover:text-filler-rose-700 " +
          (open ? "text-filler-rose-700" : "")
        }
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
      >
        <span>{label}</span>
        <svg
          viewBox="0 0 12 12"
          className={"h-2.5 w-2.5 transition-transform " + (open ? "rotate-180" : "")}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </Link>

      {open ? (
        <>
          <div className="absolute left-0 top-full z-[58] h-2 w-full" aria-hidden />
          <div
            id={menuId}
            role="menu"
            className="absolute left-0 top-full z-[200] pt-2"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="w-72 max-h-[min(70vh,32rem)] overflow-y-auto overscroll-contain rounded-2xl border border-filler-peach-200/90 bg-white p-2 shadow-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-filler-ink/45">
                Categories
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/shop"
                    className="block rounded-lg bg-filler-peach-200/40 px-2 py-1.5 text-sm font-semibold text-filler-rose-800 hover:bg-filler-peach-200/70"
                    onClick={close}
                  >
                    All Products →
                  </Link>
                </li>

                {categories.map((c) => {
                  const href = categoryHref(c.slug);

                  if (c.slug === "other") {
                    const k = "other-hub";
                    const isOpen = expanded[k] ?? false;
                    return (
                      <li
                        key={c.id}
                        className="rounded-lg border border-filler-peach-200/60 bg-filler-cream/40"
                      >
                        <div className="flex items-stretch">
                          <Link
                            href={href}
                            className="min-w-0 flex-1 truncate rounded-l-lg px-2 py-1.5 text-sm font-semibold text-filler-ink hover:bg-filler-peach-200/40"
                            onClick={close}
                          >
                            {c.name}
                          </Link>
                          <button
                            type="button"
                            className="shrink-0 border-l border-filler-peach-200/60 px-2 text-filler-ink/50 hover:text-filler-ink"
                            aria-expanded={isOpen}
                            aria-label={`Sub-categories in ${c.name}`}
                            onClick={() => toggle(k)}
                          >
                            {isOpen ? "▾" : "▸"}
                          </button>
                        </div>
                        {isOpen ? (
                          <ul className="border-t border-filler-peach-200/60 px-2 pb-1.5 pt-1">
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
                  }

                  const samples = productSamples[c.slug] ?? [];
                  const subKey = `cat-${c.slug}`;
                  const subOpen = expanded[subKey] ?? false;
                  return (
                    <li
                      key={c.id}
                      className="rounded-lg border border-filler-peach-200/60 bg-white/80"
                    >
                      <div className="flex items-stretch">
                        <Link
                          href={href}
                          className="min-w-0 flex-1 truncate rounded-l-lg px-2 py-1.5 text-sm font-semibold text-filler-ink hover:bg-filler-peach-200/40"
                          onClick={close}
                        >
                          {c.name}
                        </Link>
                        {samples.length > 0 ? (
                          <button
                            type="button"
                            className="shrink-0 border-l border-filler-peach-200/60 px-2 text-filler-ink/50 hover:text-filler-ink"
                            aria-expanded={subOpen}
                            aria-label={`Products in ${c.name}`}
                            onClick={() => toggle(subKey)}
                          >
                            {subOpen ? "▾" : "▸"}
                          </button>
                        ) : null}
                      </div>
                      {samples.length > 0 && subOpen ? (
                        <ul className="border-t border-filler-peach-200/60 px-2 pb-1.5 pt-1">
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
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
