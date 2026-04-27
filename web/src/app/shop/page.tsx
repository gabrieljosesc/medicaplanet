import { Suspense } from "react";
import { CatalogHighlightCard } from "@/components/catalog-highlight-card";
import { CatalogPagination } from "@/components/catalog-pagination";
import { CategoryProductToolbar } from "@/components/category-product-toolbar";
import { CATALOG_PER_PAGE, categoryNavLabel } from "@/lib/catalog-constants";
import { fetchAllProductsPage } from "@/lib/all-products-list";
import {
  categoryListParamsActive,
  parseCategoryListParams,
  parsePageParam,
} from "@/lib/category-product-list";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { createClient } from "@/lib/supabase/server";
import { withStorageImageTransform } from "@/lib/storage-image";
import Link from "next/link";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;
  const listParams = parseCategoryListParams(sp);
  const page = parsePageParam(sp);
  const supabase = await createClient();
  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id");
  const allowedIds = (categoryRows ?? []).map((c) => c.id as string);

  const { rows, count } = await fetchAllProductsPage(
    supabase,
    allowedIds,
    listParams,
    page,
    CATALOG_PER_PAGE
  );
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PER_PAGE));
  const filtered = categoryListParamsActive(listParams);

  const mapped = rows.map((p) => {
    const imageUrl = Array.isArray(p.product_images) ? p.product_images[0]?.url : null;
    let heroImageSrc = resolveProductMainImage(
      p.slug,
      imageUrl,
      p.title
    );
    if (
      process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
      heroImageSrc.includes("/storage/v1/object/public/")
    ) {
      heroImageSrc = withStorageImageTransform(heroImageSrc, 520);
    }
    return { ...p, heroImageSrc };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-filler-ink sm:text-3xl">All products</h1>
      <p className="mt-2 max-w-2xl text-sm text-filler-ink/80">
        Browse the full MedicaPlanet catalog. Use a category link on a card to filter that range.
      </p>

      <Suspense
        fallback={
          <div className="mt-6 h-20 animate-pulse bg-filler-peach-100/60 md:mt-8 md:rounded-xl md:py-2" />
        }
      >
        <CategoryProductToolbar basePath="/shop" />
      </Suspense>

      <div className="mx-auto mt-8 w-full max-w-[1600px]">
        {mapped.length === 0 && !filtered ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-6 text-sm text-amber-950">
            <p className="font-medium">No products in the catalog yet.</p>
            <p className="mt-2 text-amber-900/90">
              From the <code className="rounded bg-white/80 px-1">web</code> folder run{" "}
              <code className="rounded bg-white/80 px-1">npm run import:catalog</code> to sync
              your Product Master into Supabase.
            </p>
          </div>
        ) : mapped.length === 0 && filtered ? (
          <div className="rounded-2xl border border-filler-peach-200/90 bg-filler-pink-50/20 px-5 py-6 text-sm text-filler-ink/90">
            <p className="font-medium text-filler-ink">No products match these filters.</p>
            <p className="mt-2">
              Try clearing your search, changing sort, or{" "}
              <Link
                href="/shop"
                className="font-medium text-filler-rose-800 underline hover:no-underline"
              >
                reset all filters
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
            {mapped.map((p) => {
              const slug = p.category_slug;
              const name = p.category_name;
              return (
                <CatalogHighlightCard
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  description={p.description}
                  basePrice={Number(p.base_price)}
                  currency={p.currency}
                  rating={Number(p.rating)}
                  reviewCount={p.review_count}
                  heroImageSrc={p.heroImageSrc}
                  imageUnoptimized={nextImageUnoptimized(p.heroImageSrc)}
                  priceTiersRaw={p.price_tiers}
                  categoryName={slug && name ? categoryNavLabel(slug, name) : null}
                  categorySlug={slug ?? null}
                />
              );
            })}
          </div>
        )}
        <Suspense fallback={null}>
          <CatalogPagination basePath="/shop" currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
