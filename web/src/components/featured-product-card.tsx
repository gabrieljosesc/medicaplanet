"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { IconCartBag } from "@/components/nav-icons";
import { useCart } from "@/context/cart-context";
import { categoryHref } from "@/lib/category-href";
import { parsePriceTiersJson, unitPriceForQuantity } from "@/lib/price-tiers";

function StarRow({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <div className="flex gap-0.5 text-[13px] leading-none text-amber-400" aria-label={`${r} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= r ? "opacity-100" : "opacity-20"}>
          ★
        </span>
      ))}
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export type BestSellerTagLink = { label: string; href: string };

/**
 * Catalog row: default “featured” band, or “bestSeller” (FillerSupplies-style) with optional tag links + compare-at.
 */
export function FeaturedProductCard({
  slug,
  title,
  basePrice,
  currency,
  rating,
  reviewCount,
  heroImageSrc,
  imageUnoptimized,
  priceTiersRaw,
  categoryName,
  categorySlug,
  variant = "featured",
  bestSellerTags,
  compareAtPrice,
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
  categoryName: string | null;
  categorySlug: string | null;
  variant?: "featured" | "bestSeller";
  bestSellerTags?: BestSellerTagLink[];
  compareAtPrice?: number;
}) {
  const tiers = useMemo(() => parsePriceTiersJson(priceTiersRaw), [priceTiersRaw]);
  const unit = useMemo(
    () => unitPriceForQuantity(tiers, 1, basePrice),
    [tiers, basePrice]
  );
  const hasPrice = basePrice > 0 || tiers.length > 0;
  const minPrice =
    tiers.length > 0
      ? Math.min(...tiers.map((t) => t.price), basePrice > 0 ? basePrice : Infinity)
      : basePrice;
  const display = Number.isFinite(minPrice) && minPrice > 0 ? minPrice : basePrice;
  const cur = (currency && currency.trim()) || "USD";
  const prefix = cur === "USD" ? "$" : `${cur} `;
  const showFrom = tiers.length > 0;
  const amount = hasPrice && Number.isFinite(display) && display > 0 ? Math.round(display) : null;

  const { addLine } = useCart();
  const router = useRouter();
  const cat = categorySlug && categoryName ? { slug: categorySlug, name: categoryName } : null;
  const firstWord = title.trim().split(/\s+/)[0] ?? "";
  const showBrandTag =
    firstWord.length > 1 &&
    cat &&
    !cat.name.toLowerCase().includes(firstWord.toLowerCase().slice(0, 3));

  const isBest = variant === "bestSeller";
  const showStars =
    isBest || (reviewCount > 0 && rating > 0);
  const starRating = isBest ? 5 : rating;
  const compareRounded =
    compareAtPrice != null && Number.isFinite(compareAtPrice) ? Math.round(compareAtPrice) : null;
  const savings =
    isBest && compareRounded != null && amount != null && compareRounded > amount
      ? compareRounded - amount
      : null;

  const categoryLinksRow =
    isBest && bestSellerTags && bestSellerTags.length > 0 ? (
      <p className="mt-3 text-xs leading-relaxed text-neutral-700 sm:text-sm">
        {bestSellerTags.map((tag, i) => (
          <span key={`${tag.href}-${i}`}>
            {i > 0 ? <span className="text-neutral-400">, </span> : null}
            <Link
              href={tag.href}
              className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 transition hover:text-filler-rose-800"
            >
              {tag.label}
            </Link>
          </span>
        ))}
      </p>
    ) : isBest && cat ? (
      <p className="mt-3 text-xs text-neutral-700 sm:text-sm">
        <Link
          href={categoryHref(cat.slug)}
          className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 transition hover:text-filler-rose-800"
        >
          {cat.name}
        </Link>
        {showBrandTag ? (
          <>
            <span className="text-neutral-400"> · </span>
            <Link
              href={`/search?q=${encodeURIComponent(firstWord)}`}
              className="font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-2 transition hover:text-filler-rose-800"
            >
              {firstWord}
            </Link>
          </>
        ) : null}
      </p>
    ) : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
      <div className="relative flex w-full shrink-0 items-center justify-center sm:w-[38%] sm:max-w-[200px] lg:max-w-[240px]">
        {isBest ? (
          <div
            className="pointer-events-none absolute inset-2 -z-0 scale-110 rounded-[45%] bg-gradient-to-br from-neutral-200/70 via-filler-peach-100/50 to-neutral-100/40 blur-xl"
            aria-hidden
          />
        ) : null}
        <div className="relative aspect-[4/5] w-full max-w-[200px] sm:max-w-none">
          {savings != null && savings > 0 ? (
            <span className="absolute left-1 top-1 z-20 rounded-full bg-gradient-to-r from-filler-pink-400 to-filler-peach-400 px-2 py-0.5 text-[11px] font-bold text-white shadow-md sm:left-2 sm:top-2 sm:px-2.5 sm:py-1 sm:text-xs">
              -{prefix}
              {savings}
            </span>
          ) : null}
          <Link href={`/product/${slug}`} className="absolute inset-0 z-10" aria-label={title}>
            <Image
              src={heroImageSrc}
              alt={title}
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 45vw, 240px"
              unoptimized={imageUnoptimized}
            />
          </Link>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col text-neutral-900">
        {showStars ? (
          <div className="flex w-full items-start justify-end">
            <StarRow rating={starRating} />
          </div>
        ) : null}

        {amount != null ? (
          <p
            className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-neutral-800 ${showStars ? "mt-1" : "mt-0"}`}
          >
            {showFrom ? "From " : null}
            {isBest ? (
              <span className="inline-flex items-center rounded-full bg-filler-peach-200/95 px-2 py-0.5 shadow-sm">
                <span className="text-lg font-bold tabular-nums text-neutral-900 sm:text-xl">
                  {prefix}
                  {amount}
                </span>
              </span>
            ) : (
              <span className="text-lg font-bold tabular-nums text-neutral-900 sm:text-xl">
                {prefix}
                {amount}
              </span>
            )}
            {isBest && compareRounded != null && amount != null && compareRounded > amount ? (
              <span className="text-sm tabular-nums text-neutral-500 line-through">
                {prefix}
                {compareRounded}
              </span>
            ) : null}
          </p>
        ) : (
          <p className={`text-sm font-medium text-neutral-600 ${showStars ? "mt-1" : "mt-0"}`}>
            Request pricing
          </p>
        )}

        {isBest ? (
          categoryLinksRow
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-500 sm:text-sm">
            {cat ? (
              <Link
                href={categoryHref(cat.slug)}
                className="underline decoration-zinc-300 underline-offset-2 transition hover:text-neutral-700"
              >
                {cat.name}
              </Link>
            ) : null}
            {showBrandTag ? (
              <>
                {cat ? <span className="text-zinc-300">·</span> : null}
                <Link
                  href={`/search?q=${encodeURIComponent(firstWord)}`}
                  className="underline decoration-zinc-300 underline-offset-2 transition hover:text-neutral-700"
                >
                  {firstWord}
                </Link>
              </>
            ) : null}
          </div>
        )}

        <Link
          href={`/product/${slug}`}
          className="mt-1.5 text-base font-bold leading-snug text-neutral-900 sm:text-lg"
        >
          {title}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            <InfoIcon className="h-3.5 w-3.5" />
            Product
          </Link>
          {hasPrice ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#e07a7a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#d45c5c] sm:px-5"
              onClick={() => {
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
                router.push("/cart");
              }}
            >
              Add to
              <IconCartBag className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
