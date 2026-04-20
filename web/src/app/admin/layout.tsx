import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-[60vh]">
      <div className="mb-6 flex flex-wrap gap-3 border-b border-zinc-200 pb-4 text-sm font-medium">
        <Link href="/admin" className="text-emerald-900 hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/products" className="text-emerald-900 hover:underline">
          Products
        </Link>
        <Link href="/admin/orders" className="text-emerald-900 hover:underline">
          Orders
        </Link>
        <Link href="/admin/blog" className="text-emerald-900 hover:underline">
          Blog
        </Link>
        <Link href="/" className="ml-auto text-zinc-600 hover:underline">
          Storefront
        </Link>
      </div>
      {children}
    </div>
  );
}
