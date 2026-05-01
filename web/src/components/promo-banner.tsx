import { PromoContactBubbles } from "@/components/promo-contact-bubbles";
import { createClient } from "@/lib/supabase/server";

const PROMO_LINE =
  "Wholesale Pricing for Licensed Professionals";

function sanitizePromoMessage(input: string): string {
  return input
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
    <div className="max-w-full border-b border-filler-pink-300/40 bg-gradient-to-r from-filler-peach-200/90 via-filler-pink-200/80 to-filler-peach-200/90 px-2 py-1 text-xs font-medium text-filler-ink/90 sm:px-4 sm:py-1.5">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center gap-2">
        <span className="w-[60px] shrink-0 sm:w-[62px]" aria-hidden />
        <p className="min-w-0 flex-1 overflow-x-hidden text-balance break-words text-center text-[11px] leading-snug sm:text-xs">
          {safeMessage}
        </p>
        <PromoContactBubbles />
      </div>
    </div>
  );
}
