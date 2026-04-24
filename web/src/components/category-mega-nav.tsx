"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { categoryNavLabel } from "@/lib/catalog-constants";
import { categoryHref } from "@/lib/category-href";
import type { NavCategory } from "@/lib/shop-nav-data";

type Sample = { slug: string; title: string };

function isDesktop() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches;
}

function splitTwoColumns<T>(items: T[]): [T[], T[]] {
  if (items.length === 0) return [[], []];
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

/**
 * "Others" top-level item: two-column salmon panel (reference layout), hover on desktop + click on touch.
 */
function OthersNavDropdown({
  trigger,
  items,
}: {
  trigger: NavCategory;
  items: NavCategory[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

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

  const [leftCol, rightCol] = splitTwoColumns(items);

  const colLinks = (col: NavCategory[]) => (
    <ul className="space-y-1.5">
      {col.map((c) => (
        <li key={c.id}>
          <Link
            href={categoryHref(c.slug)}
            className="block rounded-md px-1 py-0.5 text-sm font-medium text-white/95 transition hover:bg-filler-rose-700/35 hover:underline"
            role="menuitem"
            onClick={close}
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={rootRef}
      className="group/others relative inline-block"
      onMouseEnter={() => {
        if (isDesktop()) setOpen(true);
      }}
      onMouseLeave={() => {
        if (isDesktop()) setOpen(false);
      }}
    >
      <button
        type="button"
        className={
          "inline-block whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium text-filler-ink/90 transition hover:bg-filler-peach-200/80 hover:text-filler-ink sm:px-2.5 sm:text-sm " +
          (open ? "bg-filler-peach-200/80 text-filler-ink" : "")
        }
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      >
        {categoryNavLabel(trigger.slug, trigger.name)}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-[70] min-w-[min(100vw-2rem,28rem)] max-w-[min(100vw-2rem,32rem)] pt-2"
        >
          <div className="relative rounded-2xl border border-filler-pink-500/30 bg-filler-pink-400/98 px-4 py-3 shadow-xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/75">More categories</p>
            {items.length === 0 ? (
              <p className="text-sm text-white/90">
                <Link href="/shop" className="font-semibold underline" onClick={close}>
                  Browse all products
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-left">
                <div>{colLinks(leftCol)}</div>
                <div>{colLinks(rightCol)}</div>
              </div>
            )}
            <div className="mt-3 border-t border-white/25 pt-2">
              <Link
                href={categoryHref("other")}
                className="text-xs font-semibold text-white/90 underline-offset-2 hover:underline"
                onClick={close}
              >
                {categoryNavLabel("other", "Other")} — all listings
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Horizontal categories (FillerSupplies-style). Each pill has a hover product panel except **Others**,
 * which opens a two-column mega menu of categories not shown on the main row.
 */
export function CategoryMegaNav({
  categories,
  othersDropdownCategories,
  productSamples,
}: {
  categories: NavCategory[];
  othersDropdownCategories: NavCategory[];
  productSamples: Record<string, Sample[]>;
}) {
  if (categories.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-filler-ink/60">
        <Link href="/shop" className="font-medium text-filler-rose-700 hover:underline">
          Browse all products
        </Link>
      </p>
    );
  }

  return (
    <nav
      className="flex w-full flex-wrap items-center justify-end gap-x-1.5 gap-y-1.5 sm:flex-nowrap sm:gap-x-2"
      aria-label="Product categories"
    >
      {categories.map((c) => {
        if (c.slug === "other") {
          return <OthersNavDropdown key={c.id} trigger={c} items={othersDropdownCategories} />;
        }

        const href = categoryHref(c.slug);
        const samples = productSamples[c.slug] ?? [];
        return (
          <div key={c.slug} className="group relative inline-block">
            <Link
              href={href}
              className="inline-block whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium text-filler-ink/90 transition hover:bg-filler-peach-200/80 hover:text-filler-ink group-hover:bg-filler-peach-200/80 group-hover:text-filler-ink sm:px-2.5 sm:text-sm"
            >
              {c.name}
            </Link>
            {samples.length > 0 ? (
              <>
                <div
                  className="absolute left-0 top-full z-[58] hidden h-2 w-full sm:block"
                  aria-hidden
                />
                <div className="invisible absolute left-0 top-full z-[60] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 sm:pt-2">
                  <div
                    className="w-[min(calc(100vw-2rem),24rem)] rounded-2xl border border-filler-pink-500/30 bg-filler-pink-400/95 py-2 pl-3.5 pr-2 shadow-xl"
                    role="menu"
                  >
                    <ul className="max-h-[min(50vh,20rem)] space-y-0.5 overflow-y-auto pr-1 text-sm">
                      {samples.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/product/${p.slug}`}
                            className="block rounded-lg px-2 py-1.5 font-medium text-white/95 transition hover:bg-filler-rose-700/35"
                            role="menuitem"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-1.5 border-t border-white/25 pt-2">
                      <Link
                        href={href}
                        className="block rounded-lg px-2 py-1.5 text-sm font-semibold text-white hover:underline"
                      >
                        View all in {c.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
