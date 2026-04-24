/**
 * Public Supabase URL + anon key. Used by proxy/session + server RSC; must exist at runtime on Vercel.
 */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export const SUPABASE_PUBLIC_ENV_ERROR =
  "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. In Vercel: Project → Settings → Environment Variables, set both for Production and Preview, then Redeploy.";
