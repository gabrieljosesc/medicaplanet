import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { displayOrderReference } from "@/lib/order-reference";
import { UpdatePaymentForm } from "./update-payment-form";

type Props = { params: Promise<{ id: string }> };

export default async function UpdateOrderPaymentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/account/orders/${id}/update-payment`);

  const { data: order } = await supabase
    .from("orders")
    .select("id, reference_number, status, payment_card_snapshot")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!order) notFound();

  const ref = displayOrderReference(order);
  const snap = order.payment_card_snapshot as { brand?: string | null; last4?: string } | null;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <Link href={`/account/orders/${id}`} className="text-sm font-medium text-teal-800 hover:underline">
          ← Order {ref}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">Update payment</h1>
        <p className="mt-2 text-sm text-zinc-600">
          There was a problem processing the card on order <span className="font-medium">{ref}</span>
          {snap?.last4 ? (
            <>
              {" "}
              ({snap.brand ?? "card"} ···· {snap.last4})
            </>
          ) : null}
          . Enter your new card details below and our team will re-process your order.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <UpdatePaymentForm orderId={order.id} />
      </div>

      <p className="text-xs text-zinc-500">
        Your card details are encrypted and used only to process this order.
      </p>
    </div>
  );
}
