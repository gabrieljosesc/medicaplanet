import Link from "next/link";
import { notFound } from "next/navigation";
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
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (slug === "peptides") {
    const { redirect } = await import("next/navigation");
    redirect("/peptides");
  }
  const sp = await searchParams;
  const listParams = parseCategoryListParams(sp);
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", slug).single();
  if (!cat) notFound();

  const products = await fetchCategoryProducts(supabase, cat.id, listParams);
  const rows = products.map((p) => ({
    ...p,
    imageUrl: Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
  }));
  const filtered = categoryListParamsActive(listParams);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{cat.name}</h1>
      {cat.description && <p className="mt-3 max-w-3xl text-sm text-zinc-700">{cat.description}</p>}
      <div className="prose prose-sm mt-6 max-w-3xl text-zinc-700">
        <p>
          MedicaPlanet supplies licensed professionals. CSR may request license verification before
          fulfillment. Pricing tiers from your internal export are reflected as &quot;From&quot;
          amounts when volume breaks exist.
        </p>
      </div>

      <Suspense fallback={<div className="mt-8 h-28 animate-pulse rounded-xl bg-zinc-100" />}>
        <CategoryProductToolbar basePath={`/category/${slug}`} />
      </Suspense>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && !filtered ? (
          <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50/80 px-5 py-6 text-sm text-amber-950">
            <p className="font-medium">No products in this category yet.</p>
            <p className="mt-2 text-amber-900/90">
              From the <code className="rounded bg-white/80 px-1">web</code> folder run{" "}
              <code className="rounded bg-white/80 px-1">npm run import:catalog</code> so rows from
              your Product Master + price list sync into Supabase. If you already imported, re-run
              after updates — the script upserts by product slug.
            </p>
          </div>
        ) : rows.length === 0 && filtered ? (
          <div className="col-span-full rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-6 text-sm text-zinc-700">
            <p className="font-medium text-zinc-900">No products match these filters.</p>
            <p className="mt-2">
              Try widening the price range, clearing search, or{" "}
              <Link href={`/category/${slug}`} className="font-medium text-emerald-800 hover:underline">
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
