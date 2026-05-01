"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type BestSellerItem = {
  slug: string;
  title: string;
  heroImageSrc: string;
  imageUnoptimized: boolean;
  basePrice: number;
  currency: string;
  compareAtPrice?: number | null;
};

/** Matches `w-[160px]` + `gap-3` in the flex row */
const CARD_STEP_PX = 160 + 12;

export function MobileBestSellersStrip({ products }: { products: BestSellerItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;
    const raw = Math.round(el.scrollLeft / CARD_STEP_PX);
    setActive(Math.min(products.length - 1, Math.max(0, raw)));
  }, [products.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    syncActive();
    el.addEventListener("scroll", syncActive, { passive: true });
    const ro = new ResizeObserver(() => syncActive());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncActive);
      ro.disconnect();
    };
  }, [syncActive]);

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * CARD_STEP_PX, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div
        ref={scrollRef}
        className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Best sellers"
      >
        <div className="flex w-max snap-x snap-mandatory gap-3">
          {products.map((p) => {
            const cur = (p.currency && p.currency.trim()) || "USD";
            const prefix = cur === "USD" ? "$" : `${cur} `;
            const amount = Math.round(Number(p.basePrice) || 0);
            const compareAt =
              p.compareAtPrice != null && Number.isFinite(p.compareAtPrice)
                ? Math.round(p.compareAtPrice)
                : null;
            return (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                className="w-[160px] shrink-0 snap-start rounded-2xl border border-filler-peach-200/90 bg-white p-2 shadow-sm"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-filler-cream">
                  <Image
                    src={p.heroImageSrc}
                    alt={p.title}
                    fill
                    className="object-contain"
                    sizes="160px"
                    unoptimized={p.imageUnoptimized}
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-filler-ink">
                  {p.title}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <p className="text-xs font-medium text-filler-rose-800 tabular-nums">
                    {prefix}
                    {amount}
                  </p>
                  {compareAt != null && compareAt > amount ? (
                    <p className="text-[10px] font-medium tabular-nums text-filler-ink/45 line-through">
                      {prefix}
                      {compareAt}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {products.length > 1 && (
        <div
          className="mt-2 flex flex-wrap items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Best sellers slides"
        >
          {products.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${p.title}`}
              onClick={() => goTo(i)}
              className={
                i === active
                  ? "h-1.5 w-4 rounded-full bg-filler-rose-700"
                  : "h-1.5 w-1.5 rounded-full bg-filler-peach-300 transition hover:bg-filler-peach-400"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
