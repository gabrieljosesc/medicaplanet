/** Full-width product grid: 3 columns (lg), 5 rows of 3 = 15 per page (FillerSupplies-style). */
export const CATALOG_PER_PAGE = 15;

/** Scroll target when catalog page query (`?page=`) changes (search toolbar + product grid). */
export const CATALOG_PRODUCTS_ANCHOR_ID = "catalog-products";

/** Display label in nav for the `other` category. */
export function categoryNavLabel(slug: string, dbName: string) {
  if (slug === "other") return "Others";
  return dbName;
}
