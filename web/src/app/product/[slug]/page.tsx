import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductBuyBox } from "@/components/product-buy-box";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { withStorageImageTransform } from "@/lib/storage-image";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(slug,name), product_images(url,sort_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const imgs = Array.isArray(product.product_images)
    ? [...product.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];
  let hero = resolveProductMainImage(product.slug, imgs[0]?.url ?? null, product.title);
  if (
    process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
    hero.includes("/storage/v1/object/public/")
  ) {
    hero = withStorageImageTransform(hero, 960);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <Image
          src={hero}
          alt={product.title}
          fill
          className="object-cover"
          priority
          unoptimized={nextImageUnoptimized(hero)}
        />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-teal-800">
          {(product.categories as { name?: string } | null)?.name ?? "Catalog"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{product.title}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Rated {Number(product.rating).toFixed(2)} / 5 · {product.review_count} reviews
        </p>
        <ProductBuyBox
          slug={product.slug}
          title={product.title}
          currency={String(product.currency || "USD")}
          basePrice={Number(product.base_price)}
          priceTiersRaw={product.price_tiers}
          disabled={!product.is_active}
        />
        <div className="prose prose-sm mt-8 max-w-none text-zinc-700 whitespace-pre-wrap">
          {product.description || "Description coming soon."}
        </div>
      </div>
    </div>
  );
}
