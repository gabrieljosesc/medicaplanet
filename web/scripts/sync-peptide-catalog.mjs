/**
 * Sync peptides category from spreadsheet + manifest.csv + volume pricing.
 *
 * - Adds missing products, fixes titles, volume tiers, images (repo/images → public/images)
 * - Deactivates products listed for removal in the spreadsheet
 * - Writes peptides-slug-order.json (canonical catalog order)
 *
 * Run from web/:  npm run sync:peptide-catalog
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { resolveVolumeTiers } from "./build-peptide-volume-pricing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const repoRoot = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(webRoot, ".env.local") });

const MANIFEST_CSV = path.join(repoRoot, "manifest.csv");
const IMAGES_SRC = path.join(repoRoot, "images");
const IMAGES_DST = path.join(webRoot, "public", "images");
const VOLUME_JSON = path.join(webRoot, "data", "peptide-volume-pricing.json");
const SLUG_ORDER_OUT = path.join(webRoot, "src", "data", "peptides-slug-order.json");

/** Canonical catalog: slug, display title, optional local image basename, optional remote image URL. */
const PEPTIDE_CATALOG = [
  {
    slug: "glow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg",
    title: "Glow BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg",
    manifestName: "Glow BPC 157 10mg + GHK-CU 50mg + TB500 10mg",
    imageFile: "Glow_BPC_157_10mg_+_GHK-CU_50mg_+_TB500_10mg.png",
    imageUrl:
      "https://purechainresearch.com/wp-content/uploads/2026/01/GLOWGHK-CU-BPC-157-TB500.png",
  },
  {
    slug: "klow-bpc-157-10mg-ghk-cu-50mg-tb500-10mg-kpv-10mg",
    title: "Klow BPC-157 10mg + GHK-Cu 50mg + TB-500 10mg + KPV 10mg",
    imageFile: "Klow_BPC_157_10mg_+_GHK-CU_50mg_+_TB500_10mg_+_KPV_10mg.png",
    imageUrl:
      "https://purechainresearch.com/wp-content/uploads/2025/12/Klow-BPC-157-10mgGHK-CU-50mgTB500-10mgKPV-10mg.png",
  },
  {
    slug: "2x-blend-tesamorelin-10mg-ipamorelin-2mg",
    title: "2X Blend: Tesamorelin 10mg + Ipamorelin 2mg",
    imageFile: "Tesamorelin-10mg-Ipamorelin-2mg-12mg-Front.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Tesamorelin-2-300x300.png",
  },
  {
    slug: "aod-9604-5mg",
    title: "AOD-9604 5mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/AOD-9604.png",
  },
  {
    slug: "ara-290-14mg",
    title: "ARA-290 14mg",
    imageFile: "ARA-290_14mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/ARA-290.png",
  },
  {
    slug: "bpc-5mg-tb-5mg",
    title: "BPC 5mg + TB 5mg",
    imageFile: "BPC_5mg_+_TB_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/BPC-5mg-TB-5mg.png",
  },
  {
    slug: "bpc-157-10mg",
    title: "BPC-157 10mg",
    imageFile: "BPC-157_20mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/BPC-157.png",
  },
  {
    slug: "bpc-157-20mg",
    title: "BPC-157 20mg",
    imageFile: "BPC-157_20mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/BPC-157.png",
  },
  {
    slug: "cagrilintide-10mg",
    title: "Cagrilintide 10mg",
    imageFile: "Cagrilintide_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Cagrilintide.png",
  },
  {
    slug: "cagrilintide-5mg-semaglutide-5mg",
    title: "Cagrilintide 5mg + Semaglutide 5mg",
    imageFile: "Cagrilintide_5mg_+_Semaglutide_5mg.png",
    imageUrl:
      "https://purechainresearch.com/wp-content/uploads/2026/01/Cagrilintide-5mgSemaglutide-5mg.png",
  },
  {
    slug: "cjc-1295-with-dac-10mg",
    title: "CJC-1295 With DAC 10mg",
    imageFile: "CJC-1295_With_DAC_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/CJC-1295-With-DAC.png",
  },
  {
    slug: "cjc-1295-without-dac-5mg-ipa-5mg",
    title: "CJC-1295 without DAC 5mg + IPA 5mg",
    imageFile: "CJC-1295_without_DAC_5mg_+_IPA_5mg.png",
    imageUrl:
      "https://purechainresearch.com/wp-content/uploads/2025/12/CJC-1295-No-DAC-_-lpamorelin.png",
  },
  {
    slug: "dsip-5mg",
    title: "DSIP 5mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/DSIP.png",
  },
  {
    slug: "epithalon-10mg",
    title: "Epithalon 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Epithalon.png",
  },
  {
    slug: "ghk-cu-100mg",
    title: "GHK-Cu 100mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GHK-Cu.png",
  },
  {
    slug: "ghk-cu-50mg",
    title: "GHK-Cu 50mg",
    imageFile: "GHK-Cu_50mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GHK-Cu.png",
  },
  {
    slug: "hexarelin-5mg",
    title: "Hexarelin 5mg",
    imageFile: "Hexarelin_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Hexarelin.png",
  },
  {
    slug: "igf-1-lr3-1mg",
    title: "IGF-1 LR3 1mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/IGF-1-LR3.png",
  },
  {
    slug: "ipamorelin-10mg",
    title: "Ipamorelin 10mg",
    imageFile: "Ipamorelin.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Ipamorelin.png",
  },
  {
    slug: "kisspeptin-10",
    title: "Kisspeptin 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Kisspeptin-10.png",
  },
  {
    slug: "kpv-10mg",
    title: "KPV 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/KPV.png",
  },
  {
    slug: "melanotan-ii-10mg",
    title: "Melanotan II 10mg",
    imageFile: "Melanotan_II_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/MT-II-Melatonan-II.png",
  },
  {
    slug: "mots-c-10mg",
    title: "MOTS-c 10mg",
    imageFile: "MOTS-c_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/MOTs-C.png",
  },
  {
    slug: "nad-1000mg",
    title: "NAD⁺ 1000mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/NAD.png",
  },
  {
    slug: "oxytocin-10mg",
    title: "Oxytocin 10mg",
    imageFile: "Oxytocin_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Oxytocin-2.png",
  },
  {
    slug: "pe-22-28-10mg",
    title: "PE-22-28 10mg",
    imageFile: "PE-22-28_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/PE-22-28.png",
  },
  {
    slug: "pt-141-10mg",
    title: "PT-141 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/PT-141.png",
  },
  {
    slug: "retatrutide-5mg",
    title: "Retatrutide 5mg",
    imageFile: "Retatrutide_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Retatrutide.png",
  },
  {
    slug: "retatrutide-10mg",
    title: "Retatrutide 10mg",
    imageFile: "Retatrutide_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Retatrutide.png",
  },
  {
    slug: "retatrutide-20mg",
    title: "Retatrutide 20mg",
    imageFile: "Retatrutide_20mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-R.png",
  },
  {
    slug: "selank-10mg",
    title: "Selank 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Selank.png",
  },
  {
    slug: "semaglutide-5mg",
    title: "Semaglutide 5mg",
    imageFile: "Semaglutide_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png",
  },
  {
    slug: "semaglutide-10mg",
    title: "Semaglutide 10mg",
    imageFile: "Semaglutide_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png",
  },
  {
    slug: "semaglutide-20mg",
    title: "Semaglutide 20mg",
    imageFile: "Semaglutide_20mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-S.png",
  },
  {
    slug: "semax-30mg",
    title: "Semax 30mg",
    imageFile: "Semax_30mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Semax.png",
  },
  {
    slug: "sermorelin-10mg",
    title: "Sermorelin 10mg",
    imageFile: "Sermorelin_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Sermorelin.png",
  },
  {
    slug: "ss-31-10mg",
    title: "SS-31 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/SS-31.png",
  },
  {
    slug: "tb-500-10mg",
    title: "TB-500 10mg",
    imageFile: "TB-500_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Thymosin-Beta-4-B500.png",
  },
  {
    slug: "tesamorelin-10mg",
    title: "Tesamorelin 10mg",
    imageFile: "Tesamorelin_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Tesamorelin-2-300x300.png",
  },
  {
    slug: "tesofensine-500mcg",
    title: "Tesofensine 500mcg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Tesofensine.png",
  },
  {
    slug: "thymosin-alpha-1-10mg",
    title: "Thymosin Alpha-1 10mg",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/Thymosin-Alpha-1.png",
  },
  {
    slug: "tirzepatide-5mg",
    title: "Tirzepatide 5mg",
    imageFile: "Tirzepatide_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png",
  },
  {
    slug: "tirzepatide-10mg",
    title: "Tirzepatide 10mg",
    imageFile: "Tirzepatide_10mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png",
  },
  {
    slug: "tirzepatide-30mg",
    title: "Tirzepatide 30mg",
    imageFile: "Tirzepatide_30mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/GLP-1-T.png",
  },
  {
    slug: "wolverine-blend-bpc-157-10mg-tb500-10mg",
    title: "Wolverine Blend: BPC-157 10mg + TB-500 10mg",
    imageFile: "BPC_5mg_+_TB_5mg.png",
    imageUrl: "https://purechainresearch.com/wp-content/uploads/2025/12/BPC-5mg-TB-5mg.png",
  },
];

