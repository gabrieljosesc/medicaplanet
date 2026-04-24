import Link from "next/link";
import { Suspense } from "react";
import { CatalogHighlightCard } from "@/components/catalog-highlight-card";
import { CatalogPagination } from "@/components/catalog-pagination";
import { CategoryProductToolbar } from "@/components/category-product-toolbar";
import { CATALOG_PER_PAGE, categoryNavLabel } from "@/lib/catalog-constants";
import {
  type CategoryProductRow,
  categoryListParamsActive,
  fetchCategoryProducts,
  parseCategoryListParams,
  parsePageParam,
} from "@/lib/category-product-list";
import { sortRowsLikePurechainPeptides } from "@/lib/purechain-peptides-order";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { createClient } from "@/lib/supabase/server";
import { withStorageImageTransform } from "@/lib/storage-image";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PeptidesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const listParams = parseCategoryListParams(sp);
  const page = parsePageParam(sp);
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", "peptides")
    .maybeSingle();

  const filtered = categoryListParamsActive(listParams);
  const usePurechainList =
    Boolean(cat) && !filtered && listParams.sort === "master_asc";

  const { productRows, totalPages } = await (async (): Promise<{
    productRows: CategoryProductRow[];
    totalPages: number;
  }> => {
    if (!cat) {
      return { productRows: [], totalPages: 1 };
    }
    if (usePurechainList) {
      const { rows: all } = await fetchCategoryProducts(supabase, cat.id, listParams, null);
      const sorted = sortRowsLikePurechainPeptides(all);
      const t = sorted.length;
      const tp = Math.max(1, Math.ceil(t / CATALOG_PER_PAGE));
      const from = (page - 1) * CATALOG_PER_PAGE;
      return {
        productRows: sorted.slice(from, from + CATALOG_PER_PAGE),
        totalPages: tp,
      };
    }
    const { rows, count } = await fetchCategoryProducts(
      supabase,
      cat.id,
      listParams,
      { page, perPage: CATALOG_PER_PAGE }
    );
    const t = count ?? 0;
    return {
      productRows: rows,
      totalPages: Math.max(1, Math.ceil(t / CATALOG_PER_PAGE)),
    };
  })();

  const rows = productRows.map((p) => ({
    ...p,
    imageUrl: Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
    heroImageSrc: (() => {
      let src = resolveProductMainImage(
        p.slug,
        Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
        p.title
      );
      if (
        process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
        src.includes("/storage/v1/object/public/")
      ) {
        src = withStorageImageTransform(src, 520);
      }
      return src;
    })(),
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Peptides</h1>
      <p className="mt-3 max-w-3xl text-sm text-zinc-700">
        {cat?.description ??
          "Research-use peptide listings for professional reference, aligned with our development partner catalog. Verify local regulations and account requirements before ordering."}
      </p>

      {cat ? (
        <Suspense fallback={<div className="mt-8 h-28 animate-pulse rounded-xl bg-zinc-100" />}>
          <CategoryProductToolbar basePath="/peptides" />
        </Suspense>
      ) : null}

      <div className="mx-auto mt-8 w-full max-w-[1600px]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
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
              <Link href="/peptides" className="font-medium text-teal-800 hover:underline">
                reset all filters
              </Link>
              .
            </p>
          </div>
        ) : (
          rows.map((p) => {
            const cs = p.category_slug;
            const cn = p.category_name;
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
              categoryName={cs && cn ? categoryNavLabel(cs, cn) : null}
              categorySlug={cs ?? null}
            />
            );
          })
        )}
        </div>
        {cat ? (
          <Suspense fallback={null}>
            <CatalogPagination basePath="/peptides" currentPage={page} totalPages={totalPages} />
          </Suspense>
        ) : null}
      </div>

      <section className="mt-12 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-zinc-900">Research use disclaimer</h2>
        <p className="mt-3 leading-relaxed">
          Peptide products listed on this website are supplied for research use only. They are not
          intended for human or veterinary use, clinical treatment, or diagnostic application.
        </p>
        <p className="mt-2 leading-relaxed">
          Statements on this website have not been evaluated by the U.S. Food and Drug
          Administration and are not intended to diagnose, treat, cure, or prevent any disease.
        </p>
        <p className="mt-3 leading-relaxed">
          By purchasing peptide products from MedicaPlanet, you confirm that you are ordering for
          lawful research or professional purposes and agree to the full policy terms.
        </p>
        <Link
          href="/legal/research-use-only"
          className="mt-4 inline-block font-medium text-teal-800 underline hover:no-underline"
        >
          Read the full Research Use Only policy
        </Link>
      </section>
    </div>
  );
}
