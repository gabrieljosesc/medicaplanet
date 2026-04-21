import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/account-sidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? "";
  const displayName =
    (profile?.full_name && profile.full_name.trim()) || email.split("@")[0] || "Account";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(220px,280px)_1fr] lg:items-start">
      <AccountSidebar
        displayName={displayName}
        email={email}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
