import fs from "node:fs";
import path from "node:path";
import { normalizeAssetKey } from "@/lib/image-keys";
import {
  basenameContainsVariantId,
  findBestImageRelForSlug,
} from "@/lib/match-product-image";

const EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png", ".gif"] as const;

function imagesDir(): string {
  return path.join(process.cwd(), "public", "images");
}

type ImageEntry = { rel: string; base: string; norm: string };

let cachedList: ImageEntry[] | null = null;

/** Optional `data/product-image-overrides.json`: `{ "product-slug": "Exact-File-Name.jpg" }` */
let overrideBySlug: Map<string, string> | null = null;

function loadImageOverrides(): Map<string, string> {
  if (overrideBySlug) return overrideBySlug;
  overrideBySlug = new Map();
  const fp = path.join(process.cwd(), "data", "product-image-overrides.json");
  if (!fs.existsSync(fp)) return overrideBySlug;
  try {
    const raw = JSON.parse(fs.readFileSync(fp, "utf8")) as Record<string, string>;
    for (const [k, v] of Object.entries(raw)) {
      if (typeof k === "string" && typeof v === "string" && v.trim()) {
        overrideBySlug.set(k.trim(), v.trim());
      }
    }
  } catch {
    /* ignore invalid JSON */
  }
  return overrideBySlug;
}

function getImageFileList(): ImageEntry[] {
  if (cachedList) return cachedList;
  const dir = imagesDir();
  if (!fs.existsSync(dir)) {
    cachedList = [];
    return cachedList;
  }
  const out: ImageEntry[] = [];
  for (const name of fs.readdirSync(dir)) {
    const ext = path.extname(name).toLowerCase();
    if (!(EXTENSIONS as readonly string[]).includes(ext)) continue;
    const base = path.basename(name, ext);
    if (base === ".gitkeep" || base.startsWith(".")) continue;
    out.push({
      rel: `/images/${name}`,
      base,
      norm: normalizeAssetKey(base),
    });
  }
  cachedList = out.sort((a, b) => a.rel.localeCompare(b.rel));
  return cachedList;
}

/**
 * Public URL if `public/images/{slug}{ext}` exists, else same basename normalized as slug,
 * else variant id in filename, else fuzzy filename ↔ slug title match.
 */
export function getLocalProductImagePath(slug: string): string | null {
  if (!slug) return null;
  const dir = imagesDir();
  if (!fs.existsSync(dir)) return null;

  for (const ext of EXTENSIONS) {
    const file = path.join(dir, slug + ext);
    if (fs.existsSync(file)) return `/images/${slug}${ext}`;
  }

  const forced = loadImageOverrides().get(slug);
  if (forced) {
    const full = path.join(dir, forced);
    if (fs.existsSync(full)) return `/images/${forced}`;
  }

  const slugNorm = normalizeAssetKey(slug);
  const entries = getImageFileList();
  const normHits = entries.filter((e) => e.norm === slugNorm);
  if (normHits.length) return normHits[0].rel;

  const vid = slug.match(/-(\d+)$/)?.[1];
  if (vid) {
    const vidHits = entries.filter((e) => basenameContainsVariantId(e.base, vid));
    if (vidHits.length === 1) return vidHits[0].rel;
  }

  const fuzzy = findBestImageRelForSlug(slug, entries);
  if (fuzzy) return fuzzy;

  if (vid) {
    const vidHits = entries.filter((e) => basenameContainsVariantId(e.base, vid));
    if (vidHits.length) return vidHits[0].rel;
  }

  return null;
}
