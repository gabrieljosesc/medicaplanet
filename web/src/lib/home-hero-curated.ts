import type { MonthlyHighlightSlide } from "@/lib/monthly-highlight-slides";
import homeHeroCuratedBySlug from "../../data/home-hero-curated-by-slug.json";

/** Set false to use catalog / Supabase images in “Monthly highlights” only. */
export const HOME_HERO_USE_CURATED = true as const;

const SLIDE = (n: 1 | 2 | 3 | 4 | 5 | 6) => `/images/hero-slides/slide-0${n}.png`;

export const HOME_HERO_ILLUSTRATION_SRC = "/images/hero-slides/hero-illustration.png";

type CuratedFile = { bySlug?: Record<string, string> };

const slugToImagePath: Map<string, string> = (() => {
  const m = new Map<string, string>();
  const bySlug = (homeHeroCuratedBySlug as CuratedFile).bySlug;
  if (bySlug && typeof bySlug === "object") {
    for (const [k, v] of Object.entries(bySlug)) {
      if (typeof v === "string" && v.startsWith("/")) {
        m.set(k.trim().toLowerCase(), v);
      }
    }
  }
  return m;
})();

/**
 * `slide-01` … `slide-06` files ↔ product (by title/slug heuristics):
 * 1 — Botox 100 (default / “English” art)
 * 2 — Aliaxin® EV
 * 3 — Aliaxin® GP
 * 4 — Aliaxin® FL / LIPS
 * 5 — Botox 100 (regional / non-English text on box, e.g. CZ)
 * 6 — Dysport 500
 */
function resolveCuratedPngByTitleAndSlug(
  title: string,
  slug: string
): string | null {
  const t = title;
  const s = slug.toLowerCase();
  const lower = t.toLowerCase();

  const isAliaxin = (): boolean =>
    /aliaxin|neauvia|neauviat/i.test(lower) ||
    s.includes("neauvia") ||
    s.includes("aliaxin");

  if (isAliaxin()) {
    if (
      /\bGP\b|®\s*GP|®\s*G\s*P|global\s*performance|aliaxin\s*®\s*GP|aliaxin\s*gp|ESSENTIAL.*\bGP\b/i.test(t) ||
      /-gp-|-gp$|organic.*-gp|intense-?gp|aliaxin-?®?-?gp|(^|-)gp($|-\d)/.test(s)
    ) {
      return SLIDE(3);
    }
    if (/\bfl\s*lips|aliaxin[^\n]*\blips|intense[-\s]lips|aliciaxin-?lips|\bfl[\s,]*\blips|FL\s*LIPS/i.test(t) || /lips-|-lips|intense-lips/.test(s)) {
      if (!/flux(?!a)|dysport/i.test(lower)) {
        return SLIDE(4);
      }
    }
    if (
      /\bEV\b|EV\s*ESSEN|essent(ial)?\s*vol|essent-?vol|aliaxin\s*®?\s*ev|aliaxin\s*ev|vol[\s,]*\bev/i.test(t) ||
      s.includes("ev-essential") ||
      s.includes("aliaxin-ev") ||
      s.includes("essential-volume")
    ) {
      return SLIDE(2);
    }
  }

  if (/dysport/i.test(t) && /500|speywood|jednot|500u/i.test(t + s)) {
    return SLIDE(6);
  }

  if (isBotoxRegionalOrNonEnglish(t, s) && /botox/i.test(t) && /100|allergan|jednot|vial|units|u\b|abbvie/i.test(t + s)) {
    return SLIDE(5);
  }

  if (/botox/i.test(t) && /(100|allergan|unit|u\b|jednot|botulin)/i.test(t) && !/dysport|xeomin|neauvia|aliaxin|neauv/i.test(t)) {
    return SLIDE(1);
  }

  if (/dysport/i.test(t) && /500|300|speywood/i.test(t + s)) {
    return SLIDE(6);
  }

  return null;
}

function isBotoxRegionalOrNonEnglish(title: string, sl: string): boolean {
  const x = (title + " " + sl).toLowerCase();
  if (/\[non-english\]|non[-\s]english|jednotek|pr[áa]šek|inječn|injekč|injek|lahvi|1\s*lahv|vial\)|abbvie(?!.*\bus\b)|[áčěňřšťúůýž]/.test(x) && /botox/i.test(title)) {
    return true;
  }
  if (/\b(czech|slovak|polish|turk|region)\b/.test(x) && /botox/.test(x)) {
    return true;
  }
  return false;
}

/**
 * 1) Optional `data/home-hero-curated-by-slug.json` → `bySlug[slug]` wins
 * 2) Title / slug heuristics so the PNG matches the on-screen product name
 * 3) Otherwise keep catalog `heroImageSrc` (no false pairing)
 */
export function applyCuratedHomeHeroSlides(
  fromCatalog: MonthlyHighlightSlide[]
): MonthlyHighlightSlide[] {
  if (!HOME_HERO_USE_CURATED) return fromCatalog;
  if (fromCatalog.length === 0) return [];

  return fromCatalog.map((slide) => {
    const k = slide.slug.trim().toLowerCase();
    const fromJson = slugToImagePath.get(k);
    const png = fromJson ?? resolveCuratedPngByTitleAndSlug(slide.title, slide.slug);
    if (png) {
      return { ...slide, heroImageSrc: png, imageUnoptimized: true };
    }
    return slide;
  });
}

export function isCuratedHomeHeroImageSrc(src: string): boolean {
  return src.startsWith("/images/hero-slides/slide-");
}
