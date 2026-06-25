import { SITE_EMAIL } from "@/lib/site-constants";
import { SendTestEmailButton } from "./send-test-button";

/** Email diagnostics — confirm order notifications can actually send. */
export default function AdminEmailPage() {
  const apiKeySet = Boolean(process.env.RESEND_API_KEY?.trim());
  const extraEmails = (process.env.ADMIN_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const senderDomain = SITE_EMAIL.split("@")[1] ?? SITE_EMAIL;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Email diagnostics</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Order notifications (customer receipt and the admin alert) are sent via Resend. Use this
        page to confirm sending works after a hosting or DNS change.
      </p>

      <dl className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-zinc-600">RESEND_API_KEY set on server</dt>
          <dd className={apiKeySet ? "font-medium text-teal-700" : "font-medium text-red-600"}>
            {apiKeySet ? "Yes" : "No — sending is disabled"}
          </dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-zinc-600">Sends from</dt>
          <dd className="font-medium text-zinc-900">{SITE_EMAIL}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-zinc-600">Sending domain (must be verified in Resend)</dt>
          <dd className="font-medium text-zinc-900">{senderDomain}</dd>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <dt className="text-zinc-600">Admin alert recipients</dt>
          <dd className="text-right font-medium text-zinc-900">
            {[SITE_EMAIL, ...extraEmails].join(", ")}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <SendTestEmailButton />
      </div>

      <div className="mt-8 rounded-lg bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600">
        <p className="font-medium text-zinc-700">If the test fails:</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>
            <strong>Key not set</strong> — add <code className="rounded bg-zinc-200 px-1">RESEND_API_KEY</code> to
            your host&apos;s environment variables and redeploy.
          </li>
          <li>
            <strong>Domain not verified</strong> — in the Resend dashboard, re-verify{" "}
            <code className="rounded bg-zinc-200 px-1">{senderDomain}</code> and re-add its DKIM/SPF
            DNS records. Moving the domain&apos;s email to another provider (e.g. Google Workspace)
            can remove these.
          </li>
        </ul>
      </div>
    </div>
  );
}
