import type { User } from "@supabase/supabase-js";

/** Subset of `public.profiles` used for account/checkout prefill. */
export type ProfilePrefillSource = {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  delivery_address?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
} | null;

export type MergedProfileForUi = {
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  delivery_address: string;
  country: string;
  city: string;
  state: string;
  postal_code: string;
  gender: string;
  date_of_birth: string;
  avatar_url: string;
};

function trimStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function metaString(user: User, key: string): string {
  const raw = user.user_metadata?.[key];
  return trimStr(raw);
}

/**
 * Prefer DB profile; fall back to `auth.users.raw_user_meta_data` when profile
 * columns were never written (e.g. email-confirm signup with no session, so the
 * post-signup RLS update did not run).
 */
export function mergeProfileWithUserMetadata(
  profile: ProfilePrefillSource,
  user: User
): MergedProfileForUi {
  const first_name = trimStr(profile?.first_name) || metaString(user, "first_name");
  const last_name = trimStr(profile?.last_name) || metaString(user, "last_name");
  const fromParts = `${first_name} ${last_name}`.trim();

  const full_name =
    trimStr(profile?.full_name) || fromParts || metaString(user, "full_name");

  return {
    full_name,
    first_name,
    last_name,
    phone: trimStr(profile?.phone) || metaString(user, "phone"),
    delivery_address: trimStr(profile?.delivery_address) || metaString(user, "delivery_address"),
    country: trimStr(profile?.country) || metaString(user, "country"),
    city: trimStr(profile?.city) || metaString(user, "city"),
    state: trimStr(profile?.state) || metaString(user, "state"),
    postal_code: trimStr(profile?.postal_code) || metaString(user, "postal_code"),
    gender: trimStr(profile?.gender),
    date_of_birth:
      profile?.date_of_birth != null && String(profile.date_of_birth)
        ? String(profile.date_of_birth).slice(0, 10)
        : "",
    avatar_url: trimStr(profile?.avatar_url),
  };
}
