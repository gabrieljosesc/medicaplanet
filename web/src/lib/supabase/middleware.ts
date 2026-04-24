import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig, SUPABASE_PUBLIC_ENV_ERROR } from "./public-env";

export async function updateSession(request: NextRequest) {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    return new NextResponse(SUPABASE_PUBLIC_ENV_ERROR, {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    cfg.url,
    cfg.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            // Request cookies can only carry name+value; attributes are applied on the response.
            request.cookies.set({ name, value });
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              supabaseResponse.cookies.set(name, value, options);
            } else {
              supabaseResponse.cookies.set(name, value);
            }
          });
          const h = cacheHeaders ?? {};
          Object.entries(h).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    }
  );
  await supabase.auth.getUser();
  return supabaseResponse;
}
