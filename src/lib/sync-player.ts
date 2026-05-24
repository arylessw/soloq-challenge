import { prisma } from "@/lib/db";
import { computeChampionStats } from "@/lib/champion-stats";
import { computeAvgKda } from "@/lib/kda";
import { recordLpSnapshot, seedInitialLpSnapshot } from "@/lib/lp-snapshots";
import { computeLpProgress } from "@/lib/ranks";
import { computeStreak } from "@/lib/streak";
import { fetchAccount, fetchSoloQueue } from "@/lib/riot";
import { fetchRecentRankedMatches, MATCH_HISTORY_COUNT } from "@/lib/riot-matches";

const MATCH_STATS_REFRESH_MS = 30 * 60 * 1000;

async function refreshMatchStats(
  playerId: string,
  puuid: string,
  createdAt: Date,
  lastKdaSyncedAt: Date | null
): Promise<void> {
  if (
    lastKdaSyncedAt &&
    Date.now() - lastKdaSyncedAt.getTime() < MATCH_STATS_REFRESH_MS
  ) {
    return;
  }

  try {
    const sinceEpochSec = Math.floor(createdAt.getTime() / 1000);
    const matches = await fetchRecentRankedMatches(puuid, {
      count: MATCH_HISTORY_COUNT,
      sinceEpochSec,
    });

    const kdaStats = computeAvgKda(matches);
    const streak = computeStreak(matches);
    const championStats = computeChampionStats(matches);
    const lastGameAt =
      matches.length > 0
        ? new Date(Math.max(...matches.map((m) => m.gameCreation)))
        : null;

    await prisma.player.update({
      where: { id: playerId },
      data: {
        avgKda: kdaStats?.avgKda ?? null,
        kdaGames: kdaStats?.games ?? null,
        lastGameAt,
        streakType: streak?.type ?? null,
        streakCount: streak?.count ?? 0,
        championStats: championStats.length > 0 ? championStats : undefined,
        lastKdaSyncedAt: new Date(),
      },
    });
  } catch {
    // Stats match optionnelles — ne bloque pas la sync rang
  }
}

export async function syncPlayerById(id: string): Promise<{ ok: boolean; error?: string }> {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return { ok: false, error: "Joueur introuvable" };

  try {
    const stats = await fetchSoloQueue(player.gameName, player.tagLine);

    const progress = computeLpProgress(
      {
        tier: player.startTier,
        division: player.startDivision,
        lp: player.startLp,
      },
      {
        tier: stats.tier,
        division: stats.division,
        lp: stats.lp,
      }
    );
    const { lpGained, lpLost } = progress;

    await prisma.player.update({
      where: { id },
      data: {
        puuid: stats.puuid,
        summonerId: stats.summonerId,
        currentTier: stats.tier,
        currentDivision: stats.division,
        currentLp: stats.lp,
        lpGained,
        lpLost,
        wins: stats.wins,
        losses: stats.losses,
        lastSyncedAt: new Date(),
      },
    });

    await seedInitialLpSnapshot(id, player.createdAt);
    await recordLpSnapshot(id, {
      startTier: player.startTier,
      startDivision: player.startDivision,
      startLp: player.startLp,
      currentTier: stats.tier,
      currentDivision: stats.division,
      currentLp: stats.lp,
    });

    await refreshMatchStats(
      id,
      stats.puuid,
      player.createdAt,
      player.lastKdaSyncedAt
    );

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";

    if (msg === "UNRANKED") {
      try {
        const account = await fetchAccount(player.gameName, player.tagLine);
        await prisma.player.update({
          where: { id },
          data: {
            puuid: account.puuid,
            summonerId: account.puuid,
            lastSyncedAt: new Date(),
          },
        });
        await refreshMatchStats(
          id,
          account.puuid,
          player.createdAt,
          player.lastKdaSyncedAt
        );
        return { ok: true };
      } catch (inner) {
        return {
          ok: false,
          error: inner instanceof Error ? inner.message : "Erreur",
        };
      }
    }

    return { ok: false, error: msg };
  }
}
