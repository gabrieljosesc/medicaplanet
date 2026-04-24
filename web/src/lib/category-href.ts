export function categoryHref(slug: string) {
  return slug === "peptides" ? "/peptides" : `/category/${slug}`;
}
