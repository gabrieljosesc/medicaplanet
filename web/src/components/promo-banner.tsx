import { createClient } from "@/lib/supabase/server";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site-constants";

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
    <div className="max-w-full overflow-x-hidden border-b border-filler-pink-300/40 bg-gradient-to-r from-filler-peach-200/90 via-filler-pink-200/80 to-filler-peach-200/90 px-2 py-2.5 text-sm font-medium text-filler-ink/90 sm:px-4">
      <div className="mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-balance break-words text-center text-xs leading-snug sm:text-sm">
          {safeMessage}
        </p>
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5">
          <a
            href={SITE_PHONE_TEL}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-filler-pink-400/50 bg-white/80 text-filler-ink shadow-sm transition hover:bg-white hover:shadow"
            aria-label={`Call ${SITE_PHONE_DISPLAY}`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-filler-pink-400/50 bg-white/80 text-filler-ink shadow-sm transition hover:bg-white hover:shadow"
            aria-label={`Email ${SITE_EMAIL}`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
