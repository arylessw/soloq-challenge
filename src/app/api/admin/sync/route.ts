import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { syncAllPlayers } from "@/lib/sync-all";

export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await syncAllPlayers();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[POST /api/admin/sync]", e);
    return NextResponse.json({ error: "Sync échouée" }, { status: 500 });
  }
}
