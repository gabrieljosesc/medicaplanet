import Link from "next/link";
import { CatalogHighlightCard } from "@/components/catalog-highlight-card";
import { CategoriesBand } from "@/components/categories-band";
import { HomeHero } from "@/components/home-hero";
import { HomeHeroChrome } from "@/components/home-hero-chrome";
import { createClient } from "@/lib/supabase/server";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { getSiteUserContext } from "@/lib/site-user-context";
import { withStorageImageTransform } from "@/lib/storage-image";

export default async function HomePage() {
  const { user, profile, isAdmin } = await getSiteUserContext();
  const supabase = await createClient();
  const [{ data: categories }, { data: featured }, { data: posts }] = await Promise.all([
    supabase
      .from("categories")
      .select("slug,name,description,sort_order")
      .not("slug", "in", "(orthopedic-injections,orthopaedics)")
      .order("sort_order"),
    supabase
      .from("products")
      .select("slug,title,description,base_price,currency,rating,review_count,price_tiers, product_images(url)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("title")
      .limit(8),
    supabase
      .from("blog_posts")
      .select("slug,title,excerpt,published_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const feat = (featured ?? []).map((p) => {
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

  return (
    <>
      <HomeHeroChrome user={user} profile={profile} isAdmin={isAdmin} />
      <HomeHero />
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12">
      <section>
        <CategoriesBand
          categories={(categories ?? []).map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Catalog highlights
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {feat.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No active products yet. Apply the Supabase migration and run{" "}
              <code className="rounded bg-zinc-100 px-1">npm run import:catalog</code> from the repo
              root.
            </p>
          ) : (
            feat.map((p) => (
              <CatalogHighlightCard
                key={p.slug}
                slug={p.slug}
                title={p.title}
                description={typeof p.description === "string" ? p.description : null}
                basePrice={Number(p.base_price)}
                currency={p.currency}
                rating={Number(p.rating)}
                reviewCount={p.review_count}
                heroImageSrc={p.heroImageSrc}
                imageUnoptimized={p.imageUnoptimized}
                priceTiersRaw={p.price_tiers}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900">From the blog</h2>
          <Link href="/blog" className="text-sm font-medium text-emerald-800 hover:underline">
            All posts
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(posts ?? []).map((b) => (
            <Link
              key={b.slug}
              href={`/blog/${b.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-emerald-300"
            >
              <h3 className="font-semibold text-emerald-900">{b.title}</h3>
              {b.excerpt && <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{b.excerpt}</p>}
            </Link>
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
