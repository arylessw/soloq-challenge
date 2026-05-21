import { prisma } from "@/lib/db";
import {
  compareRankHierarchy,
  formatRank,
  progressBetween,
  rankToScore,
} from "@/lib/ranks";

export type PlayerView = {
  id: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  startRank: string;
  currentRank: string | null;
  progress: number | null;
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
  wins: number | null;
  losses: number | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
}): PlayerView {
  const hasCurrent =
    p.currentTier && p.currentDivision != null && p.currentLp != null;

  let progress: number | null = null;
  let progressLabel: string | null = null;

  if (hasCurrent) {
    progress = progressBetween(
      p.startTier,
      p.startDivision,
      p.startLp,
      p.currentTier!,
      p.currentDivision!,
      p.currentLp!
    );
    progressLabel =
      progress >= 0 ? `+${progress} pts` : `${progress} pts`;
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
    progress,
    progressLabel,
    wins: p.wins,
    losses: p.losses,
    winrate,
    lastSyncedAt: p.lastSyncedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

function playerProgress(p: {
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
  return progressBetween(
    p.startTier,
    p.startDivision,
    p.startLp,
    p.currentTier,
    p.currentDivision,
    p.currentLp
  );
}

function currentRankScore(p: {
  currentTier: string | null;
  currentDivision: string | null;
  currentLp: number | null;
}): number {
  if (!p.currentTier || p.currentDivision == null || p.currentLp == null) {
    return -1;
  }
  return rankToScore(p.currentTier, p.currentDivision, p.currentLp);
}

export async function listPlayers(): Promise<PlayerView[]> {
  const players = await prisma.player.findMany();

  players.sort((a, b) => {
    const scoreA = currentRankScore(a);
    const scoreB = currentRankScore(b);

    // 1. Rang actuel d'abord (Or > Argent > … même à -500000 pts de progression)
    if (scoreA >= 0 && scoreB >= 0 && scoreA !== scoreB) {
      return compareRankHierarchy(
        b.currentTier!,
        b.currentDivision!,
        b.currentLp!,
        a.currentTier!,
        a.currentDivision!,
        a.currentLp!
      );
    }
    if (scoreB !== scoreA) return scoreB - scoreA;

    // 2. Même palier : progression
    return playerProgress(b) - playerProgress(a);
  });

  return players.map(toView);
}

export { toView };
