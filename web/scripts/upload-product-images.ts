/**
 * Match files in public/images/ to products (fuzzy stem vs slug title + optional variant id),
 * upload to Supabase bucket `product-images`, and upsert product_images (hero, sort_order 0).
 *
 * Run from web/: npm run upload:product-images
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { findBestProductSlugForImageBasename } from "../src/lib/match-product-image";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });
dotenv.config({ path: path.join(webRoot, ".env") });

const EXT = [".webp", ".jpg", ".jpeg", ".png", ".gif"];

function contentType(ext: string): string {
  const e = ext.toLowerCase();
  if (e === ".webp") return "image/webp";
  if (e === ".png") return "image/png";
  if (e === ".gif") return "image/gif";
  return "image/jpeg";
}

function listImageFiles(imagesDir: string) {
  if (!fs.existsSync(imagesDir)) return [];
  const out: { fullPath: string; name: string; base: string }[] = [];
  for (const name of fs.readdirSync(imagesDir)) {
    const ext = path.extname(name).toLowerCase();
    if (!EXT.includes(ext)) continue;
    const base = path.basename(name, ext);
    if (base === ".gitkeep" || base.startsWith(".")) continue;
    out.push({
      fullPath: path.join(imagesDir, name),
      name,
      base,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web/.env.local");
    process.exit(1);
  }

  const imagesDir = path.join(webRoot, "public", "images");
  const files = listImageFiles(imagesDir);
  if (!files.length) {
    console.log("No images in public/images — add JPG/WebP files first.");
    process.exit(0);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, variant_product_id");
  if (error) throw error;

  const rows = (products ?? []).map((p) => ({
    slug: p.slug as string,
    variant_product_id: p.variant_product_id as number | null,
  }));

  const heroAssigned = new Set<string>();
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = findBestProductSlugForImageBasename(file.base, rows);
    if (!slug) {
      console.warn("No product match:", file.name);
      skipped += 1;
      continue;
    }
    if (heroAssigned.has(slug)) {
      skipped += 1;
      continue;
    }

    const full = (products ?? []).find((p) => p.slug === slug);
    if (!full?.id) continue;

    const ext = path.extname(file.name);
    const storagePath = `${slug}/hero${ext}`;
    const body = fs.readFileSync(file.fullPath);

    const { error: upErr } = await supabase.storage.from("product-images").upload(storagePath, body, {
      contentType: contentType(ext),
      upsert: true,
    });
    if (upErr) {
      console.error("Upload failed", file.name, upErr.message);
      skipped += 1;
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(storagePath);

    const { data: existing } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", full.id)
      .eq("sort_order", 0)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("product_images").update({ url: publicUrl }).eq("id", existing.id);
    } else {
      await supabase.from("product_images").insert({
        product_id: full.id,
        url: publicUrl,
        sort_order: 0,
      });
    }

    heroAssigned.add(slug);
    console.log("OK", slug, "<-", file.name);
    uploaded += 1;
  }

  console.log(`Done. Uploaded/linked: ${uploaded}, skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
