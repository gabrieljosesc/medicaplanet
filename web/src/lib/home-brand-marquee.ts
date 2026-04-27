/** Title patterns → brand row on the home marquee (counts from live catalog). */
export type HomeBrandMarqueeDef = {
  id: string;
  /** `?q=` for /shop */
  shopQuery: string;
  /** Short label shown next to logo if needed */
  displayName: string;
  logoSrc: string;
  titlePattern: RegExp;
  /** If false, hide the text line under the logo (wordmark is part of the logo asset). */
  showDisplayName?: boolean;
};

export const HOME_BRAND_MARQUEE_DEFS: HomeBrandMarqueeDef[] = [
  {
    id: "juvederm",
    shopQuery: "Juvederm",
    displayName: "Juvéderm",
    logoSrc: "/brands/juvederm.svg",
    titlePattern: /juvederm|juv[ée]derm/i,
    showDisplayName: false,
  },
  {
    id: "restylane",
    shopQuery: "Restylane",
    displayName: "Restylane",
    logoSrc: "/brands/restylane.svg",
    titlePattern: /restylane/i,
  },
  {
    id: "radiesse",
    shopQuery: "Radiesse",
    displayName: "Radiesse",
    logoSrc: "/brands/radiesse.svg",
    titlePattern: /radiesse/i,
  },
  {
    id: "filorga",
    shopQuery: "Filorga",
    displayName: "Filorga",
    logoSrc: "/brands/filorga.svg",
    titlePattern: /filorga/i,
  },
  {
    id: "teosyal",
    shopQuery: "Teosyal",
    displayName: "Teosyal",
    logoSrc: "/brands/teosyal.svg",
    titlePattern: /teosyal/i,
  },
  {
    id: "belotero",
    shopQuery: "Belotero",
    displayName: "Belotero",
    logoSrc: "/brands/belotero.svg",
    titlePattern: /belotero/i,
  },
  {
    id: "neauvia",
    shopQuery: "Neauvia",
    displayName: "Neauvia",
    logoSrc: "/brands/neauvia.svg",
    titlePattern: /neauvia/i,
  },
  {
    id: "sculptra",
    shopQuery: "Sculptra",
    displayName: "Sculptra",
    logoSrc: "/brands/sculptra.svg",
    titlePattern: /sculptra/i,
  },
];

export type HomeBrandMarqueeItem = {
  id: string;
  href: string;
  displayName: string;
  logoSrc: string;
  count: number;
  showDisplayName: boolean;
};

export type HomeBrandCountSource = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
};

export function buildHomeBrandMarqueeItems(
  products: HomeBrandCountSource[]
): HomeBrandMarqueeItem[] {
  const normalized = products.map((p) =>
    `${p.title ?? ""} ${p.slug ?? ""} ${p.description ?? ""}`.trim()
  );

  return HOME_BRAND_MARQUEE_DEFS.map((def) => ({
    id: def.id,
    href: `/shop?q=${encodeURIComponent(def.shopQuery)}`,
    displayName: def.displayName,
    logoSrc: def.logoSrc,
    count: normalized.reduce((n, text) => n + (def.titlePattern.test(text) ? 1 : 0), 0),
    showDisplayName: def.showDisplayName !== false,
  })).filter((x) => x.count > 0);
}
