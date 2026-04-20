/**
 * Report which local public/images file matches each product slug (same rules as the site),
 * and flag collisions where one image is the best match for multiple slugs.
 *
 * Run from web/: npm run audit:product-images
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getLocalProductImagePath } from "../src/lib/product-image-local";
import { imageStemKeyFromBasename, scoreImageStemAgainstSlug } from "../src/lib/match-product-image";
import { normalizeAssetKey } from "../src/lib/image-keys";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });
dotenv.config({ path: path.join(webRoot, ".env") });

const EXT = [".webp", ".jpg", ".jpeg", ".png", ".gif"];

type Entry = { rel: string; base: string; norm: string };

function listEntries(imagesDir: string): Entry[] {
  if (!fs.existsSync(imagesDir)) return [];
  const out: Entry[] = [];
  for (const name of fs.readdirSync(imagesDir)) {
    const ext = path.extname(name).toLowerCase();
    if (!EXT.includes(ext)) continue;
    const base = path.basename(name, ext);
    if (base === ".gitkeep" || base.startsWith(".")) continue;
    out.push({ rel: `/images/${name}`, base, norm: normalizeAssetKey(base) });
  }
  return out.sort((a, b) => a.rel.localeCompare(b.rel));
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon) in web/.env.local");
    process.exit(1);
  }

  process.chdir(webRoot);
  const imagesDir = path.join(webRoot, "public", "images");
  const entries = listEntries(imagesDir);
  console.log("Images on disk:", entries.length);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: products, error } = await supabase.from("products").select("slug, title").order("slug");
  if (error) throw error;

  const relToSlugs = new Map<string, string[]>();
  const rows: { slug: string; title: string; rel: string | null; score: number }[] = [];

  for (const p of products ?? []) {
    const slug = p.slug as string;
    const rel = getLocalProductImagePath(slug);
    let score = 0;
    if (rel) {
      const e = entries.find((x) => x.rel === rel);
      if (e) {
        const stem = imageStemKeyFromBasename(e.base);
        score = scoreImageStemAgainstSlug(stem, slug, e.base);
      } else score = 100;
    }
    rows.push({ slug, title: (p.title as string) ?? "", rel, score });
    if (rel) {
      const list = relToSlugs.get(rel) ?? [];
      list.push(slug);
      relToSlugs.set(rel, list);
    }
  }

  const collisions = [...relToSlugs.entries()].filter(([, slugs]) => slugs.length > 1);
  console.log("\n--- Collisions (same image matched for multiple slugs) ---");
  if (!collisions.length) console.log("None.");
  else {
    for (const [rel, slugs] of collisions.sort((a, b) => b[1].length - a[1].length)) {
      console.log(rel);
      for (const s of slugs) console.log("  ", s);
    }
  }

  console.log("\n--- Low fuzzy score (72 only — review manually) ---");
  for (const r of rows.filter((x) => x.rel && x.score === 72)) {
    console.log(r.score, r.slug, "=>", r.rel);
  }

  console.log("\n--- No local match ---");
  for (const r of rows.filter((x) => !x.rel)) {
    console.log(r.slug, "|", r.title.slice(0, 60));
  }

  console.log(`\nDone. Products: ${rows.length}, collisions: ${collisions.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
