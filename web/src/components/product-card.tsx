import Link from "next/link";
import Image from "next/image";
import { nextImageUnoptimized, resolveProductMainImage } from "@/lib/product-image";
import { withStorageImageTransform } from "@/lib/storage-image";

export function ProductCard({
  slug,
  title,
  price,
  currency,
  rating,
  reviewCount,
  imageUrl,
  subtitle,
}: {
  slug: string;
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string | null;
  /** e.g. category — helps tell similar product names apart on search */
  subtitle?: string | null;
}) {
  const priceLabel =
    price > 0
      ? `From ${currency === "USD" ? "$" : currency + " "}${price.toFixed(0)}`
      : "Request pricing";
  let src = resolveProductMainImage(slug, imageUrl ?? null, title);
  if (
    process.env.NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORM === "1" &&
    src.includes("/storage/v1/object/public/")
  ) {
    src = withStorageImageTransform(src, 520);
  }
  return (
    <Link
      href={`/product/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="relative aspect-[5/4] w-full bg-zinc-100">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized={nextImageUnoptimized(src)}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-emerald-900">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-xs font-medium text-emerald-800/90">{subtitle}</p>
        ) : null}
        <p className="text-xs text-zinc-500">
          Rated {rating.toFixed(2)} / 5 · {reviewCount} reviews
        </p>
        <p className="mt-auto text-sm font-semibold text-emerald-800">{priceLabel}</p>
      </div>
    </Link>
  );
}
