import "server-only";

import { SITE_EMAIL } from "@/lib/site-constants";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string };

/** Sends via Resend. Requires RESEND_API_KEY and a verified sending domain for SITE_EMAIL. */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set; skipped:", input.subject);
    return { ok: false, error: "Email is not configured (missing RESEND_API_KEY)." };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `MedicaPlanet <${SITE_EMAIL}>`,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[email] Resend error:", res.status, body);
    return { ok: false, error: body || `Resend HTTP ${res.status}` };
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id };
}
