"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { IconHeart } from "@/components/nav-icons";
import { ProductCertBadges } from "@/components/product-cert-badges";
import { categoryHref } from "@/lib/category-href";
import { parsePriceTiersJson } from "@/lib/price-tiers";

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
  categoryName,
  categorySlug,
  fdaApproved,
  ceMarked,
}: {
  slug: string;
  title: string;
  description?: string | null;
  subtitle?: string | null;
  /** Small label above title, links to category or Peptides hub. */
  categoryName?: string | null;
  categorySlug?: string | null;
  basePrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  heroImageSrc: string;
  imageUnoptimized: boolean;
  priceTiersRaw: unknown;
  fdaApproved?: boolean | null;
  ceMarked?: boolean | null;
}) {
  const tiers = useMemo(() => parsePriceTiersJson(priceTiersRaw), [priceTiersRaw]);
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

  const [wishlisted, setWishlisted] = useState(() => readWishlistSlugs().has(slug));

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
            className="object-contain p-3 transition duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width:1024px) 50vw, 33vw"
            unoptimized={imageUnoptimized}
          />
        </Link>

        <button
          type="button"
          aria-label={wishlisted ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
          aria-pressed={wishlisted}
          className="absolute right-2 top-2 z-[25] flex h-8 w-8 items-center justify-center rounded-full border border-white/55 bg-white/45 text-zinc-700 shadow-sm backdrop-blur-md transition hover:bg-white/70 hover:text-rose-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          onClick={toggleWishlist}
        >
          <IconHeart
            filled={wishlisted}
            className={`h-[1.15rem] w-[1.15rem] shrink-0 ${wishlisted ? "text-rose-600" : ""}`}
          />
        </button>

        {priceBadge ? (
          <div className="pointer-events-none absolute bottom-2 right-2 z-[25] rounded-lg border border-zinc-200/90 bg-white/92 px-2 py-1 text-[11px] font-semibold text-zinc-900 shadow-md backdrop-blur-sm tabular-nums ring-1 ring-black/5 sm:bottom-3 sm:right-3 sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-xs">
            {priceBadge}
          </div>
        ) : null}

      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-2 pt-2.5 sm:px-2 sm:pb-3 sm:pt-4">
        {categoryName && categorySlug ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-filler-ink/50 sm:text-[11px]">
            <Link
              href={categoryHref(categorySlug)}
              className="text-filler-rose-700/90 transition hover:text-filler-rose-800 hover:underline"
            >
              {categoryName}
            </Link>
          </p>
        ) : null}
        <ProductCertBadges fdaApproved={fdaApproved} ceMarked={ceMarked} className="mb-1.5" />
        <Link href={`/product/${slug}`} className="block flex-1 text-left">
          <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-filler-ink transition group-hover:text-filler-rose-800 sm:text-lg">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[11px] font-medium text-filler-rose-800/90 sm:text-xs">{subtitle}</p>
          ) : null}
          <p className="mt-1 line-clamp-2 text-[12px] font-normal leading-snug text-filler-ink/55 sm:mt-1.5 sm:text-sm">
            {blurb}
          </p>
        </Link>
      </div>
    </div>
  );
}
