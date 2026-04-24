import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PrivacyForm } from "./privacy-form";

export const metadata: Metadata = {
  title: "Privacy",
};

export default async function PrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("privacy_preferences")
    .eq("id", user.id)
    .single();

  const prefs = (profile?.privacy_preferences ?? {}) as { analytics_opt_in?: boolean };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Privacy</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Control a few account preferences. See our{" "}
          <Link href="/legal/privacy" className="font-medium text-teal-800 hover:underline">
            Privacy policy
          </Link>{" "}
          for full detail.
        </p>
      </div>

      <PrivacyForm analyticsOptIn={Boolean(prefs.analytics_opt_in)} />

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-zinc-900">Request account deletion</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Contact us to close your account and delete associated profile data, subject to legal
              retention rules.
            </p>
          </div>
          <a
            href="mailto:support@medicaplanet.example?subject=Account%20deletion%20request"
            className="shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Email support
          </a>
        </div>
      </section>
    </div>
  );
}
