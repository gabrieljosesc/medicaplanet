import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig, SUPABASE_PUBLIC_ENV_ERROR } from "./public-env";

export function createClient() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    throw new Error(SUPABASE_PUBLIC_ENV_ERROR);
  }
  return createBrowserClient(cfg.url, cfg.anonKey);
}
