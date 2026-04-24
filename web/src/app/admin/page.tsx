import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Manage catalog, review incoming orders, and publish blog posts.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-teal-900">
        <li>
          <Link href="/admin/products" className="hover:underline">
            Products & prices
          </Link>
        </li>
        <li>
          <Link href="/admin/orders" className="hover:underline">
            Orders (pending review)
          </Link>
        </li>
        <li>
          <Link href="/admin/blog" className="hover:underline">
            Blog
          </Link>
        </li>
      </ul>
      <p className="mt-8 text-xs text-zinc-500">
        Grant admin: in Supabase SQL run{" "}
        <code className="rounded bg-zinc-100 px-1">
          update profiles set role = &apos;admin&apos; where email = &apos;you@example.com&apos;;
        </code>
      </p>
    </div>
  );
}
