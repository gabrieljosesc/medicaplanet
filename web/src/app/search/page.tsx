import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CatalogHighlightCard } from "@/components/catalog-highlight-card";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { searchActiveProducts } from "@/lib/search-products";
import { withStorageImageTransform } from "@/lib/storage-image";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const supabase = await createClient();
  const rowsRaw = term.length >= 2 ? await searchActiveProducts(supabase, term, 60) : [];
  const rows = rowsRaw.map((p) => {
    let heroImageSrc = resolveProductMainImage(p.slug, p.imageUrl ?? null, p.title);
    if (
      process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
      heroImageSrc.includes("/storage/v1/object/public/")
    ) {
      heroImageSrc = withStorageImageTransform(heroImageSrc, 520);
    }
    return {
      ...p,
      heroImageSrc,
      imageUnoptimized: nextImageUnoptimized(heroImageSrc),
    };
  });

  const ambiguous = rows.length >= 2;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Search</h1>
      {!term && (
        <p className="mt-3 text-sm text-zinc-600">
          Use the search icon in the header: type a product name, pick a suggestion, or press Enter to
          see all matches.
        </p>
      )}
      {term.length === 1 && (
        <p className="mt-3 text-sm text-zinc-600">
          Please enter at least two characters for <span className="font-medium text-zinc-800">{term}</span>.
        </p>
      )}
      {term.length >= 2 && (
        <>
          <p className="mt-3 text-sm text-zinc-600">
            {rows.length} result{rows.length === 1 ? "" : "s"} for{" "}
            <span className="font-medium text-zinc-800">&ldquo;{term}&rdquo;</span>
          </p>
          {ambiguous && (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
              <p className="font-medium text-emerald-900">Several products matched</p>
              <p className="mt-1 text-emerald-900/90">
                The same words often appear on different SKUs. Each card shows its{" "}
                <span className="font-medium">category</span> under the title so you can pick the right
                line. Open a product for full details.
              </p>
            </div>
          )}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {rows.length === 0 ? (
              <p className="col-span-full text-sm text-zinc-600">
                No matches. Try different keywords or{" "}
                <Link href="/shop" className="font-medium text-emerald-800 hover:underline">
                  browse categories
                </Link>
                .
              </p>
            ) : (
              rows.map((p) => (
                <CatalogHighlightCard
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  description={p.description}
                  subtitle={p.categoryName}
                  basePrice={p.base_price}
                  currency={p.currency}
                  rating={p.rating}
                  reviewCount={p.review_count}
                  heroImageSrc={p.heroImageSrc}
                  imageUnoptimized={p.imageUnoptimized}
                  priceTiersRaw={p.price_tiers}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
