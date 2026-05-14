import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";

/** Email-link verification: handle both PKCE (`code`) and legacy (`token_hash`+`type`). */
type OtpType = "signup" | "magiclink" | "recovery" | "invite" | "email_change" | "email";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as OtpType | null;
  const errorDescription = url.searchParams.get("error_description");
  const next = safeAuthRedirectTarget(url.searchParams.get("next")) ?? "/auth/login";
  const redirectUrl = new URL(next, url.origin);

  const verify = url.searchParams.get("verify");
  if (verify) redirectUrl.searchParams.set("verify", verify);

  if (errorDescription) {
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("error", errorDescription);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectUrl.pathname = "/auth/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", error.message);
    }
  } else if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      redirectUrl.pathname = "/auth/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("error", error.message);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
