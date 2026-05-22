/**
 * Build `web/data/peptide-volume-pricing.json` from Peptide Volume pricing.xlsx
 * and apply tiers to Supabase peptide products.
 *
 * Usage:
 *   node scripts/build-peptide-volume-pricing.mjs [path-to-xlsx]
 *   npm run import:peptide-volume-pricing
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });

const OUT_JSON = path.join(webRoot, "data", "peptide-volume-pricing.json");
const WHOLESALE_JSON = path.join(webRoot, "data", "peptide-wholesale-pricing.json");
const DEFAULT_XLSX = fs.existsSync(path.join(webRoot, "data", "peptide-volume-pricing.xlsx"))
  ? path.join(webRoot, "data", "peptide-volume-pricing.xlsx")
  : path.join(process.env.USERPROFILE || process.env.HOME || "", "Downloads", "Peptide Volume pricing.xlsx");

/** Excel peptide name → canonical price-table slug (from wholesale list). */
const NAME_TO_SLUG = {
  '"Glow" BPC 157 10mg+GHK-CU 50mg+TB500 10mg': "glow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg",
  '"Klow" BPC 157 10mg+GHK-CU 50mg+TB500 10mg+ KPV 10mg':
    "klow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg-kpv-10mg",
  "2X Blend: Tesamorelin (10mg)+Ipamorelin (2mg)": "2x-blend-tesamorelin-10mg-ipamorelin-2mg",
  "AOD-9604 5mg": "aod-9604-5mg",
  "ARA-290 14mg": "ara-290-14mg",
  "BPC 5mg + TB 5mg ": "bpc-5mg-tb-5mg",
  "BPC-157 10mg": "bpc-157-10mg",
  "BPC-157 20mg- pricing compared to 10 mg doesnt make sense": "bpc-157-20mg",
  "Cagrilintide 10mg": "cagrilintide-10mg",
  "Cagrilintide 5mg+Semaglutide 5mg": "cagrilintide-5mg-semaglutide-5mg",
  "CJC-1295 - With DAC 10mg": "cjc-1295-with-dac-10mg",
  "CJC-1295 without DAC 5mg + IPA 5mg": "cjc-1295-without-dac-5mg-ipa-5mg",
  "DSIP 5mg": "dsip-5mg",
  "Epithalon 10mg": "epithalon-10mg",
  "GHK-Cu 100mg": "ghk-cu-100mg",
  "GHK-Cu 50mg": "ghk-cu-50mg",
  "Hexarelin 5mg": "hexarelin-5mg",
  "IGF-1 LR3 1mg": "igf-1-lr3-1mg",
  "Ipamorelin 10mg": "ipamorelin-10mg",
  "Kisspeptin-10": "kisspeptin-10",
  "KPV 10mg": "kpv-10mg",
  "Melanotan II 10mg": "melanotan-ii-10mg",
  "MOTS-c 10mg": "mots-c-10mg",
  "NAD⁺ 1000mg": "nad-1000mg",
  "Oxytocin 10mg": "oxytocin-10mg",
  "PE-22-28 10mg": "pe-22-28-10mg",
  "PT-141 10mg": "pt-141-10mg",
  "Retatrutide 10mg": "retatrutide-10mg",
  "Retatrutide 20mg": "retatrutide-20mg",
  "Retatrutide 5mg": "retatrutide-5mg",
  "Selank 10mg": "selank-10mg",
  "Semaglutide 10mg": "semaglutide-10mg",
  "Semaglutide 20mg": "semaglutide-20mg",
  "Semaglutide 5mg": "semaglutide-5mg",
  "Semax 30mg": "semax-30mg",
  "Sermorelin 10mg": "sermorelin-10mg",
  "SS-31 10mg": "ss-31-10mg",
  "TB-500 10mg": "tb-500-10mg",
  "Tesamorelin 10mg": "tesamorelin-10mg",
  "Tesofensine 500mcg": "tesofensine-500mcg",
  "Thymosin Alpha-1 10mg": "thymosin-alpha-1-10mg",
  "Tirzepatide 10mg": "tirzepatide-10mg",
  "Tirzepatide 30mg": "tirzepatide-30mg",
  "Tirzepatide 5mg": "tirzepatide-5mg",
  "Wolverine Blend: BPC-157 (10mg)+TB500 (10mg)": "wolverine-blend-bpc-157-10mg-tb500-10mg",
};

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

function cleanExcelName(name) {
  return String(name || "")
    .trim()
    .replace(/\s*-\s*pricing compared.*$/i, "")
    .trim();
}

function tiersFromRow(row) {
  const p1 = Number(row["Price 1-5"]);
  const p2 = Number(row["Price 6-10"]);
  const p3 = Number(row["Price 11-25"]);
  const p4 = Number(row["Price 26-1000"]);
  if (![p1, p2, p3, p4].every((n) => Number.isFinite(n) && n > 0)) return null;
  return [
    { minQ: 1, maxQ: 5, price: p1 },
    { minQ: 6, maxQ: 10, price: p2 },
    { minQ: 11, maxQ: 25, price: p3 },
    { minQ: 26, maxQ: 1000, price: p4 },
  ];
}

