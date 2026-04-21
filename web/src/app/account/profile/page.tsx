import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForms } from "./profile-forms";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const email = profile?.email ?? user.email ?? "";
  const maskedEmail = maskEmail(email);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Update how you appear on MedicaPlanet and manage your contact details.
        </p>
      </div>

      <ProfileForms
          profile={{
            full_name: profile?.full_name ?? "",
            first_name: profile?.first_name ?? "",
            last_name: profile?.last_name ?? "",
            phone: profile?.phone ?? "",
            gender: profile?.gender ?? "",
            date_of_birth: profile?.date_of_birth ?? "",
            avatar_url: profile?.avatar_url ?? null,
          }}
          emailMasked={maskedEmail}
          emailNote="Email is tied to your sign-in. Contact support to change it."
        />
    </div>
  );
}

function maskEmail(e: string): string {
  const at = e.indexOf("@");
  if (at <= 1) return e;
  const local = e.slice(0, at);
  const domain = e.slice(at);
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.min(8, local.length - 2))}${domain}`;
}
