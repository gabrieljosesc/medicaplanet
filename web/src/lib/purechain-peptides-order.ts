import orderJson from "@/data/peptides-slug-order.json";

const SLUGS: string[] = orderJson?.slugs?.length
  ? orderJson.slugs
  : /* fallback before first `npm run import:purechain-peptides` */
    [];

const rank = new Map(SLUGS.map((slug, i) => [slug, i]));

/** Default sort for /peptides (from `peptides-slug-order.json`, written by the import script). */
export function sortRowsLikePurechainPeptides<T extends { slug: string; title: string }>(rows: T[]): T[] {
  if (!SLUGS.length) {
    return [...rows].sort((a, b) => a.title.localeCompare(b.title));
  }
  return [...rows].sort((a, b) => {
    const ra = rank.get(a.slug) ?? 9000;
    const rb = rank.get(b.slug) ?? 9000;
    if (ra !== rb) return ra - rb;
    return a.title.localeCompare(b.title);
  });
}
