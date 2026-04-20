/**
 * Catalog import: Product Master File + priceListExport + Peptides docx (repo root)
 * Run from web/: npm run import:catalog
 * Loads web/.env.local so the same vars as Next.js (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });
dotenv.config({ path: path.join(webRoot, ".env") });

const root = path.resolve(__dirname, "..", "..");

const MASTER = path.join(root, "Product Master File V07 10.01.24.xlsx");
const PRICES = path.join(root, "priceListExport.xlsx");
const PEPTIDES_DOCX = path.join(root, "Peptides description v2.docx");

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

/** Normalized keys match Product Master File "Category" column (trimmed, lowercased). */
const MASTER_CATEGORY_SLUG = {
  anaesthetics: "anaesthetics",
  asthma: "asthma",
  "body sculpting": "body-sculpting",
  "botulinum toxins": "botulinum-toxins",
  "cannulas and needles": "cannulas-and-needles",
  "dermal filler removal": "dermal-filler-removal",
  "dermal fillers": "dermal-fillers",
  "eyelash enhancers": "eyelash-enhancers",
  "fat removal": "fat-removal",
  gynecology: "gynecology",
  mesotherapy: "mesotherapy",
  ophthalmology: "ophthalmology",
  "orthopedic injections": "orthopedic-injections",
  "orthopaedic injections": "orthopedic-injections",
  osteoporosis: "osteoporosis",
  "prp kits": "prp-kits",
  "peels and masks": "peels-and-masks",
  rheumatology: "rheumatology",
  skincare: "skincare",
  threads: "threads",
  "weight loss": "weight-loss",
};

const KNOWN_CATEGORY_SLUGS = new Set([
  ...Object.values(MASTER_CATEGORY_SLUG),
  "peptides",
  "other",
]);

function normCategoryKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mapCategorySlug(raw) {
  const key = normCategoryKey(raw);
  if (MASTER_CATEGORY_SLUG[key]) return MASTER_CATEGORY_SLUG[key];
  const fromSlug = slugify(raw);
  if (KNOWN_CATEGORY_SLUGS.has(fromSlug)) return fromSlug;
  return "other";
}

/** XLSX often returns prices as strings like "245.00" — normalize to number */
function toMoney(val) {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val.replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

/**
 * Price list rows under each variant ID: col D = qty min, E = qty max, F = price, G = currency.
 * Storefront base_price = **entry tier** (smallest quantity minimum), not the cheapest bulk tier.
 */
function parsePriceTiers() {
  const wb = XLSX.readFile(PRICES);
  const sheet = wb.Sheets["Sheet1"];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const headerRow = 4;
  const colQtyMin = 3;
  const colQtyMax = 4;
  const colPrice = 5;
  const colCurrency = 6;
  /** @type {Map<number, { tiers: { minQ: number; maxQ: number; price: number }[]; currency: string }>} */
  const prices = new Map();
  let currentId = null;
  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const id = row[0];
    if (typeof id === "number") {
      currentId = id;
      if (!prices.has(currentId)) prices.set(currentId, { tiers: [], currency: "USD" });
    }
    if (currentId == null) continue;
    const entry = prices.get(currentId);
    const p = toMoney(row[colPrice]);
    const minQ = row[colQtyMin];
    const maxQ = row[colQtyMax];
    const cur = row[colCurrency];
    if (typeof cur === "string" && cur.trim()) entry.currency = cur.trim();
    if (Number.isNaN(p)) continue;
    if (
      typeof minQ === "number" &&
      Number.isFinite(minQ) &&
      typeof maxQ === "number" &&
      Number.isFinite(maxQ)
    ) {
      entry.tiers.push({ minQ, maxQ, price: p });
    }
  }
  const out = new Map();
  for (const [id, { tiers, currency }] of prices) {
    if (!tiers.length) continue;
    const sorted = [...tiers].sort((a, b) => a.minQ - b.minQ || a.maxQ - b.maxQ);
    const entryTier = sorted[0];
    out.set(id, {
      base: entryTier.price,
      currency: currency || "USD",
      tiers: sorted,
    });
  }
  return out;
}

