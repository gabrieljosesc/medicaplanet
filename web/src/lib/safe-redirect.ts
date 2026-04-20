/** Only allow same-origin relative paths after login/register (open redirect hardening). */
export function safeAuthRedirectTarget(next: string | null | undefined): string | null {
  if (next == null || typeof next !== "string") return null;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("..") || t.includes("\\") || t.includes(":")) return null;
  if (!/^\/[\w./-]*$/.test(t)) return null;
  return t;
}
