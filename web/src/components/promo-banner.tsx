import { createClient } from "@/lib/supabase/server";

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
  if (!message) return null;
  return (
    <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      {message}
    </div>
  );
}
