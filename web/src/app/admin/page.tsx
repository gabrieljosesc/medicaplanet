import Link from "next/link";

const sections = [
  {
    href: "/admin/products",
    label: "Products & prices",
    desc: "Add, edit, or deactivate products in the catalog.",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    desc: "Review incoming orders and update their status.",
  },
  {
    href: "/admin/users",
    label: "Users",
    desc: "View all registered accounts and send password resets.",
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    desc: "Create and manage discount / promo codes.",
  },
  {
    href: "/admin/blog",
    label: "Blog",
    desc: "Create and publish blog posts.",
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage catalog, review incoming orders, manage users, and publish blog posts.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-teal-400 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-teal-900">{s.label}</p>
            <p className="mt-1 text-xs text-zinc-500">{s.desc}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-xs text-zinc-500">
        Grant admin: in Supabase SQL run{" "}
        <code className="rounded bg-zinc-100 px-1">
          update profiles set role = &apos;admin&apos; where email = &apos;you@example.com&apos;;
        </code>
      </p>
    </div>
  );
}
