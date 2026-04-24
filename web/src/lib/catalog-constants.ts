/** Full-width product grid: 3 columns (lg), 5 rows of 3 = 15 per page (FillerSupplies-style). */
export const CATALOG_PER_PAGE = 15;

/** Display label in nav for the `other` category. */
export function categoryNavLabel(slug: string, dbName: string) {
  if (slug === "other") return "Others";
  return dbName;
}
