import { createClient } from "@/lib/supabase/server";
import { createCouponAction } from "@/app/actions/admin";
import { CouponRow } from "./coupon-row";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ created?: string; error?: string }> };

export default async function AdminCouponsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Coupon Codes</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create discount codes for customers to use at checkout.
      </p>

      {sp.created ? (
        <p className="mt-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          Coupon created successfully.
        </p>
      ) : null}
      {sp.error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </p>
      ) : null}

      {/* Create form */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Create new coupon</h2>
        <form action={createCouponAction} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Code <span className="text-red-500">*</span></span>
            <input
              name="code"
              required
              placeholder="e.g. WELCOME10"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase tracking-wide"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Discount type <span className="text-red-500">*</span></span>
            <select
              name="discount_type"
              required
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="percent">Percent (%) off</option>
              <option value="fixed">Fixed ($) off</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Discount value <span className="text-red-500">*</span></span>
            <input
              name="discount_value"
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 10 for 10% or $10"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Min. order amount ($)</span>
            <input
              name="min_order_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <span className="text-xs text-zinc-400">0 = no minimum</span>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Max uses</span>
            <input
              name="max_uses"
              type="number"
              min="1"
              step="1"
              placeholder="Leave blank for unlimited"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Expires at</span>
            <input
              name="expires_at"
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <span className="text-xs text-zinc-400">Leave blank = never expires</span>
          </label>

          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="font-medium text-zinc-700">Description (internal note)</span>
            <input
              name="description"
              placeholder="e.g. First order discount for new clients"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-full bg-teal-800 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Create coupon
            </button>
          </div>
        </form>
      </section>

      {/* Coupon list */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-zinc-900">
          All coupons ({(coupons ?? []).length})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <th className="py-2 pr-3">Code</th>
                <th className="py-2 pr-3">Discount</th>
                <th className="py-2 pr-3">Min order</th>
                <th className="py-2 pr-3">Uses</th>
                <th className="py-2 pr-3">Expires</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(coupons ?? []).map((c) => (
                <CouponRow key={c.id} coupon={c} />
              ))}
              {(coupons ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-sm text-zinc-500">
                    No coupons yet. Create one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
