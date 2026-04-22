import Image from "next/image";
import Link from "next/link";
import { categoryHeroImageUrl } from "@/lib/category-hero-images";

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

/** Matches catalog highlight cards: 4:5 image, glass chips, no buy-now overlay, no wishlist. */
function ShopCategoryCard({ slug, name, description }: ShopCategoryRow) {
  const href = categoryHref(slug);
  const src = categoryHeroImageUrl(slug);

  return (
    <li>
      <Link
        href={href}
        className="group flex flex-col overflow-hidden rounded-[1.65rem] bg-white p-2 shadow-md ring-1 ring-zinc-100 transition hover:shadow-lg hover:ring-zinc-200/90"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover transition duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
            aria-hidden
          />
          <div className="pointer-events-none absolute right-3 top-3 z-[25] sm:right-4 sm:top-4">
            <CapsuleMark />
          </div>
          <div className="pointer-events-none absolute bottom-3 right-3 z-[25] rounded-xl border border-zinc-200/90 bg-white/92 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-md backdrop-blur-sm tabular-nums ring-1 ring-black/5 sm:text-sm">
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
  const src = categoryHeroImageUrl(slug);

  return (
    <li className="md:col-span-2 lg:col-span-3">
      <Link
        href={href}
        className="group flex min-h-[min(20rem,48vw)] flex-col overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-lg ring-1 ring-zinc-100 transition hover:shadow-xl hover:ring-zinc-200/90 md:min-h-[15rem] md:flex-row"
      >
        <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-auto md:min-h-full md:w-[min(42%,24rem)]">
          <Image
            src={src}
            alt={name}
            fill
            className="object-cover transition duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 50vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/35"
            aria-hidden
          />
          <div className="pointer-events-none absolute right-4 top-4 z-[25]">
            <CapsuleMark />
          </div>
          <div className="pointer-events-none absolute bottom-4 right-4 z-[25] rounded-xl border border-zinc-200/90 bg-white/92 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-md backdrop-blur-sm sm:text-sm">
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
