"use client";

import Link from "next/link";
import { useState } from "react";

/** Repeating stagger pattern for any number of categories. */
const STAGGER: readonly string[] = [
  "",
  "sm:translate-y-2 sm:pl-2",
  "sm:-translate-y-1",
  "sm:translate-y-3 sm:pl-6",
  "sm:pl-1",
  "sm:-translate-y-2 sm:pl-10",
  "sm:translate-y-1",
  "sm:pl-4",
  "sm:-translate-y-1 sm:pl-8",
  "sm:translate-y-2 sm:pl-2",
];

function categoryHref(slug: string) {
  return slug === "peptides" ? "/peptides" : `/category/${slug}`;
}

function ViewAllLink() {
  return (
    <Link
      href="/shop"
      className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 transition hover:text-emerald-800"
    >
      View all
      <span aria-hidden className="tracking-tighter">
        &gt;&gt;
      </span>
    </Link>
  );
}

function CapsuleGlyph({ emphasized }: { emphasized: boolean }) {
  return (
    <span
      className={
        emphasized
          ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80"
          : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100/90 text-zinc-400 ring-1 ring-zinc-200/50"
      }
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect
          x="5.5"
          y="9.25"
          width="13"
          height="5.5"
          rx="2.75"
          transform="rotate(-32 12 12)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function CategoriesBand({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const defaultSlug = categories[0]?.slug ?? "";
  const emphasizedSlug = activeSlug ?? defaultSlug;

  if (categories.length === 0) {
    return (
      <section className="rounded-2xl bg-white px-5 py-10 shadow-sm ring-1 ring-zinc-200/80 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Categories</h2>
        <p className="mt-6 text-sm text-zinc-500">No categories yet.</p>
        <div className="mt-10 flex justify-end sm:mt-12">
          <ViewAllLink />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white px-5 py-8 shadow-sm ring-1 ring-zinc-200/80 sm:px-8 sm:py-10">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Categories</h2>

      <div
        className="mt-6 flex flex-wrap content-start items-center gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-5"
        onMouseLeave={() => setActiveSlug(null)}
        onFocusCapture={(e) => {
          const slug = (e.target as HTMLElement | null)
            ?.closest<HTMLElement>("[data-category-slug]")
            ?.getAttribute("data-category-slug");
          if (slug) setActiveSlug(slug);
        }}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && e.currentTarget.contains(next)) return;
          setActiveSlug(null);
        }}
      >
        {categories.map((c, i) => {
          const emphasized = c.slug === emphasizedSlug;
          const stagger = STAGGER[i % STAGGER.length] ?? "";
          return (
            <Link
              key={c.slug}
              href={categoryHref(c.slug)}
              data-category-slug={c.slug}
              className={`group inline-flex max-w-full items-center gap-2.5 sm:gap-3 ${stagger}`}
              onMouseEnter={() => setActiveSlug(c.slug)}
            >
              <CapsuleGlyph emphasized={emphasized} />
              <span
                className={
                  emphasized
                    ? "text-xl font-bold leading-snug tracking-tight text-zinc-900 transition-[color,font-weight] duration-150 sm:text-2xl md:text-[1.65rem]"
                    : "text-xl font-light leading-snug tracking-tight text-zinc-400 transition-[color,font-weight] duration-150 sm:text-2xl md:text-[1.65rem]"
                }
              >
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex justify-end sm:mt-12">
        <ViewAllLink />
      </div>
    </section>
  );
}
