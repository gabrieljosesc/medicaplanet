import { createClient } from "@/lib/supabase/server";

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
      ? "Licensed professionals: contact us for wholesale pricing and cold-chain shipping options."
      : typeof v === "string"
        ? v
        : typeof v === "object" && v && "text" in v && typeof v.text === "string"
          ? v.text
          : "Licensed professionals: contact us for wholesale pricing and cold-chain shipping options.";
  const safeMessage = sanitizePromoMessage(message);
  if (!safeMessage) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      {safeMessage}
    </div>
  );
}
