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
    <div className="flex gap-0.5 text-amber-400" aria-label={`${r} of 5 stars`}>
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

/**
 * FillerSupplies-style row: image + blob, tags, title, stars, From price, Info + Add to cart.
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
  const priceLine =
    hasPrice && Number.isFinite(display) && display > 0
      ? `${tiers.length > 0 ? "From " : ""}${prefix}${Math.round(display)}`
      : "Request pricing";

  const { addLine } = useCart();
  const router = useRouter();
  const cat = categorySlug && categoryName ? { slug: categorySlug, name: categoryName } : null;
  const firstWord = title.trim().split(/\s+/)[0] ?? "";
  const showBrandTag =
    firstWord.length > 1 &&
    cat &&
    !cat.name.toLowerCase().includes(firstWord.toLowerCase().slice(0, 3));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-filler-peach-200/80 bg-white p-3 shadow-sm sm:flex-row sm:gap-4 sm:p-4">
      <div className="relative flex min-h-[11rem] w-full shrink-0 items-center justify-center sm:w-[42%] sm:max-w-[220px]">
        <div
          className="pointer-events-none absolute inset-0 -z-0 scale-105 rounded-[1.75rem] bg-gradient-to-br from-amber-50/90 via-filler-peach-200/50 to-filler-pink-200/50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-2 -left-1 h-24 w-24 rounded-full bg-filler-pink-300/35 blur-2xl"
          aria-hidden
        />
        <div className="relative h-48 w-full sm:h-52">
          <Link
            href={`/product/${slug}`}
            className="absolute inset-0 z-10 block p-2 sm:p-3"
            aria-label={title}
          >
            <Image
              src={heroImageSrc}
              alt={title}
              fill
              className="object-contain object-center drop-shadow-sm"
              sizes="(max-width: 640px) 90vw, 220px"
              unoptimized={imageUnoptimized}
            />
          </Link>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col text-filler-ink">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium sm:text-xs">
          {cat ? (
            <Link
              href={categoryHref(cat.slug)}
              className="text-filler-rose-800 underline decoration-filler-rose-600/50 underline-offset-2 hover:decoration-filler-rose-800"
            >
              {cat.name}
            </Link>
          ) : null}
          {showBrandTag ? (
            <>
              {cat ? <span className="text-filler-ink/35">·</span> : null}
              <Link
                href={`/search?q=${encodeURIComponent(firstWord)}`}
                className="text-filler-rose-800 underline decoration-filler-rose-600/50 underline-offset-2"
              >
                {firstWord}
              </Link>
            </>
          ) : null}
        </div>
        <Link
          href={`/product/${slug}`}
          className="mt-1.5 text-base font-bold leading-snug text-filler-ink hover:text-filler-rose-800"
        >
          {title}
        </Link>
        {reviewCount > 0 && rating > 0 ? (
          <div className="mt-2">
            <StarRow rating={rating} />
          </div>
        ) : null}
        <p className="mt-2 text-sm font-semibold text-filler-ink tabular-nums sm:text-base">
          {priceLine}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 sm:pt-3">
          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-filler-ink/15 bg-filler-cream/80 px-3 py-1.5 text-xs font-semibold text-filler-ink/90 transition hover:border-filler-ink/30 hover:bg-filler-peach-200/60"
          >
            <InfoIcon className="h-3.5 w-3.5" />
            Product
          </Link>
          {hasPrice ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-filler-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-filler-rose-700"
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
