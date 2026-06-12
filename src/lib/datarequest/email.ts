// Branded request email — built here, "sent" via a swappable function.
// Sends through Resend's REST API when RESEND_API_KEY is set; otherwise (or on
// failure) writes the rendered HTML to .data/sent-emails/ so the loop still works.
import { promises as fs } from "fs";
import path from "path";

export interface EmailReq {
  clientName: string;
  contactName: string | null;
  contactEmail: string;
  deadline: string | null;
  items: { label: string; unit: string | null }[];
  token: string;
}

export function buildRequestEmail(req: EmailReq, link: string): { subject: string; html: string } {
  const subject = `Data request for ${req.clientName}'s BRSR report`;
  const deadline = req.deadline
    ? new Date(req.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const itemsHtml = req.items
    .map(
      (it) =>
        `<tr>
           <td style="padding:8px 0;border-bottom:1px solid #eee;color:#1a1916;font-size:14px;">${it.label}</td>
           <td style="padding:8px 0;border-bottom:1px solid #eee;color:#8a857c;font-size:13px;text-align:right;white-space:nowrap;">${it.unit ?? ""}</td>
         </tr>`
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#F7F6F2;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e5e0;border-radius:14px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #f0eee9;">
      <span style="display:inline-block;width:26px;height:26px;border-radius:7px;background:#111;color:#fff;font-weight:700;font-size:11px;text-align:center;line-height:26px;vertical-align:middle;">BK</span>
      <span style="font-weight:600;color:#1a1916;font-size:14px;vertical-align:middle;margin-left:8px;">BRSR Consultant Kit</span>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;color:#1a1916;margin:0 0 12px;">Hi ${req.contactName || "there"},</p>
      <p style="font-size:14px;color:#52504a;line-height:1.6;margin:0 0 18px;">
        We're preparing the BRSR (Business Responsibility &amp; Sustainability Report) for
        <strong style="color:#1a1916;">${req.clientName}</strong> and need a few data points you're best placed to provide.
        It takes a couple of minutes — open the secure link below and fill them in.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 18px;">${itemsHtml}</table>
      ${deadline ? `<p style="font-size:13px;color:#a8662a;background:#fdf3e7;border:1px solid #f6e1c6;border-radius:8px;padding:10px 12px;margin:0 0 18px;">Please submit by <strong>${deadline}</strong>.</p>` : ""}
      <a href="${link}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:11px 20px;border-radius:9px;">Provide the data →</a>
      <p style="font-size:12px;color:#9a958c;line-height:1.6;margin:18px 0 0;">
        Sent via BRSR Consultant Kit. If the button doesn't work, paste this into your browser:<br>
        <span style="color:#00745a;word-break:break-all;">${link}</span>
      </p>
    </div>
  </div>
  </body></html>`;

  return { subject, html };
}

export async function sendRequestEmail(req: EmailReq, link: string): Promise<void> {
  const { subject, html } = buildRequestEmail(req, link);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "BRSR Consultant Kit <onboarding@resend.dev>";

  if (apiKey && !apiKey.startsWith("re_paste")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: req.contactEmail, subject, html }),
      });
      if (res.ok) {
        // eslint-disable-next-line no-console
        console.log(`[resend] sent to ${req.contactEmail}`);
        return;
      }
      // eslint-disable-next-line no-console
      console.error(`[resend] send failed ${res.status}: ${await res.text().catch(() => "")}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[resend] error:`, e instanceof Error ? e.message : e);
    }
  }

  // Stub fallback (no key, or send failed): keep a local copy you can open.
  const dir = path.join(process.cwd(), ".data", "sent-emails");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${req.token}.html`), html, "utf8");
  // eslint-disable-next-line no-console
  console.log(`[email stub] → ${req.contactEmail} | "${subject}" | ${link}`);
}
