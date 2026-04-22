import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type SiteProfile = {
  role: string | null;
  avatar_url: string | null;
  full_name: string | null;
  email: string | null;
};

export type SiteUserContext = {
  user: User | null;
  profile: SiteProfile | null;
  isAdmin: boolean;
};

export async function getSiteUserContext(): Promise<SiteUserContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, profile: null, isAdmin: false };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, avatar_url, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as SiteProfile | null;
  return {
    user,
    profile: p,
    isAdmin: p?.role === "admin",
  };
}
