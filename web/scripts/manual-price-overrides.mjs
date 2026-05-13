/**
 * Manual storefront price overrides applied by `npm run import:catalog` AFTER
 * the master + price-list values are computed, so re-imports never wipe them.
 *
 * Keyed by `variant_product_id` (most stable identifier in the catalog).
 *  - base: number ⇒ overrides base_price
 *  - tiers: [{ minQ, maxQ, price }] ⇒ overrides price_tiers (replace, do not merge)
 *  - tiers: [] ⇒ explicit "flat price, no volume tiers"
 *
 * Keep this file in sync with merchandising decisions; this is the source of
 * truth for prices that differ from the priceListExport.xlsx defaults.
 */
export const MANUAL_PRICE_OVERRIDES = {
  // Botox 100u (English / standard)
  81455: { base: 399, tiers: [
    { minQ: 1, maxQ: 10, price: 399 },
    { minQ: 11, maxQ: 1000, price: 389 },
  ] },
  // Botox 100u (Polish)
  88231: { base: 379, tiers: [
    { minQ: 1, maxQ: 10, price: 379 },
    { minQ: 11, maxQ: 1000, price: 369 },
  ] },
  // Botox 100u (Non-English)
  88240: { base: 379, tiers: [
    { minQ: 1, maxQ: 10, price: 379 },
    { minQ: 11, maxQ: 1000, price: 369 },
  ] },
  // Botox Cosmetic 100u
  88869: { base: 510, tiers: [
    { minQ: 1, maxQ: 10, price: 510 },
    { minQ: 11, maxQ: 1000, price: 495 },
  ] },
  // Dysport 500u 2 vials  (user-referenced as "Disport 500 up 2 vials")
  81901: { base: 999, tiers: [
    { minQ: 1, maxQ: 10, price: 999 },
    { minQ: 11, maxQ: 1000, price: 979 },
  ] },
  // Juvéderm Ultra Plus XC
  88832: { base: 479, tiers: [
    { minQ: 1, maxQ: 10, price: 479 },
    { minQ: 11, maxQ: 1000, price: 469 },
  ] },
  // Juvéderm Ultra XC  (user-referenced as "Juvederm plus xc")
  88830: { base: 479, tiers: [
    { minQ: 1, maxQ: 10, price: 479 },
    { minQ: 11, maxQ: 1000, price: 469 },
  ] },

  // Flat-price orthopedic / dermal items (no volume tiers).
  81521: { base: 90, tiers: [] },   // ORTHOVISC
  81525: { base: 340, tiers: [] },  // EUFLEXXA
  82276: { base: 280, tiers: [] },  // DUROLANE
  81507: { base: 525, tiers: [] },  // SCULPTRA 2 vials
};

/**
 * Apply override (if any) for a given variant_product_id to `{ base_price, price_tiers }`.
 * Mutates and returns the same object for ergonomic chaining.
 */
export function applyManualPriceOverride(rec, variantProductId) {
  const o = MANUAL_PRICE_OVERRIDES[variantProductId];
  if (!o) return rec;
  if (typeof o.base === "number") rec.base_price = o.base;
  if (Array.isArray(o.tiers)) rec.price_tiers = o.tiers;
  return rec;
}
