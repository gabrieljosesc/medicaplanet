/**
 * Peptides: merge `Peptides description v2.docx` (repo root) with [Purechain Research Peptides](https://purechainresearch.com/product-category/peptides/)
 * prices + images (WooCommerce Store API, public, no key).
 *
 * - If the docx exists: only those products are imported, matched by title to Purechain for $ + image.
 * - If the docx is missing: all products in the Purechain Peptides category (~89) are imported with their descriptions from Purechain.
 *
 * Writes `web/src/data/peptides-slug-order.json` (display order) and deactivates other `peptides` category rows in Supabase.
 *
 * Optional: `web/data/purechain-peptides-overrides.json` — object keyed by Medica **slug** with `{ "price": number, "imageUrl": "https://..." }`
 * to fill list price and image when a docx line does not match the Purechain API (or image is missing).
 *
 * Optional: `web/data/peptide-wholesale-pricing.json` — `{ "prices": { slug: USD }, "slugAliases": { catalogSlug: priceTableSlug } }`.
 * When present, matched slugs overwrite list price after Purechain/API pricing (spreadsheet wholesale list).
 *
 * Run: npm run import:purechain-peptides  (from web/)
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import mammoth from "mammoth";
import path from "path";
import { fileURLToPath } from "url";
import { isRemovedProductSlug } from "./manual-product-removals.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const repoRoot = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });
dotenv.config({ path: path.join(webRoot, ".env") });

const PURECHAIN_STORE =
  "https://purechainresearch.com/wp-json/wc/store/v1/products?category=63&per_page=100&orderby=title&order=asc";
const PEPTIDES_DOCX = path.join(repoRoot, "Peptides description v2.docx");
const SLUG_ORDER_OUT = path.join(webRoot, "src", "data", "peptides-slug-order.json");
const OVERRIDES_PATH = path.join(webRoot, "data", "purechain-peptides-overrides.json");
const WHOLESALE_PRICE_PATH = path.join(webRoot, "data", "peptide-wholesale-pricing.json");
const VOLUME_PRICE_PATH = path.join(webRoot, "data", "peptide-volume-pricing.json");

function slugify(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/®|™/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function stripHtml(h) {
  if (!h) return "";
  return String(h)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normKey(s) {
  return s
    .toLowerCase()
    .replace(/[""'']/g, '"')
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function parsePeptidesDocx() {
  const buf = fs.readFileSync(PEPTIDES_DOCX);
  const { value } = await mammoth.extractRawText({ buffer: buf });
  const blocks = value
    .split(/\n{3,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const items = [];
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;
    const title = lines[0].replace(/\s*\([^)]*\)\s*$/, "").trim();
    const body = lines.slice(1).join("\n\n").trim();
    if (!title || title.length > 200) continue;
    items.push({ title, body: body || block });
  }
  return items;
}

function findStoreByTitle(want, store) {
  const a = normKey(want);
  for (const p of store) {
    if (normKey(p.name) === a) return p;
  }
  for (const p of store) {
    if (a && (normKey(p.name).includes(a) || a.includes(normKey(p.name)))) return p;
  }
  for (const p of store) {
    if (a.length > 4 && p.slug && a.includes(p.slug.replace(/-/g, ""))) return p;
  }
  return null;
}

async function findStoreBySearch(want) {
  const q = want.trim().slice(0, 60);
  if (q.length < 3) return null;
  const u = new URL("https://purechainresearch.com/wp-json/wc/store/v1/products");
  u.searchParams.set("search", q);
  u.searchParams.set("per_page", "20");
  const res = await fetch(u, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const list = await res.json();
  if (!Array.isArray(list) || !list.length) return null;
  return findStoreByTitle(want, list);
}

function storePriceDollars(p) {
  const u = p.prices?.currency_minor_unit ?? 2;
  return Number(p.prices?.price ?? 0) / 10 ** Number(u);
}

function pickImageUrl(p) {
  const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : null;
  if (!img) return null;
  return (img.thumbnail && String(img.thumbnail)) || (img.src && String(img.src)) || null;
}

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(OVERRIDES_PATH, "utf8"));
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k.startsWith("_")) continue;
      if (v && typeof v === "object" && (typeof v.price === "number" || typeof v.imageUrl === "string")) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function loadPeptideWholesalePricing() {
  if (!fs.existsSync(WHOLESALE_PRICE_PATH)) return { prices: {}, slugAliases: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(WHOLESALE_PRICE_PATH, "utf8"));
    return {
      prices: raw.prices && typeof raw.prices === "object" ? raw.prices : {},
      slugAliases: raw.slugAliases && typeof raw.slugAliases === "object" ? raw.slugAliases : {},
    };
  } catch {
    return { prices: {}, slugAliases: {} };
  }
}

function resolveWholesalePrice(slug, wholesale) {
  const viaAlias = wholesale.slugAliases?.[slug];
  const keysToTry = viaAlias ? [viaAlias, slug] : [slug];
  for (const k of keysToTry) {
    const p = wholesale.prices?.[k];
    if (typeof p === "number" && p >= 0) return p;
  }
  return null;
}

function loadPeptideVolumePricing() {
  if (!fs.existsSync(VOLUME_PRICE_PATH)) return { tiersBySlug: {}, slugAliases: {} };
  try {
    const raw = JSON.parse(fs.readFileSync(VOLUME_PRICE_PATH, "utf8"));
    return {
      tiersBySlug: raw.tiersBySlug && typeof raw.tiersBySlug === "object" ? raw.tiersBySlug : {},
      slugAliases: raw.slugAliases && typeof raw.slugAliases === "object" ? raw.slugAliases : {},
    };
  } catch {
    return { tiersBySlug: {}, slugAliases: {} };
  }
}

function resolveVolumeTiers(slug, volume, title) {
  const viaAlias = volume.slugAliases?.[slug];
  const keysToTry = viaAlias ? [viaAlias, slug] : [slug];
  for (const k of keysToTry) {
    const t = volume.tiersBySlug?.[k];
    if (Array.isArray(t) && t.length) return t;
  }
  if (title) {
    const nk = String(title).toLowerCase().replace(/[®™]/g, "").trim();
    const map = {
      tirzepatide: "tirzepatide-10mg",
      retatrutide: "retatrutide-10mg",
      semaglutide: "semaglutide-10mg",
    };
    const key = map[nk];
    if (key && volume.tiersBySlug?.[key]) return volume.tiersBySlug[key];
  }
  return null;
}

/** Fills $0 or missing image from overrides. List price for peptides can be set by `peptide-wholesale-pricing.json`. */
function applyOverrides(row, overrides) {
  const o = overrides[row.slug];
  if (!o) return;
  if (typeof o.price === "number" && o.price > 0 && (!row.price || row.price === 0)) {
    row.price = o.price;
  }
  if (typeof o.imageUrl === "string" && o.imageUrl.trim() && !row.imageUrl) {
    row.imageUrl = o.imageUrl.trim();
  }
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web/.env.local");
    process.exit(1);
  }
  const res = await fetch(PURECHAIN_STORE, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error("Failed to load Purechain Store API", res.status, await res.text().slice(0, 200));
    process.exit(1);
  }
  const store = await res.json();
  if (!Array.isArray(store) || !store.length) {
    console.error("No products from Purechain (category=63).");
    process.exit(1);
  }
  const overrides = loadOverrides();
  const wholesalePricing = loadPeptideWholesalePricing();
  const volumePricing = loadPeptideVolumePricing();

  /** @type {Array<{slug:string,title:string,description:string,price:number,imageUrl:string|null}>} */
  const rows = [];
  const seenSlugs = new Set();
  function uniqueSlug(base) {
    const b = base || "product";
    let s = b;
    let n = 0;
    while (seenSlugs.has(s)) {
      n += 1;
      s = `${b}-${n}`;
    }
    seenSlugs.add(s);
    return s;
  }

  let fromDocx = 0;
  if (fs.existsSync(PEPTIDES_DOCX)) {
    const docx = await parsePeptidesDocx();
    if (!docx.length) {
      console.error("Docx found but no peptide blocks could be parsed. Check format.");
      process.exit(1);
    }
    fromDocx = docx.length;
    const stillNeedManual = [];
    for (const item of docx) {
      let match = findStoreByTitle(item.title, store);
      if (!match) {
        match = await findStoreBySearch(item.title);
      }
      const baseSlug = match ? String(match.slug) : slugify(item.title);
      if (isRemovedProductSlug(baseSlug) || isRemovedProductSlug(slugify(item.title))) continue;
      const slug = uniqueSlug(baseSlug);
      const price = match ? storePriceDollars(match) : 0;
      const imageUrl = match ? pickImageUrl(match) : null;
      if (!item.body?.trim() && match?.description) {
        item.body = stripHtml(match.description).slice(0, 4000) || "Research use only.";
      }
      const row = {
        slug,
        title: item.title.trim().slice(0, 200),
        description: item.body.trim().slice(0, 20000) || "Research use only. Match Purechain for pricing and imagery when available.",
        price,
        imageUrl,
      };
      applyOverrides(row, overrides);
      const tiers = resolveVolumeTiers(row.slug, volumePricing, row.title);
      if (tiers?.length) {
        row.priceTiers = tiers;
        row.price = tiers[0].price;
      } else {
        const w = resolveWholesalePrice(row.slug, wholesalePricing);
        if (w != null) row.price = w;
      }
      if ((!row.price || row.price === 0) && !row.imageUrl) {
        stillNeedManual.push(item.title);
      }
      rows.push(row);
    }
    if (stillNeedManual.length) {
      console.warn(
        "Still $0 and no image — add to data/purechain-peptides-overrides.json:",
        stillNeedManual.length,
        stillNeedManual.slice(0, 8).join(" | ")
      );
    }
  } else {
    console.warn("Docx not found at", PEPTIDES_DOCX, "— importing all", store.length, "Peptides from Purechain Store API.");
    for (const p of store) {
      if (isRemovedProductSlug(p.slug)) continue;
      const desc = stripHtml(p.description || p.short_description || "");
      const row = {
        slug: p.slug,
        title: p.name.trim().slice(0, 200),
        description: desc.slice(0, 20000) || "Research use only.",
        price: storePriceDollars(p),
        imageUrl: pickImageUrl(p),
      };
      applyOverrides(row, overrides);
      const tiers = resolveVolumeTiers(row.slug, volumePricing, row.title);
      if (tiers?.length) {
        row.priceTiers = tiers;
        row.price = tiers[0].price;
      } else {
        const w = resolveWholesalePrice(row.slug, wholesalePricing);
        if (w != null) row.price = w;
      }
      rows.push(row);
    }
  }

  const slugOrder = rows.map((r) => r.slug);
  fs.mkdirSync(path.dirname(SLUG_ORDER_OUT), { recursive: true });
  fs.writeFileSync(SLUG_ORDER_OUT, JSON.stringify({ slugs: slugOrder }, null, 2) + "\n", "utf8");
  console.log("Wrote", path.relative(webRoot, SLUG_ORDER_OUT), "count:", slugOrder.length, fromDocx ? `(docx: ${fromDocx})` : "(full Purechain set)");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: cat, error: catErr } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "peptides")
    .single();
  if (catErr || !cat) {
    console.error("peptides category not found. Seed categories in Supabase first.");
    process.exit(1);
  }
  const catId = cat.id;
  const allowSlugs = new Set(slugOrder);

  for (const row of rows) {
    if (!row.slug) continue;
    const { slug, title, description, price, imageUrl, priceTiers } = row;
    if (!imageUrl) {
      console.warn("No image for", slug);
    }
    const payload = {
      slug,
      title,
      description: description,
      category_id: catId,
      sku: `PCH-${slug}`.slice(0, 64),
      variant_product_id: null,
      base_price: price,
      currency: "USD",
      price_tiers: Array.isArray(priceTiers) ? priceTiers : [],
      is_active: true,
      is_featured: false,
      rating: 4.5,
      review_count: 0,
    };
    const { data: product, error: uErr } = await supabase
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select("id")
      .single();
    if (uErr || !product) {
      console.error("upsert", slug, uErr?.message);
      process.exit(1);
    }
    await supabase.from("product_images").delete().eq("product_id", product.id);
    if (imageUrl) {
      const { error: iErr } = await supabase.from("product_images").insert({
        product_id: product.id,
        url: imageUrl,
        sort_order: 0,
      });
      if (iErr) {
        console.error("product_images", slug, iErr.message);
        process.exit(1);
      }
    }
    console.log("OK", slug, price > 0 ? "$" + price.toFixed(2) : "no local price (see warnings)");
  }

  const { data: peptideProds, error: listErr } = await supabase
    .from("products")
    .select("id,slug")
    .eq("category_id", catId);
  if (listErr) {
    console.error(listErr.message);
    process.exit(1);
  }
  let off = 0;
  for (const p of peptideProds || []) {
    if (allowSlugs.has(p.slug)) continue;
    await supabase.from("products").update({ is_active: false }).eq("id", p.id);
    off += 1;
  }
  console.log("Deactivated other peptide SKUs:", off, "Active:", allowSlugs.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
