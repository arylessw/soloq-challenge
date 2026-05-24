import { listPlayers } from "@/lib/players";
import { getLpDeltaSince } from "@/lib/lp-snapshots";

export type PlayerOfWeekView = {
  playerId: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  lpDelta: number;
  currentRank: string | null;
  progressLabel: string | null;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getPlayerOfWeek(): Promise<PlayerOfWeekView | null> {
  const players = await listPlayers();
  if (players.length === 0) return null;

  const since = new Date(Date.now() - WEEK_MS);
  let best: PlayerOfWeekView | null = null;

  for (const p of players) {
    if (p.lpNet == null) continue;

    const delta = await getLpDeltaSince(p.id, since);
    if (delta == null || delta <= 0) continue;

    if (!best || delta > best.lpDelta) {
      best = {
        playerId: p.id,
        gameName: p.gameName,
        tagLine: p.tagLine,
        riotId: p.riotId,
        lpDelta: delta,
        currentRank: p.currentRank,
        progressLabel: p.progressLabel,
      };
    }
  }

  return best;
}

export async function hasEnoughWeekData(): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const players = await listPlayers();
  for (const p of players) {
    const delta = await getLpDeltaSince(p.id, since);
    if (delta != null && delta !== 0) return true;
  }
  return players.some((p) => p.lpNet != null && p.lpNet !== 0);
}
