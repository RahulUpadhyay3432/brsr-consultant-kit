// Public endpoint the Brief PWA calls to register/unregister a browser for push
// notifications. Best-effort: it never leaks why it failed, and stores nothing
// but the opaque push endpoint + its keys.
import { NextRequest, NextResponse } from "next/server";
import { saveSubscription, removeSubscription, type PushSub } from "@/lib/brief/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sub = (await req.json()) as PushSub;
    const ok = await saveSubscription(sub);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = (await req.json()) as { endpoint?: string };
    if (endpoint) await removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
