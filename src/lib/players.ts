import { prisma } from "@/lib/db";
import { compareTierOnly, formatLpProgress, formatRank } from "@/lib/ranks";

export type PlayerView = {
  id: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  startRank: string;
  currentRank: string | null;
  lpGained: number;
  lpLost: number;
  progressLabel: string | null;
  wins: number | null;
  losses: number | null;
  winrate: number | null;
  lastSyncedAt: string | null;
  createdAt: string;
};

function toView(p: {
  id: string;
  gameName: string;
  tagLine: string;
  startTier: string;
  startDivision: string;
  startLp: number;
  currentTier: string | null;
  currentDivision: string | null;
  currentLp: number | null;
  lpGained: number;
  lpLost: number;
  wins: number | null;
  losses: number | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
}): PlayerView {
  const hasCurrent =
    p.currentTier && p.currentDivision != null && p.currentLp != null;

  const progressLabel = formatLpProgress(p.lpGained, p.lpLost);

  const totalGames = (p.wins ?? 0) + (p.losses ?? 0);
  const winrate =
    totalGames > 0 && p.wins != null
      ? Math.round((p.wins / totalGames) * 100)
      : null;

  return {
    id: p.id,
    gameName: p.gameName,
    tagLine: p.tagLine,
    riotId: `${p.gameName}#${p.tagLine}`,
    startRank: formatRank(p.startTier, p.startDivision, p.startLp),
    currentRank: hasCurrent
      ? formatRank(p.currentTier!, p.currentDivision!, p.currentLp!)
      : null,
    lpGained: p.lpGained,
    lpLost: p.lpLost,
    progressLabel,
    wins: p.wins,
    losses: p.losses,
    winrate,
    lastSyncedAt: p.lastSyncedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

function playerLpNet(p: { lpGained: number; lpLost: number }): number {
  return p.lpGained - p.lpLost;
}

export async function listPlayers(): Promise<PlayerView[]> {
  const players = await prisma.player.findMany();

  players.sort((a, b) => {
    const tierA = a.currentTier;
    const tierB = b.currentTier;

    if (tierA && tierB) {
      const tierCmp = compareTierOnly(tierB, tierA);
      if (tierCmp !== 0) return tierCmp;
    } else if (tierB && !tierA) return 1;
    else if (tierA && !tierB) return -1;

    return playerLpNet(b) - playerLpNet(a);
  });

  return players.map(toView);
}

export { toView };