/** Legacy / removed SKUs — deactivated, not shown in catalog. */
const DEACTIVATE_SLUGS = new Set([
  "foxo4-dri",
  "l-glutathione",
  "ll37",
  "snap-8-10mg",
  "b7-33",
  "cardiogen",
  "cartalax",
  "chonluten",
  "curcumin",
  "hcg-5000iu",
  "hgh-10iu",
  "humanin-10mg",
  "mazdutide-10mg",
  "mgf-igf-1ec-5mg",
  "n-acetyl-epitalon-amidate",
  "survodutide-6mg",
  "cortagen",
  "livagen",
  "mt-ii-melanotan-ii-10mg",
  "mt-ii-melanotan-ii-10mg-1",
  "ovagen",
  "pancragen",
  "pinealon",
  "prostamax",
  "radiant-xo-serum",
  "testagen",
  "thymagen",
  "aod-9604-5-mg",
  "dsip-10mg",
  "kisspeptin-5mg",
  "cjc-1295-no-dac-10mg",
  "nad",
  "retatrutide",
  "tirzepatide",
  "cagrilintide-5mgsemaglutide-5mg",
  "klow-bpc-157-10mgghk-cu-50mgtb500-10mg-kpv-10mg",
  "igf-1-des",
  "thymosin-alpha-1-ta1-10mg",
]);

