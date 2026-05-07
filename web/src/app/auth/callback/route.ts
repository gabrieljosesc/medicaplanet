import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthRedirectTarget(url.searchParams.get("next")) ?? "/auth/login";
  const redirectUrl = new URL(next, url.origin);

  const verify = url.searchParams.get("verify");
  if (verify) redirectUrl.searchParams.set("verify", verify);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectUrl.pathname = "/auth/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", error.message);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
