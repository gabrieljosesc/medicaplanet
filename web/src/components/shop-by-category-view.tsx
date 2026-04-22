import Link from "next/link";

export type ShopCategoryRow = {
  slug: string;
  name: string;
  description: string | null;
};

function categoryHref(slug: string) {
  return slug === "peptides" ? "/peptides" : `/category/${slug}`;
}

function CapsuleMark() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/45 text-zinc-800 shadow-sm backdrop-blur-md"
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

function ShopCategoryCard({ slug, name, description }: ShopCategoryRow) {
  const href = categoryHref(slug);
  const initial = name.trim().slice(0, 1).toUpperCase();

  return (
    <li>
      <Link
        href={href}
        className="group flex flex-col overflow-hidden rounded-[1.65rem] bg-white p-2 shadow-md ring-1 ring-zinc-100 transition hover:shadow-lg hover:ring-zinc-200/90"
      >
        <div className="relative flex min-h-[9.5rem] items-center justify-between rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white px-4 py-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/90 bg-emerald-50 text-2xl font-bold text-emerald-800">
            {initial}
          </div>
          <div className="pointer-events-none absolute right-3 top-3 z-[25]">
            <CapsuleMark />
          </div>
          <div className="pointer-events-none absolute bottom-3 right-3 z-[25] rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm tabular-nums ring-1 ring-black/5 sm:text-sm">
            View range →
          </div>
        </div>
        <div className="flex flex-1 flex-col px-2 pb-3 pt-4">
          <h2 className="line-clamp-2 text-lg font-bold tracking-tight text-zinc-900 transition group-hover:text-emerald-900">
            {name}
          </h2>
          {description ? (
            <p className="mt-1.5 line-clamp-2 text-sm font-normal leading-snug text-zinc-500">{description}</p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function FeaturedCategoryCard({ slug, name, description }: ShopCategoryRow) {
  const href = categoryHref(slug);
  const initial = name.trim().slice(0, 1).toUpperCase();

  return (
    <li className="md:col-span-2 lg:col-span-3">
      <Link
        href={href}
        className="group flex min-h-[14rem] flex-col overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-lg ring-1 ring-zinc-100 transition hover:shadow-xl hover:ring-zinc-200/90 md:flex-row"
      >
        <div className="relative flex h-48 w-full shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50 via-white to-zinc-50 md:h-auto md:min-h-full md:w-[min(34%,18rem)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200/90 bg-white text-4xl font-bold text-emerald-800 shadow-sm">
            {initial}
          </div>
          <div className="pointer-events-none absolute right-4 top-4 z-[25]">
            <CapsuleMark />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 z-[25] rounded-xl border border-zinc-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-sm sm:text-sm">
            View range →
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2 px-4 py-5 sm:px-6 sm:py-6 md:py-8 md:pl-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-800/90">Featured</p>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{name}</h2>
          {description ? (
            <p className="max-w-xl line-clamp-4 text-sm leading-relaxed text-zinc-600 sm:line-clamp-5 sm:text-base lg:line-clamp-none">
              {description}
            </p>
          ) : null}
          <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur-sm transition group-hover:border-emerald-300 group-hover:bg-emerald-100">
            Browse this category
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

export function ShopByCategoryHero() {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl"
        aria-hidden
      />
      <p className="relative text-xs font-medium uppercase tracking-[0.22em] text-emerald-200/90 sm:text-sm">
        Browse catalog
      </p>
      <h1 className="relative mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
        Shop by category
      </h1>
      <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">
        Pick a therapeutic area. Peptides has its own hub for research-use descriptions sourced from your
        internal brief — same quality bar as the rest of the catalog.
      </p>
    </section>
  );
}

export function ShopByCategoryGrid({ categories }: { categories: ShopCategoryRow[] }) {
  if (!categories.length) {
    return <p className="text-sm text-zinc-500">No categories available yet.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {categories.map((c, i) =>
        i === 0 ? <FeaturedCategoryCard key={c.slug} {...c} /> : <ShopCategoryCard key={c.slug} {...c} />
      )}
    </ul>
  );
}
