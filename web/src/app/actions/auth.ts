"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeAuthRedirectTarget } from "@/lib/safe-redirect";
import {
  flattenZodErrors,
  registrationSchema,
} from "@/app/auth/register/registration-schema";

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
    if (next) q.set("next", next);
    redirect(`/auth/login?${q.toString()}`);
  }
  revalidatePath("/", "layout");
  redirect(next ?? "/shop");
}

export type RegisterFormState =
  | null
  | { fieldErrors: Record<string, string> }
  | { error: string };

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
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const v = parsed.data;
  const full_name = `${v.first_name} ${v.last_name}`.trim();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.password,
    options: {
      data: {
        full_name,
        first_name: v.first_name,
        last_name: v.last_name,
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

  revalidatePath("/", "layout");
  const next = safeAuthRedirectTarget(String(formData.get("next") ?? ""));
  redirect(next ?? "/shop");
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
    options: { data: { full_name } },
  });
  if (error) {
    redirect("/auth/register?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/", "layout");
  redirect("/shop");
}
