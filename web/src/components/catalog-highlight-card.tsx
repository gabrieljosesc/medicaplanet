"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCartBag, IconHeart } from "@/components/nav-icons";
import { useCart } from "@/context/cart-context";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";

const WISHLIST_KEY = "medicaplanet-wishlist-slugs-v1";

function readWishlistSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeWishlistSlugs(next: Set<string>) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...next]));
}

export function CatalogHighlightCard({
  slug,
  title,
  description,
  subtitle,
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
  description?: string | null;
  subtitle?: string | null;
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
  const cur = (currency && currency.trim()) || "USD";
  const priceBadge =
    hasPrice && Number.isFinite(displayFrom) ? `${cur} ${Math.round(displayFrom)}` : null;

  const blurb =
    description && description.trim().length > 0
      ? description.trim()
      : `Rated ${rating.toFixed(2)} / 5 · ${reviewCount} reviews`;

  const { addLine } = useCart();
  const router = useRouter();

  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(readWishlistSlugs().has(slug));
  }, [slug]);

  const toggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = readWishlistSlugs();
      if (prev.has(slug)) prev.delete(slug);
      else prev.add(slug);
      writeWishlistSlugs(prev);
      setWishlisted(prev.has(slug));
    },
    [slug]
  );

  return (
    <div className="group flex flex-col rounded-[1.65rem] bg-white p-2 shadow-md ring-1 ring-filler-peach-200/90 transition hover:shadow-lg hover:ring-filler-pink-300/80">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-filler-cream">
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

        <button
          type="button"
          aria-label={wishlisted ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 z-[25] flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-white/45 text-zinc-700 shadow-sm backdrop-blur-md transition hover:bg-white/70 hover:text-rose-600"
          onClick={toggleWishlist}
        >
          <IconHeart
            filled={wishlisted}
            className={`h-[1.15rem] w-[1.15rem] shrink-0 ${wishlisted ? "text-rose-600" : ""}`}
          />
        </button>

        {priceBadge ? (
          <div className="pointer-events-none absolute bottom-3 right-3 z-[25] rounded-xl border border-zinc-200/90 bg-white/92 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-md backdrop-blur-sm tabular-nums ring-1 ring-black/5">
            {priceBadge}
          </div>
        ) : null}

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

      <Link href={`/product/${slug}`} className="flex flex-1 flex-col px-2 pb-3 pt-4">
        <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-filler-ink transition group-hover:text-filler-rose-800">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-xs font-medium text-filler-rose-800/90">{subtitle}</p>
        ) : null}
        <p className="mt-1.5 line-clamp-2 text-sm font-normal leading-snug text-filler-ink/55">
          {blurb}
        </p>
      </Link>
    </div>
  );
}
