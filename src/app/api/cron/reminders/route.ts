import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listCampaigns, markReminded } from "@/lib/datarequest/db";
import { dueReminder } from "@/lib/datarequest/cadence";
import { sendRequestEmail } from "@/lib/datarequest/email";

export const dynamic = "force-dynamic";

// Daily reminder cadence (Vercel Cron, see vercel.json). For each data owner who
// hasn't fully responded and is past the reminder interval, send one branded
// reminder and record it. Secured by CRON_SECRET — Vercel Cron auto-injects the
// matching Authorization header.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const now = new Date();
  const campaigns = await listCampaigns();

  let checked = 0;
  let sent = 0;

  for (const campaign of campaigns) {
    for (const contact of campaign.contacts) {
      checked++;
      const decision = dueReminder(contact, campaign, now);
      if (!decision.send) continue;

      await sendRequestEmail(
        {
          clientName: campaign.clientName,
          contactName: contact.name,
          contactEmail: contact.email,
          deadline: campaign.deadline,
          reportingPeriod: campaign.reportingPeriod,
          items: contact.items.map((i) => ({ label: i.label, unit: i.unit })),
          token: contact.token,
          kind: "reminder",
          final: decision.final,
        },
        `${base}/submit/${contact.token}`
      );
      await markReminded(contact.id, decision.reminderNo);
      sent++;
    }
  }

  return NextResponse.json({ checked, sent });
}
