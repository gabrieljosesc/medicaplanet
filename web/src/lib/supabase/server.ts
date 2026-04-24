import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig, SUPABASE_PUBLIC_ENV_ERROR } from "./public-env";

export async function createClient() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    throw new Error(SUPABASE_PUBLIC_ENV_ERROR);
  }
  const cookieStore = await cookies();
  return createServerClient(
    cfg.url,
    cfg.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Server Component */
          }
        },
      },
    }
  );
}
