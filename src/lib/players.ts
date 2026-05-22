import { prisma } from "@/lib/db";
import { computeLpProgress, formatLpProgress, formatRank } from "@/lib/ranks";

export type PlayerView = {
  id: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  startRank: string;
  currentRank: string | null;
  lpNet: number | null;
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

  let lpNet: number | null = null;
  let progressLabel: string | null = null;

  if (hasCurrent) {
    const progress = computeLpProgress(
      {
        tier: p.startTier,
        division: p.startDivision,
        lp: p.startLp,
      },
      {
        tier: p.currentTier!,
        division: p.currentDivision!,
        lp: p.currentLp!,
      }
    );
    lpNet = progress.lpNet;
    progressLabel = formatLpProgress(lpNet);
  }

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
    lpNet,
    progressLabel,
    wins: p.wins,
    losses: p.losses,
    winrate,
    lastSyncedAt: p.lastSyncedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

function playerLpNet(p: {
  startTier: string;
  startDivision: string;
  startLp: number;
  currentTier: string | null;
  currentDivision: string | null;
  currentLp: number | null;
}): number {
  if (!p.currentTier || p.currentDivision == null || p.currentLp == null) {
    return -9999;
  }
  return computeLpProgress(
    { tier: p.startTier, division: p.startDivision, lp: p.startLp },
    { tier: p.currentTier, division: p.currentDivision, lp: p.currentLp }
  ).lpNet;
}

export async function getPlayerById(id: string): Promise<PlayerView | null> {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return null;
  return toView(player);
}

export async function listPlayers(): Promise<PlayerView[]> {
  const players = await prisma.player.findMany();

  players.sort((a, b) => playerLpNet(b) - playerLpNet(a));

  return players.map(toView);
}

export { toView };
