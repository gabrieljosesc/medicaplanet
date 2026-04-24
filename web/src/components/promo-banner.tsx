import { createClient } from "@/lib/supabase/server";

const PROMO_LINE =
  "Wholesale Pricing for Licensed Professionals";

function sanitizePromoMessage(input: string): string {
  return input
    .replace(/\borthopaedics?\b/gi, "")
    .replace(/\borthopedics?\b/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
}

/** Replace long legacy default copy stored in `site_settings` with the current line. */
function normalizePromoText(raw: string): string {
  const t = raw.trim();
  if (
    t.toLowerCase().startsWith("licensed professionals:") &&
    t.length > 40 &&
    t.toLowerCase().includes("dermal fillers")
  ) {
    return PROMO_LINE;
  }
  return t;
}

export async function PromoBanner() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "promo_banner")
    .maybeSingle();
  const v = data?.value as { text?: string } | string | null | undefined;
  const message =
    v == null
      ? PROMO_LINE
      : typeof v === "string"
        ? v
        : typeof v === "object" && v && "text" in v && typeof v.text === "string"
          ? v.text
          : PROMO_LINE;
  const safeMessage = sanitizePromoMessage(normalizePromoText(message));
  if (!safeMessage) return null;
  return (
    <div className="max-w-full overflow-x-hidden border-b border-filler-pink-300/40 bg-gradient-to-r from-filler-peach-200/90 via-filler-pink-200/80 to-filler-peach-200/90 px-3 py-2.5 text-center text-sm font-medium text-filler-ink/90 sm:px-4">
      <p className="mx-auto max-w-6xl text-balance break-words">{safeMessage}</p>
    </div>
  );
}
