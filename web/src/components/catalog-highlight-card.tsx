"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { IconCartBag } from "@/components/nav-icons";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";

export function CatalogHighlightCard({
  slug,
  title,
  basePrice,
  currency,
  rating,
  reviewCount,
  heroImageSrc,
  imageUnoptimized,
  priceTiersRaw,
}: {
  slug: string;
  title: string;
  basePrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  heroImageSrc: string;
  imageUnoptimized: boolean;
  priceTiersRaw: unknown;
}) {
  const tiers = useMemo(() => parsePriceTiersJson(priceTiersRaw), [priceTiersRaw]);
  const unit = useMemo(() => unitPriceForQuantity(tiers, 1, basePrice), [tiers, basePrice]);
  const hasPrice = basePrice > 0 || tiers.length > 0;

  const displayFrom =
    basePrice > 0 ? basePrice : tiers.length > 0 ? tiers[0].price : 0;
  const priceLabel =
    basePrice > 0 || tiers.length > 0
      ? `From ${currency === "USD" ? "$" : currency + " "}${displayFrom.toFixed(0)}`
      : "Request pricing";

  const { addLine } = useCart();
  const router = useRouter();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <div className="relative aspect-[5/4] w-full bg-zinc-100">
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 z-0 block outline-none"
          aria-label={`View ${title}`}
        >
          <Image
            src={heroImageSrc}
            alt={title}
            fill
            className="object-cover transition duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
            unoptimized={imageUnoptimized}
          />
        </Link>
        {hasPrice ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-4 opacity-100 transition-opacity duration-200 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100"
          >
            <button
              type="button"
              aria-label={`Buy ${title} now — go to checkout`}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/30 px-6 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-zinc-900/20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addLine({
                  slug,
                  title,
                  unitPrice: unit,
                  quantity: 1,
                  currency,
                  priceTiers: tiers.length ? tiers : undefined,
                  selected: true,
                  deselectOthers: true,
                });
                router.push("/checkout");
              }}
            >
              Buy now
              <IconCartBag className="h-5 w-5 shrink-0" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
      <Link
        href={`/product/${slug}`}
        className="flex flex-1 flex-col gap-1 p-4"
      >
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-emerald-900">
          {title}
        </h3>
        <p className="text-xs text-zinc-500">
          Rated {rating.toFixed(2)} / 5 · {reviewCount} reviews
        </p>
        <p className="mt-auto text-sm font-semibold text-emerald-800">{priceLabel}</p>
      </Link>
    </div>
  );
}
