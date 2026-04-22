import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SavedCardRow } from "@/app/actions/saved-cards";
import { PaymentMethodsClient } from "./payment-methods-client";

export const metadata: Metadata = {
  title: "Payment methods",
};

export default async function PaymentMethodsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rows, error } = await supabase
    .from("user_saved_cards")
    .select("id, user_id, name_on_card, brand, last4, exp_month, exp_year, is_default, created_at")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  const safeRows = error ? [] : rows;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Banks &amp; cards</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Save a card for faster checkout. Card numbers are encrypted on the server; CSR can view full details on the
          admin order page when you submit an order using that card.
        </p>
      </div>
      <PaymentMethodsClient initialMethods={(safeRows ?? []) as SavedCardRow[]} />
    </div>
  );
}
