import { parsePriceTiersJson } from "@/lib/price-tiers";

export type MonthlyHighlightSlide = {
  slug: string;
  title: string;
  heroImageSrc: string;
  imageUnoptimized: boolean;
  displayPrice: number | null;
  showFrom: boolean;
  compareAt: number | undefined;
  currency: string;
};

/** Accepts best-seller merge output (inference-safe without fighting merge generics). */
export function buildMonthlyHighlightSlides(
  bestSellers: Array<{
    product: Record<string, unknown>;
    compareAtPrice?: number;
  }>
): MonthlyHighlightSlide[] {
  return bestSellers.map((row) => {
    const p = row.product;
    const slug = String(p.slug ?? "");
    const title = String(p.title ?? "");
    const heroImageSrc = String(p.heroImageSrc ?? "");
    const imageUnoptimized = Boolean(p.imageUnoptimized);
    const tiers = parsePriceTiersJson(p.price_tiers);
    const base = Number(p.base_price);
    const hasPrice = base > 0 || tiers.length > 0;
    const minPrice =
      tiers.length > 0
        ? Math.min(...tiers.map((t) => t.price), base > 0 ? base : Infinity)
        : base;
    const display = Number.isFinite(minPrice) && minPrice > 0 ? minPrice : base;
    const displayPrice =
      hasPrice && Number.isFinite(display) && display > 0 ? Math.round(display) : null;
    return {
      slug,
      title,
      heroImageSrc,
      imageUnoptimized,
      displayPrice,
      showFrom: tiers.length > 0,
      compareAt: row.compareAtPrice,
      currency: String(p.currency ?? "USD"),
    };
  });
}