/** MedicaPlanet catalog slug → volume sheet slug (merged with wholesale aliases). */
const CATALOG_SLUG_ALIASES = {
  "aod-9604-5-mg": "aod-9604-5mg",
  "cjc-1295-no-dac-10mg": "cjc-1295-without-dac-5mg-ipa-5mg",
  "dsip-10mg": "dsip-5mg",
  "kisspeptin-5mg": "kisspeptin-10",
  "kisspeptin-10mg": "kisspeptin-10",
  "mt-ii-melanotan-ii-10mg": "melanotan-ii-10mg",
  "mt-ii-melanotan-ii-10mg-1": "melanotan-ii-10mg",
  "thymosin-alpha-1-ta1-10mg": "thymosin-alpha-1-10mg",
  "cagrilintide-5mgsemaglutide-5mg": "cagrilintide-5mg-semaglutide-5mg",
  "klow-bpc-157-10mgghk-cu-50mgtb500-10mg-kpv-10mg":
    "klow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg-kpv-10mg",
  nad: "nad-1000mg",
  retatrutide: "retatrutide-10mg",
  "igf-1-des": "igf-1-lr3-1mg",
  tirzepatide: "tirzepatide-10mg",
};

/** Product title (normalized) → volume sheet slug when slug alias is insufficient. */
const TITLE_TO_SLUG = {
  tirzepatide: "tirzepatide-10mg",
  retatrutide: "retatrutide-10mg",
  semaglutide: "semaglutide-10mg",
  "melanotan i": "melanotan-ii-10mg",
  "melanotan ii": "melanotan-ii-10mg",
};

function normTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadWholesaleAliases() {
  if (!fs.existsSync(WHOLESALE_JSON)) return { slugAliases: {} };
  const raw = JSON.parse(fs.readFileSync(WHOLESALE_JSON, "utf8"));
  const wholesale = raw.slugAliases && typeof raw.slugAliases === "object" ? raw.slugAliases : {};
  return { slugAliases: { ...wholesale, ...CATALOG_SLUG_ALIASES } };
}

function parseXlsx(xlsxPath) {
  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

export function buildVolumePricingFromRows(rows) {
  const tiersBySlug = {};
  const unmatched = [];

  for (const row of rows) {
    const rawName = row["Peptide Name"];
    if (!rawName || String(rawName).toLowerCase().includes("peptide name")) continue;

    const name = cleanExcelName(rawName);
    let slug = NAME_TO_SLUG[rawName] ?? NAME_TO_SLUG[name];
    if (!slug) slug = slugify(name);

    const tiers = tiersFromRow(row);
    if (!tiers) {
      unmatched.push(rawName);
      continue;
    }
    tiersBySlug[slug] = tiers;
  }

  const { slugAliases } = loadWholesaleAliases();
  return { tiersBySlug, slugAliases, unmatched };
}

export function resolveVolumeTiers(slug, data, title) {
  const viaAlias = data.slugAliases?.[slug];
  const keys = viaAlias ? [viaAlias, slug] : [slug];
  for (const k of keys) {
    const t = data.tiersBySlug?.[k];
    if (Array.isArray(t) && t.length) return t;
  }
  const viaTitle = TITLE_TO_SLUG[normTitle(title)];
  if (viaTitle && data.tiersBySlug?.[viaTitle]) return data.tiersBySlug[viaTitle];
  return null;
}

async function applyToSupabase(data) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Skip Supabase update (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: cat } = await supabase.from("categories").select("id").eq("slug", "peptides").single();
  if (!cat?.id) {
    console.error("peptides category not found");
    process.exit(1);
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, title, base_price, price_tiers")
    .eq("category_id", cat.id)
    .eq("is_active", true);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const p of products ?? []) {
    const tiers = resolveVolumeTiers(p.slug, data, p.title);
    if (!tiers) {
      skipped += 1;
      continue;
    }
    const base_price = tiers[0].price;
    const { error: uErr } = await supabase
      .from("products")
      .update({ base_price, price_tiers: tiers })
      .eq("id", p.id);
    if (uErr) {
      console.error("update", p.slug, uErr.message);
      process.exit(1);
    }
    console.log("OK", p.slug, "base", base_price, "tiers", tiers.length);
    updated += 1;
  }

  console.log(`Updated ${updated} peptide products; ${skipped} without volume sheet match.`);
}

async function main() {
  const applyJsonOnly = process.argv.includes("--apply-json");

  if (applyJsonOnly) {
    if (!fs.existsSync(OUT_JSON)) {
      console.error("Missing", OUT_JSON);
      process.exit(1);
    }
    const out = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
    await applyToSupabase(out);
    return;
  }

  const xlsxPath = process.argv.find((a) => a.endsWith(".xlsx")) || DEFAULT_XLSX;
  if (!fs.existsSync(xlsxPath)) {
    console.error("XLSX not found:", xlsxPath);
    console.error("Usage: npm run import:peptide-volume-pricing [-- path/to/file.xlsx]");
    console.error("       node scripts/build-peptide-volume-pricing.mjs --apply-json");
    process.exit(1);
  }

  const rows = parseXlsx(xlsxPath);
  const built = buildVolumePricingFromRows(rows);

  const out = {
    _readme:
      "Volume tiers for peptides (qty 1–5, 6–10, 11–25, 26–1000). Regenerate from spreadsheet via npm run import:peptide-volume-pricing.",
    tiersBySlug: built.tiersBySlug,
    slugAliases: built.slugAliases,
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("Wrote", path.relative(webRoot, OUT_JSON), "slugs:", Object.keys(built.tiersBySlug).length);

  if (built.unmatched.length) {
    console.warn("Skipped rows:", built.unmatched.join(" | "));
  }

  await applyToSupabase(out);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
