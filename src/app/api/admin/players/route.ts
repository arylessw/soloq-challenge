import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { listPlayers } from "@/lib/players";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const players = await listPlayers();
  return NextResponse.json(players);
}
