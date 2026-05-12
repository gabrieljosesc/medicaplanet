import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrderShippingLine } from "@/lib/checkout-shipping";

/** Preview shipping for the signed-in user (first order vs Priority Shipping). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const line = await getOrderShippingLine(supabase, user.id);
    return NextResponse.json({
      isFirstOrder: line.isFirstOrder,
      shippingAmount: line.amount,
      shippingLabel: line.label,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
