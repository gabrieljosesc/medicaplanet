import Link from "next/link";
import { Suspense } from "react";
import { CategoryProductToolbar } from "@/components/category-product-toolbar";
import { ProductCard } from "@/components/product-card";
import {
  categoryListParamsActive,
  fetchCategoryProducts,
  parseCategoryListParams,
} from "@/lib/category-product-list";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PeptidesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const listParams = parseCategoryListParams(sp);
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", "peptides").maybeSingle();

  let products = await (async () => {
    if (!cat) return [];
    return fetchCategoryProducts(supabase, cat.id, listParams);
  })();

  const rows = products.map((p) => ({
    ...p,
    imageUrl: Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
  }));
  const filtered = categoryListParamsActive(listParams);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Peptides</h1>
      <p className="mt-3 max-w-3xl text-sm text-zinc-700">
        {cat?.description ??
          "Research-use peptide descriptions for professional reference. Verify local regulations; CSR confirms account suitability."}
      </p>
      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-950">
        <strong>Imagery:</strong> PDPs use neutral placeholders until you upload assets in Admin
        (Supabase Storage). We do not copy third-party retailer catalogs.
      </section>

      {cat ? (
        <Suspense fallback={<div className="mt-8 h-28 animate-pulse rounded-xl bg-zinc-100" />}>
          <CategoryProductToolbar basePath="/peptides" />
        </Suspense>
      ) : null}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!cat || (rows.length === 0 && !filtered) ? (
          <p className="text-sm text-zinc-600">
            No peptide products in the database yet. Run{" "}
            <code className="rounded bg-zinc-100 px-1">npm run import:catalog</code> from the repo root
            after applying the Supabase migration.
          </p>
        ) : rows.length === 0 && filtered ? (
          <div className="col-span-full rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-6 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">No products match these filters.</p>
            <p className="mt-2">
              Try widening the price range, clearing search, or{" "}
              <Link href="/peptides" className="font-medium text-emerald-800 hover:underline">
                reset all filters
              </Link>
              .
            </p>
          </div>
        ) : (
          rows.map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              title={p.title}
              price={Number(p.base_price)}
              currency={p.currency}
              rating={Number(p.rating)}
              reviewCount={p.review_count}
              imageUrl={p.imageUrl}
            />
          ))
        )}
      </div>
    </div>
  );
}