function parseManifestCsv() {
  if (!fs.existsSync(MANIFEST_CSV)) return new Map();
  const text = fs.readFileSync(MANIFEST_CSV, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(",");
  const nameIdx = header.indexOf("medica_name");
  const descIdx = header.indexOf("first_line_description");
  const fileIdx = header.indexOf("image_filename");
  const urlIdx = header.indexOf("image_url");
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[nameIdx]?.trim();
    if (!name) continue;
    map.set(name, {
      description: cols[descIdx]?.trim() || "",
      imageFile: cols[fileIdx]?.trim() || "",
      imageUrl: cols[urlIdx]?.trim() || "",
    });
  }
  return map;
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function defaultDescription(title) {
  return `${title} is a research-grade peptide supplied in lyophilized powder form for laboratory and investigational use.`;
}

function stripDescQuotes(s) {
  return String(s || "")
    .replace(/^"+|"+$/g, "")
    .trim();
}

function loadVolumeData() {
  if (fs.existsSync(VOLUME_JSON)) {
    return JSON.parse(fs.readFileSync(VOLUME_JSON, "utf8"));
  }
  return { tiersBySlug: {}, slugAliases: {} };
}

function copyLocalImage(slug, imageFile) {
  const dest = path.join(IMAGES_DST, `${slug}.png`);
  if (imageFile) {
    const src = path.join(IMAGES_SRC, imageFile);
    if (fs.existsSync(src)) {
      fs.mkdirSync(IMAGES_DST, { recursive: true });
      fs.copyFileSync(src, dest);
      return `/images/${slug}.png`;
    }
  }
  if (fs.existsSync(dest)) return `/images/${slug}.png`;
  return null;
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web/.env.local");
    process.exit(1);
  }

  const manifestByName = parseManifestCsv();
  const volume = loadVolumeData();
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: cat, error: catErr } = await supabase.from("categories").select("id").eq("slug", "peptides").single();
  if (catErr || !cat) {
    console.error("peptides category missing");
    process.exit(1);
  }
  const catId = cat.id;

  const slugOrder = [];
  const allowSlugs = new Set();

  for (const item of PEPTIDE_CATALOG) {
    const manifest =
      (item.manifestName && manifestByName.get(item.manifestName)) ||
      manifestByName.get(item.title.replace(/⁺/g, "+")) ||
      manifestByName.get(item.title);
    let description = stripDescQuotes(manifest?.description) || defaultDescription(item.title);
    const imageFile = item.imageFile || manifest?.imageFile || "";
    const imageUrl = item.imageUrl || manifest?.imageUrl || "";

    const tiers = resolveVolumeTiers(item.slug, volume, item.title);
    if (!tiers?.length) {
      console.warn("No volume tiers for", item.slug);
      continue;
    }

    const localPath = copyLocalImage(item.slug, imageFile);
    const productImageUrl = localPath || imageUrl || null;

    const payload = {
      slug: item.slug,
      title: item.title,
      description: description.slice(0, 20000),
      category_id: catId,
      sku: `PCH-${item.slug}`.slice(0, 64),
      variant_product_id: null,
      base_price: tiers[0].price,
      currency: "USD",
      price_tiers: tiers,
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
      console.error("upsert", item.slug, uErr?.message);
      process.exit(1);
    }

    await supabase.from("product_images").delete().eq("product_id", product.id);
    if (productImageUrl) {
      const { error: iErr } = await supabase.from("product_images").insert({
        product_id: product.id,
        url: productImageUrl,
        sort_order: 0,
      });
      if (iErr) {
        console.error("image", item.slug, iErr.message);
        process.exit(1);
      }
    } else {
      console.warn("No image URL for", item.slug);
    }

    slugOrder.push(item.slug);
    allowSlugs.add(item.slug);
    console.log("OK", item.slug, "$" + tiers[0].price, productImageUrl ? "img" : "no-img");
  }

  fs.mkdirSync(path.dirname(SLUG_ORDER_OUT), { recursive: true });
  fs.writeFileSync(SLUG_ORDER_OUT, JSON.stringify({ slugs: slugOrder }, null, 2) + "\n", "utf8");
  console.log("Wrote", path.relative(webRoot, SLUG_ORDER_OUT));

  const { data: allPeptides } = await supabase.from("products").select("id,slug").eq("category_id", catId);
  let deactivated = 0;
  for (const p of allPeptides ?? []) {
    if (allowSlugs.has(p.slug)) continue;
    await supabase.from("products").update({ is_active: false }).eq("id", p.id);
    deactivated += 1;
    if (DEACTIVATE_SLUGS.has(p.slug) || !allowSlugs.has(p.slug)) {
      console.log("OFF", p.slug);
    }
  }
  console.log("Active catalog:", allowSlugs.size, "Deactivated:", deactivated);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
