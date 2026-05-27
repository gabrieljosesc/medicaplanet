import { SITE_PUBLIC_URL } from "@/lib/site-constants";

/** Public URL for the logo in emails (PNG for broad client support; same mark as the site header). */
export const SITE_EMAIL_LOGO_URL = `${SITE_PUBLIC_URL}/email-logo.png`;

/** Email-safe header matching the site: logo mark + MedicaPlanet + Trusted Supplier. */
export function emailHeaderHtml(): string {
  const logoUrl = SITE_EMAIL_LOGO_URL;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e4e4e7;background:#ffffff;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td valign="middle" style="padding-right:12px;width:40px;">
                <img
                  src="${logoUrl}"
                  width="36"
                  height="36"
                  alt=""
                  style="display:block;border:0;width:36px;height:36px;max-width:36px;"
                />
              </td>
              <td valign="middle">
                <p style="margin:0;font-size:18px;font-weight:700;line-height:1.2;color:#3d2a26;letter-spacing:-0.02em;">
                  MedicaPlanet
                </p>
                <p style="margin:4px 0 0;font-size:10px;font-weight:500;line-height:1.2;color:#3d2a26;opacity:0.55;letter-spacing:0.18em;text-transform:uppercase;">
                  Trusted Supplier
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}
