"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().min(1).max(200),
  first_name: z.string().max(120).optional(),
  last_name: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  gender: z.enum(["", "male", "female", "other"]),
  date_of_birth: z.string().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8).max(200),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const notificationSchema = z.object({
  email_order_updates: z.boolean().optional(),
  email_product_news: z.boolean().optional(),
});

const privacySchema = z.object({
  analytics_opt_in: z.boolean().optional(),
});

const addressSchema = z.object({
  label: z.string().max(80).optional(),
  recipient_name: z.string().min(1).max(200),
  phone: z.string().max(40).optional(),
  line1: z.string().min(1).max(300),
  line2: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  postal_code: z.string().max(40).optional(),
  country: z.string().max(120).optional(),
  is_default: z.boolean().default(false),
});

export type ActionState = { ok?: string; error?: string };

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const raw = {
    full_name: String(formData.get("full_name") ?? ""),
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    date_of_birth: String(formData.get("date_of_birth") ?? ""),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please check the highlighted fields." };

  const v = parsed.data;
  const dob =
    v.date_of_birth && /^\d{4}-\d{2}-\d{2}$/.test(v.date_of_birth)
      ? v.date_of_birth
      : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: v.full_name,
      first_name: v.first_name || null,
      last_name: v.last_name || null,
      phone: v.phone || null,
      gender: v.gender || null,
      date_of_birth: dob,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/account", "layout");
  revalidatePath("/", "layout");
  return { ok: "Profile saved." };
}

export async function uploadAvatar(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const file = formData.get("avatar");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (file.size > 1024 * 1024) return { error: "Image must be 1 MB or smaller." };
  const type = file.type;
  if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
    return { error: "Use JPEG, PNG, or WebP." };
  }

  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabase.storage.from("avatars").upload(path, buf, {
    contentType: type,
    upsert: true,
  });
  if (upErr) {
    if (/bucket not found/i.test(upErr.message)) {
      return {
        error:
          "Avatar storage is not ready yet. Apply Supabase migration 20260420150000_account_profile_addresses_avatars.sql, then try again.",
      };
    }
    return { error: upErr.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: dbErr } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (dbErr) return { error: dbErr.message };

  revalidatePath("/account", "layout");
  revalidatePath("/", "layout");
  return { ok: "Photo updated." };
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const parsed = passwordSchema.safeParse({
    newPassword: String(formData.get("new_password") ?? ""),
    confirmPassword: String(formData.get("confirm_password") ?? ""),
  });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.confirmPassword?.[0];
    return { error: msg ?? "Password must be at least 8 characters and match confirmation." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { error: error.message };
  return { ok: "Password updated." };
}

export async function saveNotificationSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const nParsed = notificationSchema.safeParse({
    email_order_updates: formData.get("email_order_updates") === "on",
    email_product_news: formData.get("email_product_news") === "on",
  });
  if (!nParsed.success) return { error: "Invalid notification settings." };
  const prefs = nParsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_preferences: prefs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/account/notifications");
  return { ok: "Notification preferences saved." };
}

export async function savePrivacySettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const pParsed = privacySchema.safeParse({
    analytics_opt_in: formData.get("analytics_opt_in") === "on",
  });
  if (!pParsed.success) return { error: "Invalid privacy settings." };
  const prefs = pParsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      privacy_preferences: prefs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/account/privacy");
  return { ok: "Privacy preferences saved." };
}

export async function createAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const raw = {
    label: String(formData.get("label") ?? ""),
    recipient_name: String(formData.get("recipient_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    country: String(formData.get("country") ?? ""),
    is_default: formData.get("is_default") === "on",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please fill required address fields." };

  if (parsed.data.is_default) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("user_addresses").insert({
    user_id: user.id,
    ...parsed.data,
  });
  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function updateAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing address id." };

  const raw = {
    label: String(formData.get("label") ?? ""),
    recipient_name: String(formData.get("recipient_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    country: String(formData.get("country") ?? ""),
    is_default: formData.get("is_default") === "on",
  };

  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please fill required address fields." };

  const { data: existing } = await supabase
    .from("user_addresses")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!existing) return { error: "Address not found." };

  if (parsed.data.is_default) {
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase
    .from("user_addresses")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("user_addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("user_addresses")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/account/addresses");
}
