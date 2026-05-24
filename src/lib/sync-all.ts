import { prisma } from "@/lib/db";
import { syncPlayerById } from "@/lib/sync-player";

export type SyncResult = {
  id: string;
  ok: boolean;
  error?: string;
};

export async function syncAllPlayers(): Promise<{
  synced: number;
  results: SyncResult[];
  at: string;
}> {
  const players = await prisma.player.findMany();
  const results: SyncResult[] = [];

  for (const player of players) {
    const result = await syncPlayerById(player.id);
    results.push({ id: player.id, ...result });
    if (players.length > 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  return {
    synced: results.filter((r) => r.ok).length,
    results,
    at: new Date().toISOString(),
  };
}
