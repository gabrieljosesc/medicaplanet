import Link from "next/link";
import { CategoriesBand } from "@/components/categories-band";
import { categoryNavLabel } from "@/lib/catalog-constants";
import { FeaturedProductCard } from "@/components/featured-product-card";
import { HomeBrandMarquee } from "@/components/home-brand-marquee";
import { HomeHero } from "@/components/home-hero";
import { HomeReviews } from "@/components/home-reviews";
import { MobileTopSellersStrip } from "@/components/mobile-top-sellers-strip";
import { buildHomeBrandMarqueeItems } from "@/lib/home-brand-marquee";
import { applyCuratedHomeHeroSlides } from "@/lib/home-hero-curated";
import { buildMonthlyHighlightSlides } from "@/lib/monthly-highlight-slides";
import { getSiteBlogPosts } from "@/lib/site-blog";
import { createClient } from "@/lib/supabase/server";
import { mergeBestSellerSlots, resolveBestSellerSlots } from "@/lib/best-sellers-home";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { resolveFeaturedHomeProducts } from "@/lib/resolve-featured-home";
import { withStorageImageTransform } from "@/lib/storage-image";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: productsRaw }, { data: allActiveForBrandCounts }] =
    await Promise.all([
    supabase
      .from("categories")
      .select("slug,name,description,sort_order")
      .order("sort_order"),
    supabase
      .from("products")
      .select(
        "slug,title,description,base_price,currency,rating,review_count,price_tiers,category_id,is_featured,categories(slug,name), product_images(url)"
      )
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("title")
      .limit(200),
    supabase
      .from("products")
      .select("title,slug,description")
      .eq("is_active", true)
      .order("title"),
  ]);
  const featuredBlogPosts = getSiteBlogPosts(3);

  const enriched = (productsRaw ?? []).map((p) => {
    const imageUrl = Array.isArray(p.product_images) ? p.product_images[0]?.url : null;
    let heroImageSrc = resolveProductMainImage(p.slug, imageUrl ?? null, p.title);
    if (
      process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
      heroImageSrc.includes("/storage/v1/object/public/")
    ) {
      heroImageSrc = withStorageImageTransform(heroImageSrc, 520);
    }
    return {
      ...p,
      imageUrl,
      heroImageSrc,
      imageUnoptimized: nextImageUnoptimized(heroImageSrc),
    };
  });

  const relFiltered = enriched;

  const rawCats = (categories ?? []) as { slug: string; name: string }[];
  const otherC = rawCats.find((c) => c.slug === "other");
  const HOME_PINNED_FIRST_SLUGS = [
    "dermal-fillers",
    "botulinum-toxins",
    "peptides",
  ] as const;
  const pinnedFirstC = HOME_PINNED_FIRST_SLUGS.map((slug) =>
    rawCats.find((c) => c.slug === slug)
  );
  const pinnedSet = new Set(
    pinnedFirstC.filter(Boolean).map((c) => c!.slug)
  );
  const restC = rawCats.filter(
    (c) => !pinnedSet.has(c.slug) && c.slug !== "other"
  );
  const homeCategories = [...pinnedFirstC, ...restC, otherC]
    .filter((c): c is { slug: string; name: string } => Boolean(c))
    .map((c) => ({ slug: c.slug, name: categoryNavLabel(c.slug, c.name) }));

  type FeaturedHomeRow = Parameters<typeof resolveFeaturedHomeProducts>[0][number];
  const featuredRows = relFiltered as FeaturedHomeRow[];
  const featuredPool = resolveFeaturedHomeProducts(featuredRows);
  const bestSellerSlots = resolveBestSellerSlots(featuredRows);
  const bestSellers = mergeBestSellerSlots(bestSellerSlots, featuredPool).slice(0, 6);
  const mobileTopSellers = [...relFiltered]
    .sort((a, b) => {
      const featuredDelta = Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured));
      if (featuredDelta !== 0) return featuredDelta;
      const reviewsDelta = Number(b.review_count ?? 0) - Number(a.review_count ?? 0);
      if (reviewsDelta !== 0) return reviewsDelta;
      return Number(b.rating ?? 0) - Number(a.rating ?? 0);
    })
    .slice(0, 12);

  const brandMarqueeItems = buildHomeBrandMarqueeItems(
    ((allActiveForBrandCounts ?? []) as { title?: string; slug?: string; description?: string }[])
  );
  const monthlyHighlightSlides = applyCuratedHomeHeroSlides(
    buildMonthlyHighlightSlides(bestSellers)
  );

  return (
    <>
      <HomeHero slides={monthlyHighlightSlides} />
      <HomeBrandMarquee items={brandMarqueeItems} />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-10">
        <section>
          <MobileTopSellersStrip
            products={mobileTopSellers.map((p) => ({
              slug: p.slug,
              title: p.title,
              heroImageSrc: p.heroImageSrc,
              imageUnoptimized: Boolean(p.imageUnoptimized),
              base_price: Number(p.base_price ?? 0),
              currency: String(p.currency ?? "USD"),
            }))}
          />
        </section>
      </div>

      <HomeReviews />

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:pb-14">
        <section>
          <CategoriesBand categories={homeCategories} />
        </section>
      </div>

      <section
        id="best-sellers"
        className="w-full scroll-mt-24 border-t border-filler-peach-200/50 bg-white py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <h2 className="mb-10 text-center text-2xl font-bold uppercase tracking-wide text-neutral-900 sm:mb-12 sm:text-3xl">
            Best sellers
          </h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20">
            {bestSellers.length === 0 ? (
              <p className="text-sm text-neutral-500 sm:col-span-2 lg:col-span-3">
                No active products yet. Apply the Supabase migration and run{" "}
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">npm run import:catalog</code>{" "}
                from the repo root.
              </p>
            ) : (
              bestSellers.map((row) => {
                const p = row.product;
                const rel = p.categories as
                  | { slug?: string; name?: string }
                  | { slug?: string; name?: string }[]
                  | null;
                const c = Array.isArray(rel) ? rel[0] : rel;
                return (
                  <FeaturedProductCard
                    key={p.slug}
                    variant="bestSeller"
                    bestSellerTags={row.tags.length > 0 ? row.tags : undefined}
                    compareAtPrice={row.compareAtPrice}
                    slug={p.slug}
                    title={p.title}
                    basePrice={Number(p.base_price)}
                    currency={String(p.currency ?? "USD")}
                    rating={Number(p.rating)}
                    reviewCount={Number(p.review_count ?? 0)}
                    heroImageSrc={p.heroImageSrc}
                    imageUnoptimized={Boolean(p.imageUnoptimized)}
                    priceTiersRaw={p.price_tiers}
                    categoryName={
                      c?.slug && c?.name
                        ? categoryNavLabel(c.slug, c.name)
                        : c?.name ?? null
                    }
                    categorySlug={c?.slug ?? null}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-14">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-filler-ink sm:text-2xl">From the blog</h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-filler-rose-800 hover:underline"
          >
            All posts
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredBlogPosts.map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="group rounded-xl border border-filler-peach-200/80 bg-white p-5 shadow-sm transition hover:border-filler-pink-300 hover:shadow-md"
            >
              <h3 className="font-medium text-filler-ink group-hover:text-filler-rose-800">
                {b.title}
              </h3>
              {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-filler-ink/70">{b.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
