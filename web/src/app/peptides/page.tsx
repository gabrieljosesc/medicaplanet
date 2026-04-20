import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";

export default async function PeptidesPage() {
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("*").eq("slug", "peptides").maybeSingle();
  let products: {
    slug: string;
    title: string;
    base_price: number;
    currency: string;
    rating: number;
    review_count: number;
    product_images: { url: string }[] | null;
  }[] = [];
  if (cat) {
    const { data } = await supabase
      .from("products")
      .select("slug,title,base_price,currency,rating,review_count, product_images(url)")
      .eq("category_id", cat.id)
      .eq("is_active", true)
      .order("title");
    products = (data ?? []) as typeof products;
  }

  const rows = products.map((p) => ({
    ...p,
    imageUrl: Array.isArray(p.product_images) ? p.product_images[0]?.url : null,
  }));

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
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No peptide products in the database yet. Run <code className="rounded bg-zinc-100 px-1">npm run import:catalog</code> from the repo root after applying the Supabase migration.
          </p>
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
