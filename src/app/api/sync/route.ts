import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncPlayerById } from "@/lib/sync-player";

export async function POST() {
  const players = await prisma.player.findMany();
  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const player of players) {
    const result = await syncPlayerById(player.id);
    results.push({ id: player.id, ...result });
    if (players.length > 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  return NextResponse.json({
    synced: results.filter((r) => r.ok).length,
    results,
    at: new Date().toISOString(),
  });
}
