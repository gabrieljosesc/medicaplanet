/**
 * Optional: exact product `slug` values to show first in “Featured products” (home),
 * in this order, when they exist in the database. Remaining slots use `is_featured`
 * and catalog order. Copy slugs from Admin → Products or the product URL.
 *
 * Example: `["botox-100iu-12345", "xeomin-100u-1-vial-456"]`
 */
export const PINNED_FEATURED_SLUGS: string[] = [];

/** How many products appear in the FillerSupplies-style home grid. */
export const FEATURED_HOME_COUNT = 6;
