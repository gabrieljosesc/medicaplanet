"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";
import {
  flattenZodErrors,
  registrationSchema,
} from "@/app/auth/register/registration-schema";

async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;

  const rawBase =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return rawBase.replace(/\/+$/, "");
}

async function getAuthEmailRedirectTo(
  next: string,
  extraParams?: Record<string, string>
): Promise<string> {
  const origin = await getRequestOrigin();
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", next);
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "");
  const next = safeAuthRedirectTarget(nextRaw);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const q = new URLSearchParams({ error: error.message });
    if (/email not confirmed/i.test(error.message)) {
      q.set("unverified", "1");
      if (email) q.set("email", email);
    }
    if (next) q.set("next", next);
    redirect(`/auth/login?${q.toString()}`);
  }
  revalidatePath("/", "layout");
  redirect(next ?? "/shop");
}

export type RegisterFormState =
  | null
  | { fieldErrors: Record<string, string>; values?: Record<string, string> }
  | { error: string };

function passwordRequirementError(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}

export async function registerWithProfile(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    confirm_email: String(formData.get("confirm_email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm_password: String(formData.get("confirm_password") ?? ""),
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    delivery_address: String(formData.get("delivery_address") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    profession: String(formData.get("profession") ?? ""),
    license_number: String(formData.get("license_number") ?? ""),
    license_expiry: String(formData.get("license_expiry") ?? ""),
  };

  const parsed = registrationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      values: { ...raw, password: "", confirm_password: "" },
    };
  }

  const v = parsed.data;
  const full_name = `${v.first_name} ${v.last_name}`.trim();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.password,
    options: {
      emailRedirectTo: await getAuthEmailRedirectTo("/auth/login", { verify: "confirmed" }),
      data: {
        full_name,
        first_name: v.first_name,
        last_name: v.last_name,
        phone: v.phone,
        delivery_address: v.delivery_address,
        country: v.country,
        city: v.city,
        state: v.state,
        postal_code: v.postal_code,
        profession: v.profession,
        license_number: v.license_number,
        license_expiry: v.license_expiry,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const user = data.user;
  if (!user) {
    return {
      error:
        "Account created. If email confirmation is on, check your inbox and sign in after confirming.",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // With email confirmation, there is often no session yet; RLS blocks profile UPDATE
  // without auth.uid(). A DB trigger copies options.data into public.profiles instead.
  if (session) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name,
        first_name: v.first_name,
        last_name: v.last_name,
        delivery_address: v.delivery_address,
        country: v.country,
        city: v.city,
        state: v.state,
        postal_code: v.postal_code,
        phone: v.phone,
        profession: v.profession,
        license_number: v.license_number,
        license_expiry: v.license_expiry,
      })
      .eq("id", user.id);

    if (profileError) {
      return {
        error: `Account was created but profile details could not be saved: ${profileError.message}. Run the latest Supabase migration (profile columns) or contact support.`,
      };
    }
  }

  revalidatePath("/", "layout");
  const next = safeAuthRedirectTarget(String(formData.get("next") ?? ""));
  const q = new URLSearchParams({ verify: "sent", email: v.email });
  if (next) q.set("next", next);
  redirect(`/auth/login?${q.toString()}`);
}

/** Legacy minimal signup — kept for compatibility */
export async function signUpWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getAuthEmailRedirectTo("/auth/login", { verify: "confirmed" }),
      data: { full_name },
    },
  });
  if (error) {
    redirect("/auth/register?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/", "layout");
  const q = new URLSearchParams({ verify: "sent", email });
  redirect(`/auth/login?${q.toString()}`);
}

export async function resendVerificationEmail(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const nextRaw = String(formData.get("next") ?? "");
  const next = safeAuthRedirectTarget(nextRaw);
  const q = new URLSearchParams();
  if (next) q.set("next", next);
  if (email) q.set("email", email);

  if (!email) {
    q.set("error", "Please provide your email address.");
    q.set("unverified", "1");
    redirect(`/auth/login?${q.toString()}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: await getAuthEmailRedirectTo("/auth/login", { verify: "confirmed" }),
    },
  });
  if (error) {
    q.set("error", error.message);
    q.set("unverified", "1");
    redirect(`/auth/login?${q.toString()}`);
  }

  q.set("verify", "resent");
  redirect(`/auth/login?${q.toString()}`);
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/auth/forgot-password?error=" + encodeURIComponent("Please enter your email address."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await getAuthEmailRedirectTo("/auth/update-password"),
  });

  if (error) {
    redirect("/auth/forgot-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/auth/forgot-password?sent=1&email=" + encodeURIComponent(email));
}

export async function updateRecoveredPassword(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  const passwordError = passwordRequirementError(password);
  if (passwordError) {
    redirect("/auth/update-password?error=" + encodeURIComponent(passwordError));
  }
  if (password !== confirm) {
    redirect("/auth/update-password?error=" + encodeURIComponent("Passwords do not match."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect("/auth/update-password?error=" + encodeURIComponent(error.message));
  }

  await supabase.auth.signOut();
  redirect("/auth/login?reset=updated");
}
