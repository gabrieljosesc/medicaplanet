/** Filler-supplies style top bar (secondary links). */
export const TOP_BAR_NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Products" },
  { href: "/peptides", label: "Peptides" },
  { href: "/about-us", label: "About us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact us" },
] as const;

/** Legacy: inline nav when mega menu is not used (e.g. mobile fallbacks). */
export const SITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/peptides", label: "Peptides" },
  { href: "/about-us", label: "About Us" },
  { href: "/blog", label: "Blog" },
] as const;

