import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NotificationsForm } from "./notifications-form";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  const prefs = (profile?.notification_preferences ?? {}) as {
    email_order_updates?: boolean;
    email_product_news?: boolean;
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Notifications</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Choose what we may email you about. Service emails for active orders may still be sent.
        </p>
      </div>
      <NotificationsForm
        emailOrderUpdates={Boolean(prefs.email_order_updates)}
        emailProductNews={Boolean(prefs.email_product_news)}
      />
    </div>
  );
}
