import { createClient } from "@/lib/supabase/server";
import { orderGrandTotal } from "@/lib/checkout-shipping";
import { PurchaseConversion } from "@/components/purchase-conversion";

type Props = { searchParams: Promise<{ ref?: string; id?: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Grand total of the just-placed order, for the Google Ads conversion value. */
async function orderConversionValue(reference: string): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Checkout redirects with ?ref=<reference_number>; legacy links used ?id=<uuid>.
  const column = UUID_RE.test(reference) ? "id" : "reference_number";
  const { data: order } = await supabase
    .from("orders")
    .select("subtotal, shipping_amount, discount_amount")
    .eq("user_id", user.id)
    .eq(column, reference)
    .maybeSingle();
  if (!order) return null;

  const total =
    orderGrandTotal(Number(order.subtotal), Number(order.shipping_amount ?? 0)) -
    Number(order.discount_amount ?? 0);
  return Math.round(Math.max(0, total) * 100) / 100;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { ref, id } = await searchParams;
  const reference = ref ?? id;
  const conversionValue = reference ? await orderConversionValue(reference) : null;

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-8 text-center">
      <h1 className="text-xl font-semibold text-teal-950">Order received</h1>
      <p className="mt-3 text-sm text-teal-900/90">
        Thank you! Your order is being processed.
        <br />
        You&apos;ll receive another email when your order is confirmed.
      </p>
      {reference && (
        <p className="mt-4 text-xs text-teal-900/80">
          Reference: <span className="font-mono">{reference}</span>
        </p>
      )}
      {reference && (
        <PurchaseConversion transactionId={reference} value={conversionValue} />
      )}
    </div>
  );
}
