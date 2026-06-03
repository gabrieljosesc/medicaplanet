"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { sendOrderStatusEmail, type OrderStatus } from "@/lib/email/order-emails";
import { SITE_PUBLIC_URL } from "@/lib/site-constants";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");
  return { supabase, user };
}

export async function updateProductAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const description = String(formData.get("description") || "");
  const sku = String(formData.get("sku") || "");
  const base_price = Number(formData.get("base_price"));
  const category_id = String(formData.get("category_id") || "") || null;
  const is_active = formData.get("is_active") === "on";
  const is_featured = formData.get("is_featured") === "on";
  const image_url = String(formData.get("image_url") || "").trim();

  const { error } = await supabase
    .from("products")
    .update({
      title,
      slug,
      description,
      sku,
      base_price,
      category_id,
      is_active,
      is_featured,
    })
    .eq("id", id);

  if (error) {
    redirect("/admin/products/" + id + "?error=" + encodeURIComponent(error.message));
  }

  if (image_url) {
    const { data: imgs } = await supabase.from("product_images").select("id").eq("product_id", id).limit(1);
    if (imgs?.[0]) {
      await supabase.from("product_images").update({ url: image_url }).eq("id", imgs[0].id);
    } else {
      await supabase.from("product_images").insert({ product_id: id, url: image_url, sort_order: 0 });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  redirect("/admin/products/" + id + "?saved=1");
}

export async function createProductAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title"));
  const slug = String(formData.get("slug"));
  const description = String(formData.get("description") || "");
  const sku = String(formData.get("sku") || "");
  const base_price = Number(formData.get("base_price"));
  const category_id = String(formData.get("category_id") || "") || null;
  const is_active = formData.get("is_active") === "on";
  const is_featured = formData.get("is_featured") === "on";

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      description,
      sku,
      base_price,
      price_tiers: [],
      category_id,
      is_active,
      is_featured,
    })
    .select("id,slug")
    .single();

  if (error) {
    redirect("/admin/products/new?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function updateOrderAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const admin_notes = String(formData.get("admin_notes") || "");
  const customer_visible_note = String(formData.get("customer_visible_note") || "") || null;

  const { data: before } = await supabase.from("orders").select("status").eq("id", id).single();
  const previousStatus = (before?.status ?? "pending_csr") as OrderStatus;

  const { error } = await supabase.from("orders").update({ status, admin_notes, customer_visible_note }).eq("id", id);
  if (error) {
    redirect("/admin/orders/" + id + "?error=" + encodeURIComponent(error.message));
  }

  if (previousStatus !== status) {
    const svc = createServiceClient();
    const { data: order } = await svc
      .from("orders")
      .select(
        "id, reference_number, email, full_name, status, subtotal, shipping_amount, shipping_label, order_items ( title, quantity, unit_price )"
      )
      .eq("id", id)
      .single();

    if (order) {
      void sendOrderStatusEmail(order, previousStatus, status).catch((err) =>
        console.error("[email] order status:", err)
      );
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect("/admin/orders/" + id + "?saved=1");
}

export async function upsertBlogPostAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug"));
  const title = String(formData.get("title"));
  const excerpt = String(formData.get("excerpt") || "");
  const body = String(formData.get("body"));
  const is_published = formData.get("is_published") === "on";
  const published_at = is_published ? new Date().toISOString() : null;

  if (id) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ slug, title, excerpt, body, is_published, published_at })
      .eq("id", id);
    if (error) {
      redirect("/admin/blog/" + id + "?error=" + encodeURIComponent(error.message));
    }
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect("/admin/blog/" + id + "?saved=1");
  } else {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug,
        title,
        excerpt,
        body,
        is_published,
        published_at,
      })
      .select("id")
      .single();
    if (error) {
      redirect("/admin/blog/new?error=" + encodeURIComponent(error.message));
    }
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect("/admin/blog/" + data.id + "?saved=1");
  }
}

export type AdminActionResult = { ok: true; message: string } | { ok: false; message: string };

// ─── Coupon actions ───────────────────────────────────────────────────────────

export async function createCouponAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const discount_type = String(formData.get("discount_type")) as "percent" | "fixed";
  const discount_value = parseFloat(String(formData.get("discount_value")));
  const min_order_amount = parseFloat(String(formData.get("min_order_amount") ?? "0")) || 0;
  const max_uses_raw = String(formData.get("max_uses") ?? "").trim();
  const max_uses = max_uses_raw ? parseInt(max_uses_raw, 10) : null;
  const expires_at_raw = String(formData.get("expires_at") ?? "").trim();
  const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null;

  if (!code) redirect("/admin/coupons?error=Code+is+required");
  if (!["percent", "fixed"].includes(discount_type)) redirect("/admin/coupons?error=Invalid+discount+type");
  if (isNaN(discount_value) || discount_value <= 0) redirect("/admin/coupons?error=Discount+value+must+be+positive");
  if (discount_type === "percent" && discount_value > 100) redirect("/admin/coupons?error=Percent+cannot+exceed+100");

  const { error } = await supabase.from("coupons").insert({
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_uses,
    expires_at,
    is_active: true,
  });

  if (error) {
    redirect("/admin/coupons?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?created=1");
}

export async function toggleCouponAction(id: string, isActive: boolean): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/coupons");
  return { ok: true, message: isActive ? "Coupon activated." : "Coupon deactivated." };
}

export async function deleteCouponAction(id: string): Promise<AdminActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/coupons");
  return { ok: true, message: "Coupon deleted." };
}

/** Send a password-reset email to any user. Admin only. */
export async function sendPasswordResetAction(userId: string): Promise<AdminActionResult> {
  await requireAdmin();
  const svc = createServiceClient();

  const { data: authUser, error: getUserErr } = await svc.auth.admin.getUserById(userId);
  if (getUserErr || !authUser?.user?.email) {
    return { ok: false, message: getUserErr?.message ?? "User not found." };
  }

  const { error } = await svc.auth.admin.generateLink({
    type: "recovery",
    email: authUser.user.email,
    options: { redirectTo: `${SITE_PUBLIC_URL}/auth/update-password` },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: `Password reset email sent to ${authUser.user.email}.` };
}
