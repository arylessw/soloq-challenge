import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendDiscordTest } from "@/lib/discord";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await sendDiscordTest();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
