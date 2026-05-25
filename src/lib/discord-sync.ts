import { listPlayers } from "@/lib/players";
import {
  notifyDiscordNewLeader,
  notifyDiscordRankUp,
  isDiscordConfigured,
} from "@/lib/discord";

type PlayerSnap = {
  id: string;
  riotId: string;
  currentRank: string | null;
  rankScore: number | null;
  lpNet: number | null;
};

function snapPlayers(): Promise<PlayerSnap[]> {
  return listPlayers().then((list) =>
    list.map((p) => ({
      id: p.id,
      riotId: p.riotId,
      currentRank: p.currentRank,
      rankScore: p.rankScore,
      lpNet: p.lpNet,
    }))
  );
}

function leaderId(players: PlayerSnap[]): string | null {
  let best: PlayerSnap | null = null;
  for (const p of players) {
    if (p.lpNet == null) continue;
    if (!best || (p.lpNet ?? -999) > (best.lpNet ?? -999)) best = p;
  }
  return best?.id ?? null;
}

export async function capturePreSyncSnapshot(): Promise<PlayerSnap[]> {
  return snapPlayers();
}

export async function notifyDiscordAfterSync(
  before: PlayerSnap[]
): Promise<void> {
  if (!isDiscordConfigured()) return;

  const after = await snapPlayers();
  const beforeMap = new Map(before.map((p) => [p.id, p]));

  for (const p of after) {
    const prev = beforeMap.get(p.id);
    if (!prev || !p.currentRank || !prev.currentRank) continue;
    const oldScore = prev.rankScore ?? -1;
    const newScore = p.rankScore ?? -1;
    if (newScore > oldScore && p.currentRank !== prev.currentRank) {
      await notifyDiscordRankUp(
        p.riotId,
        prev.currentRank,
        p.currentRank,
        p.id
      );
    }
  }

  const prevLeader = leaderId(before);
  const nextLeader = leaderId(after);
  if (nextLeader && nextLeader !== prevLeader) {
    const leader = after.find((p) => p.id === nextLeader);
    if (leader && leader.lpNet != null) {
      await notifyDiscordNewLeader(leader.riotId, leader.lpNet, leader.id);
    }
  }
}
