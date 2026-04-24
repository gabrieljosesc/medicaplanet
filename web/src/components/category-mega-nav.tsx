"use client";

import Link from "next/link";
import { categoryHref } from "@/lib/category-href";
import type { NavCategory } from "@/lib/shop-nav-data";

type Sample = { slug: string; title: string };

/**
 * Filler-supplies style: horizontal categories with a soft pink panel of product links on hover.
 * Touch / narrow: category label still links to the category page.
 */
export function CategoryMegaNav({
  categories,
  productSamples,
}: {
  categories: NavCategory[];
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
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 sm:flex-nowrap sm:gap-x-2"
      aria-label="Product categories"
    >
      {categories.map((c) => {
        const href = categoryHref(c.slug);
        const samples = productSamples[c.slug] ?? [];
        return (
          <div key={c.slug} className="group relative inline-block">
            <Link
              href={href}
              className="inline-block whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium text-filler-ink/90 transition hover:bg-filler-peach-200/80 hover:text-filler-ink sm:px-2.5 sm:text-sm"
            >
              {c.name}
            </Link>
            {samples.length > 0 ? (
              <>
                <div
                  className="absolute left-0 top-full z-[58] hidden h-2 w-full sm:block"
                  aria-hidden
                />
                <div
                  className="invisible absolute left-0 top-full z-[60] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 sm:pt-2"
                >
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
