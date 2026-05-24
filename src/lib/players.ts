import { prisma } from "@/lib/db";
import {
  computeLpProgress,
  formatLpProgress,
  formatRank,
  rankToScore,
} from "@/lib/ranks";
import { parseChampionStats, type ChampionStat } from "@/lib/champion-stats";
import { formatStreak, type StreakType } from "@/lib/streak";

export type PlayerView = {
  id: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  startTier: string;
  startRank: string;
  currentTier: string | null;
  currentDivision: string | null;
  currentLp: number | null;
  currentRank: string | null;
  rankScore: number | null;
  lpNet: number | null;
  progressLabel: string | null;
  wins: number | null;
  losses: number | null;
  winrate: number | null;
  avgKda: number | null;
  kdaGames: number | null;
  lastGameAt: string | null;
  streakType: StreakType | null;
  streakCount: number;
  streakLabel: string | null;
  championStats: ChampionStat[];
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
  avgKda: number | null;
  kdaGames: number | null;
  lastGameAt: Date | null;
  streakType: string | null;
  streakCount: number;
  championStats: unknown;
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

  const streakType =
    p.streakType === "WIN" || p.streakType === "LOSS"
      ? p.streakType
      : null;

  return {
    id: p.id,
    gameName: p.gameName,
    tagLine: p.tagLine,
    riotId: `${p.gameName}#${p.tagLine}`,
    startTier: p.startTier,
    startRank: formatRank(p.startTier, p.startDivision, p.startLp),
    currentTier: p.currentTier,
    currentDivision: p.currentDivision,
    currentLp: p.currentLp,
    currentRank: hasCurrent
      ? formatRank(p.currentTier!, p.currentDivision!, p.currentLp!)
      : null,
    rankScore: hasCurrent
      ? rankToScore(p.currentTier!, p.currentDivision!, p.currentLp!)
      : null,
    lpNet,
    progressLabel,
    wins: p.wins,
    losses: p.losses,
    winrate,
    avgKda: p.avgKda,
    kdaGames: p.kdaGames,
    lastGameAt: p.lastGameAt?.toISOString() ?? null,
    streakType,
    streakCount: p.streakCount,
    streakLabel: formatStreak(streakType, p.streakCount),
    championStats: parseChampionStats(p.championStats),
    lastSyncedAt: p.lastSyncedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getPlayerById(id: string): Promise<PlayerView | null> {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return null;
  return toView(player);
}

export async function listPlayers(): Promise<PlayerView[]> {
  const players = await prisma.player.findMany({
    orderBy: { createdAt: "asc" },
  });
  return players.map(toView);
}

export { toView };
