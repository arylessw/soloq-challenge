import { NextResponse } from "next/server";
import { syncAllPlayers } from "@/lib/sync-all";

export async function POST() {
  try {
    const result = await syncAllPlayers();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[POST /api/sync]", e);
    return NextResponse.json({ error: "Sync échouée" }, { status: 500 });
  }
}
