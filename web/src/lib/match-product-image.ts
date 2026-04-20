import { normalizeAssetKey } from "@/lib/image-keys";

/** `slugify(title)-variantId` → title part for loose image match */
export function slugKeyFromProductSlug(slug: string): string {
  return normalizeAssetKey(slug.replace(/-\d+$/, ""));
}

/**
 * Strip trailing gallery indices (-01 … -04) from asset basename, then normalize.
 * Uses two-digit suffixes (common in your library); up to 3 passes for …-ENGLISH-01.
 */
export function imageStemKeyFromBasename(basename: string): string {
  let s = basename.trim();
  for (let i = 0; i < 3; i++) {
    if (!/-\d{2}$/.test(s)) break;
    s = s.slice(0, -3);
  }
  return normalizeAssetKey(s);
}

export function basenameContainsVariantId(base: string, variantId: string): boolean {
  if (!/^\d+$/.test(variantId)) return false;
  const groups = base.match(/\d+/g);
  return groups?.includes(variantId) ?? false;
}

function tokenPrefixMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return false;
}

/** Normalize brochure-style `3x3mg` vs catalog `3x3ml` in a single token. */
function dosageTokenNorm(t: string): string {
  return t.replace(/(\d+x\d+)mg$/i, "$1ml").replace(/(\d+)mg$/i, "$1ml");
}

function tokensAlign(stemToken: string, slugToken: string): boolean {
  const s = dosageTokenNorm(stemToken);
  const k = dosageTokenNorm(slugToken);
  if (tokenPrefixMatch(s, k)) return true;
  if (k.length >= 4 && (s.includes(k) || k.includes(s))) return true;
  return false;
}

/**
 * Slug title tokens must match filename stem (strict): ≥75% of tokens, so e.g. `lumigan-1x3ml`
 * does not match only on the brand `lumigan` when strength differs (`3x3ml`).
 */
export function slugKeyMatchesStem(stemNorm: string, slugKeyNorm: string): boolean {
  if (!stemNorm || !slugKeyNorm) return false;
  if (stemNorm === slugKeyNorm) return true;
  if (stemNorm.includes(slugKeyNorm) || slugKeyNorm.includes(stemNorm)) return true;
  const st = stemNorm.split("-").filter((t) => t.length >= 2);
  const kt = slugKeyNorm.split("-").filter((t) => t.length >= 2);
  if (kt.length === 0) return false;
  let hits = 0;
  for (const k of kt) {
    const ok = st.some((s) => tokensAlign(s, k));
    if (ok) hits++;
  }
  const need = Math.max(1, Math.ceil(kt.length * 0.75));
  return hits >= need;
}

const MIN_FUZZY_SCORE = 72;

export function scoreImageStemAgainstSlug(
  stemNorm: string,
  slug: string,
  rawBasename: string
): number {
  const slugFullNorm = normalizeAssetKey(slug);
  const slugKey = slugKeyFromProductSlug(slug);
  const vid = slug.match(/-(\d+)$/)?.[1] ?? null;

  let score = 0;
  if (stemNorm === slugFullNorm) score = 100;
  else if (stemNorm === slugKey) score = 98;
  else if (stemNorm.includes(slugKey) || slugKey.includes(stemNorm)) score = 88;
  else if (slugKey.length >= 6 && stemNorm.length >= 6 && slugKeyMatchesStem(stemNorm, slugKey))
    score = MIN_FUZZY_SCORE;

  if (vid && basenameContainsVariantId(rawBasename, vid)) score += 25;
  return score;
}

export type ImageBasenameEntry = { rel: string; base: string };

/** Pick best public/images row for a product slug (reverse of upload). */
export function findBestImageRelForSlug(
  slug: string,
  entries: ImageBasenameEntry[]
): string | null {
  if (!slug) return null;
  const slugKey = slugKeyFromProductSlug(slug);
  if (slugKey.length < 4) return null;

  const vid = slug.match(/-(\d+)$/)?.[1] ?? null;
  let best: { rel: string; score: number; base: string } | null = null;
  for (const e of entries) {
    const stem = imageStemKeyFromBasename(e.base);
    if (stem.length < 4) continue;
    const s = scoreImageStemAgainstSlug(stem, slug, e.base);
    if (s < MIN_FUZZY_SCORE) continue;
    if (!best || s > best.score) {
      best = { rel: e.rel, score: s, base: e.base };
      continue;
    }
    if (s === best.score) {
      const bestHasVid = !!(vid && basenameContainsVariantId(best.base, vid));
      const newHasVid = !!(vid && basenameContainsVariantId(e.base, vid));
      if (newHasVid && !bestHasVid) best = { rel: e.rel, score: s, base: e.base };
      else if (newHasVid === bestHasVid && e.base.localeCompare(best.base) < 0)
        best = { rel: e.rel, score: s, base: e.base };
    }
  }
  return best?.rel ?? null;
}

export type ProductImageMatchRow = {
  slug: string;
  variant_product_id: number | null;
};

/** Pick best product for an image file (upload script). */
export function findBestProductSlugForImageBasename(
  base: string,
  products: ProductImageMatchRow[]
): string | null {
  const stem = imageStemKeyFromBasename(base);
  if (stem.length < 4) return null;

  const scored = products.map((p) => ({
    slug: p.slug,
    s: scoreImageStemAgainstSlug(stem, p.slug, base),
  }));
  scored.sort((a, b) => b.s - a.s);
  if (!scored.length || scored[0].s < MIN_FUZZY_SCORE) return null;

  const topS = scored[0].s;
  const top = scored.filter((x) => x.s === topS);
  if (top.length === 1) return top[0].slug;

  const vidHits = top.filter((t) => {
    const vid = t.slug.match(/-(\d+)$/)?.[1];
    return vid && basenameContainsVariantId(base, vid);
  });
  if (vidHits.length === 1) return vidHits[0].slug;
  if (vidHits.length > 1) return vidHits.sort((a, b) => a.slug.length - b.slug.length)[0].slug;

  return top.sort((a, b) => a.slug.length - b.slug.length)[0].slug;
}
