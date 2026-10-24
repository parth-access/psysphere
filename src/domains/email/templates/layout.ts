import { SITE, whatsappUrl } from "@/constants/site";
import { EMAIL_DEFAULTS } from "../constants";

/**
 * Brand colours from app/globals.css. Emails can't use CSS variables, and most clients
 * strip <style>, so every rule below is written inline on table-based markup.
 */
export const C = {
  forest900: "#164A2E",
  forest800: "#1F5E3B",
  forest50: "#EFF6F0",
  gold500: "#E6A520",
  gold700: "#8C5E07",
  gold100: "#FCF0D2",
  ink900: "#15281D",
  ink700: "#2C4235",
  ink500: "#5A6B60",
  paper: "#FBF8F1",
  paperDeep: "#F3EDE0",
  line: "#E6DFCF",
  white: "#FFFFFF",
  rose600: "#B3423A",
};

export const SERIF = `Georgia, 'Times New Roman', serif`;
export const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

/**
 * The frame every Saarthi Classes email sits in.
 * `preheader` is the grey preview line inbox lists show next to the subject.
 */
export function renderBaseEmailLayout(title: string, contentHtml: string, preheader = ""): string {
  const year = new Date().getFullYear();
  const replyLine = EMAIL_DEFAULTS.REPLY_TO
    ? `Questions? Just reply to this email, or message us on <a href="${whatsappUrl()}" style="color:${C.forest800};font-weight:600;text-decoration:underline;">WhatsApp</a>.`
    : `Questions? Use our <a href="${SITE.url}/contact" style="color:${C.forest800};font-weight:600;text-decoration:underline;">contact form</a> or message us on <a href="${whatsappUrl()}" style="color:${C.forest800};font-weight:600;text-decoration:underline;">WhatsApp</a>.`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    @media (max-width: 620px) {
      .card { border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
      .pad { padding-left: 24px !important; padding-right: 24px !important; }
      .h1 { font-size: 26px !important; }
    }
    a { color: ${C.forest800}; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${C.paperDeep};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${preheader}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.paperDeep};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background-color:${C.white};border:1px solid ${C.line};border-radius:24px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td class="pad" style="background-color:${C.forest900};padding:26px 40px 22px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${SITE.logoUrl}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;border:0;border-radius:999px;background-color:${C.paper};">
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-family:${SERIF};font-size:22px;line-height:1;color:${C.paper};">Saarthi</div>
                    <div style="font-family:${SANS};font-size:10px;line-height:1;margin-top:5px;letter-spacing:0.22em;font-weight:700;color:${C.gold500};">CLASSES</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background-color:${C.gold500};">&nbsp;</td></tr>
          <!-- Body -->
          <tr>
            <td class="pad" style="padding:40px 40px 12px 40px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.ink700};">
              ${contentHtml}
            </td>
          </tr>
          <!-- Help -->
          <tr>
            <td class="pad" style="padding:8px 40px 36px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.forest50};border-radius:16px;">
                <tr>
                  <td style="padding:16px 20px;font-family:${SANS};font-size:14px;line-height:1.55;color:${C.ink700};">${replyLine}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
          <tr>
            <td align="center" style="padding:24px 24px 8px 24px;font-family:${SERIF};font-style:italic;font-size:15px;color:${C.ink700};">
              Psychology for Class 11, 12 &amp; CUET-UG
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 24px 8px 24px;font-family:${SANS};font-size:13px;color:${C.ink500};">
              <a href="${SITE.url}" style="color:${C.ink700};text-decoration:none;font-weight:600;">classes.saarthilife.com</a>
              &nbsp;·&nbsp;
              <a href="${SITE.url}/workshops" style="color:${C.ink700};text-decoration:none;font-weight:600;">Free workshops</a>
              &nbsp;·&nbsp;
              <a href="${whatsappUrl()}" style="color:${C.ink700};text-decoration:none;font-weight:600;">WhatsApp</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:4px 24px 24px 24px;font-family:${SANS};font-size:11px;line-height:1.6;color:${C.ink500};">
              © ${year} Saarthi Classes, part of <a href="${SITE.parent.url}" style="color:${C.ink500};">Saarthi</a>.<br>
              You're getting this because of your account or a request on our website.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
