import { prisma } from "@/lib/db";
import { computeChampionStats } from "@/lib/champion-stats";
import { computeAvgKda } from "@/lib/kda";
import { recordLpSnapshot, seedInitialLpSnapshot } from "@/lib/lp-snapshots";
import { computeRoleStats } from "@/lib/role-stats";
import { computeLpProgress } from "@/lib/ranks";
import { fetchInGame } from "@/lib/riot-spectator";
import { computeStreak } from "@/lib/streak";
import {
  fetchAccount,
  fetchAccountByPuuid,
  fetchSoloQueue,
  fetchSoloQueueByPuuid,
  type SoloQueueStats,
} from "@/lib/riot";
import { fetchRecentRankedMatches, MATCH_HISTORY_COUNT } from "@/lib/riot-matches";

export const MATCH_STATS_REFRESH_MS = 30 * 60 * 1000;

/** Erreurs où re-tenter par Riot ID est inutile (globales, pas liées au puuid). */
function isGlobalRiotError(msg: string): boolean {
  return (
    msg === "UNRANKED" ||
    msg.includes("refusée") ||
    msg.includes("Accès refusé") ||
    msg.includes("Limite API")
  );
}

/** Met à jour le Riot ID stocké si le joueur s'est renommé (puuid immuable). */
async function refreshRiotId(playerId: string, puuid: string): Promise<void> {
  try {
    const account = await fetchAccountByPuuid(puuid);
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { gameName: true, tagLine: true },
    });
    if (
      player &&
      account.gameName &&
      account.tagLine &&
      (player.gameName !== account.gameName ||
        player.tagLine !== account.tagLine)
    ) {
      await prisma.player.update({
        where: { id: playerId },
        data: { gameName: account.gameName, tagLine: account.tagLine },
      });
    }
  } catch {
    // Rafraîchissement du nom optionnel — ne bloque jamais la sync
  }
}

async function refreshPresence(playerId: string, puuid: string): Promise<void> {
  try {
    const inGame = await fetchInGame(puuid);
    await prisma.player.update({
      where: { id: playerId },
      data: { inGame },
    });
  } catch {
    // Présence optionnelle
  }
}

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
    const roleStats = computeRoleStats(matches);
    const lastGameAt =
      matches.length > 0
        ? new Date(Math.max(...matches.map((m) => m.gameEndMs)))
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
        roleStats: roleStats.length > 0 ? roleStats : undefined,
        lastKdaSyncedAt: new Date(),
      },
    });
  } catch {
    // Stats match optionnelles — ne bloque pas la sync rang
  }
}

export async function syncPlayerById(
  id: string,
  opts: { matchStats?: boolean } = {}
): Promise<{ ok: boolean; error?: string }> {
  const allowMatchStats = opts.matchStats ?? true;
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return { ok: false, error: "Joueur introuvable" };

  try {
    // Voie robuste : le puuid stocké survit aux renommages de Riot ID.
    // Le Riot ID ne sert de recours que si le puuid manque ou est corrompu.
    let stats: SoloQueueStats;
    if (player.puuid) {
      try {
        stats = await fetchSoloQueueByPuuid(player.puuid);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur";
        if (isGlobalRiotError(msg)) throw e;
        stats = await fetchSoloQueue(player.gameName, player.tagLine);
      }
    } else {
      stats = await fetchSoloQueue(player.gameName, player.tagLine);
    }

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

    const matchStatsDue =
      !player.lastKdaSyncedAt ||
      Date.now() - player.lastKdaSyncedAt.getTime() >= MATCH_STATS_REFRESH_MS;

    await Promise.all([
      allowMatchStats
        ? refreshMatchStats(id, stats.puuid, player.createdAt, player.lastKdaSyncedAt)
        : Promise.resolve(),
      allowMatchStats && matchStatsDue
        ? refreshRiotId(id, stats.puuid)
        : Promise.resolve(),
      refreshPresence(id, stats.puuid),
    ]);

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";

    if (msg === "UNRANKED") {
      try {
        const puuid =
          player.puuid ??
          (await fetchAccount(player.gameName, player.tagLine)).puuid;
        await prisma.player.update({
          where: { id },
          data: {
            puuid,
            summonerId: puuid,
            lastSyncedAt: new Date(),
          },
        });
        await Promise.all([
          allowMatchStats
            ? refreshMatchStats(id, puuid, player.createdAt, player.lastKdaSyncedAt)
            : Promise.resolve(),
          refreshPresence(id, puuid),
        ]);
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
