import { prisma } from "@/lib/db";
import {
  compareTierOnly,
  formatRank,
  progressBetween,
  tierIndex,
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

    const tierGap =
      tierIndex(p.currentTier!) - tierIndex(p.startTier);
    if (tierGap !== 0) {
      const n = Math.abs(tierGap);
      progressLabel =
        tierGap > 0
          ? `+${n} rank${n > 1 ? "s" : ""}`
          : `-${n} rank${n > 1 ? "s" : ""}`;
    } else {
      progressLabel =
        progress >= 0 ? `+${progress} pts` : `${progress} pts`;
    }
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

    return playerProgress(b) - playerProgress(a);
  });

  return players.map(toView);
}

export { toView };