function loadMasterRows() {
  const wb = XLSX.readFile(MASTER);
  const name = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "" });
  const hdr = rows[1];
  const idx = (h) => hdr.indexOf(h);
  const I = {
    variantId: idx("Variant Product ID"),
    name: idx("Product Name"),
    brand: idx("Brand"),
    type: idx("Type"),
    category: idx("Category"),
    description: idx("Description"),
  };
  const out = [];
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    const vid = row[I.variantId];
    if (typeof vid !== "number") continue;
    out.push({
      variantProductId: vid,
      title: String(row[I.name] || "").trim(),
      brand: String(row[I.brand] || "").trim(),
      type: String(row[I.type] || "").trim(),
      category: String(row[I.category] || "").trim(),
      description: String(row[I.description] || "").trim(),
    });
  }
  return out;
}

async function parsePeptidesDocx() {
  const buf = fs.readFileSync(PEPTIDES_DOCX);
  const { value } = await mammoth.extractRawText({ buffer: buf });
  const blocks = value.split(/\n{3,}/).map((b) => b.trim()).filter(Boolean);
  const items = [];
  for (const block of blocks) {
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const title = lines[0].replace(/\s*\([^)]*\)\s*$/, "").trim();
    const body = lines.slice(1).join("\n\n").trim();
    if (!title || title.length > 120) continue;
    items.push({ title, body: body || block });
  }
  return items;
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing Supabase env. In web/.env.local set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Plain `node` does not read .env files unless this script loads them — ensure web/.env.local exists next to package.json."
    );
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr) throw catErr;
  const catIdBySlug = Object.fromEntries((cats || []).map((c) => [c.slug, c.id]));

  const priceMap = parsePriceTiers();
  console.log("Price list: variant IDs with tiers =", priceMap.size);
  const master = loadMasterRows();
  const peptides = await parsePeptidesDocx();

  const products = [];
  const usedSlugs = new Set();

  for (const row of master) {
    const tier = priceMap.get(row.variantProductId);
    const price = tier?.base ?? 0;
    const slugBase = slugify(row.title) + "-" + row.variantProductId;
    let slug = slugBase;
    let n = 0;
    while (usedSlugs.has(slug)) {
      n += 1;
      slug = `${slugBase}-${n}`;
    }
    usedSlugs.add(slug);
    const catSlug = mapCategorySlug(row.category);
    products.push({
      slug,
      title: row.title,
      description: row.description || null,
      category_id: catIdBySlug[catSlug] || catIdBySlug.other,
      sku: `VAR-${row.variantProductId}`,
      variant_product_id: row.variantProductId,
      base_price: price,
      currency: tier?.currency || "USD",
      price_tiers: tier?.tiers ?? [],
      // Always list catalog items; storefront shows "Request pricing" when base_price is 0
      is_active: true,
      is_featured: false,
      rating: 4.5,
      review_count: 0,
    });
  }

  for (const p of peptides) {
    const slugBase = slugify(p.title);
    let slug = slugBase || slugify(p.title.slice(0, 20));
    let n = 0;
    while (usedSlugs.has(slug)) {
      n += 1;
      slug = `${slugBase}-${n}`;
    }
    usedSlugs.add(slug);
    products.push({
      slug,
      title: p.title,
      description: p.body,
      category_id: catIdBySlug.peptides,
      sku: `PEP-${slug}`,
      variant_product_id: null,
      base_price: 0,
      currency: "USD",
      price_tiers: [],
      is_active: true,
      is_featured: false,
      rating: 4.5,
      review_count: 0,
    });
  }

  const batch = 150;
  for (let i = 0; i < products.length; i += batch) {
    const chunk = products.slice(i, i + batch);
    const { error } = await supabase.from("products").upsert(chunk, {
      onConflict: "slug",
    });
    if (error) {
      console.error("Batch upsert error at", i, error.message);
      for (const row of chunk) {
        const { error: e3 } = await supabase.from("products").upsert(row, {
          onConflict: "slug",
        });
        if (e3) console.error("Row fail", row.slug, e3.message);
      }
    }
  }

  console.log(
    "Done. Master rows:",
    master.length,
    "peptides:",
    peptides.length,
    "total payloads:",
    products.length
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
