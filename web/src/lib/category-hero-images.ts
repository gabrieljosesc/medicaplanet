/**
 * Topic-matched Unsplash hero crops for category tiles (Unsplash License).
 * Fallback when slug not listed: clinical teamwork stock image.
 */
const DEFAULT =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=82";

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=82`;

/** Curated IDs — medical, aesthetic, lab, pharmacy where relevant. */
const BY_SLUG: Record<string, string> = {
  rheumatology: U("1584982751601-97aae096518e"),
  ophthalmology: U("1579684385127-1ef15d508118"),
  skincare: U("1556228578-8c89e565adf7"),
  "peels-and-masks": U("1570172619643-d9fc15271326"),
  "dermal-fillers": U("1612349317150-e413a6a2e38f"),
  "botulinum-toxins": U("1612349317150-e413a6a2e38f"),
  gynecology: U("1576091160399-112ba8d25d1d"),
  "body-sculpting": U("1571019613454-1cb2f99b2d8b"),
  osteoporosis: U("1587854692152-cbe660dbde88"),
  "fat-removal": U("1519494026892-80bbd2d6fd0d"),
  mesotherapy: U("1570172619643-d9fc15271326"),
  "orthopedic-injections": U("1576091160399-112ba8d25d1d"),
  "dermal-filler-removal": U("1584308666744-24d5c474e2ae"),
  anaesthetics: U("1576091160399-112ba8d25d1d"),
  "weight-loss": U("1559757148-5c350d0d3c56"),
  "cannulas-and-needles": U("1584308666744-24d5c474e2ae"),
  asthma: U("1579684385127-1ef15d508118"),
  threads: U("1612349317150-e413a6a2e38f"),
  "eyelash-enhancers": U("1556228578-8c89e565adf7"),
  "prp-kits": U("1532187863486-abf9dbad1b69"),
  peptides: U("1532187863486-abf9dbad1b69"),
  other: U("1582719471384-894fbb16e074"),
};

export function categoryHeroImageUrl(slug: string): string {
  const key = slug.trim().toLowerCase();
  return BY_SLUG[key] ?? DEFAULT;
}
