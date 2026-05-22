import { prisma } from "@/lib/db";
import { fetchAccount, fetchSoloQueue } from "@/lib/riot";
import { lpStepFromSnapshots } from "@/lib/ranks";

export async function syncPlayerById(id: string): Promise<{ ok: boolean; error?: string }> {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) return { ok: false, error: "Joueur introuvable" };

  try {
    const stats = await fetchSoloQueue(player.gameName, player.tagLine);

    const toSnapshot = {
      tier: stats.tier,
      division: stats.division,
      lp: stats.lp,
    };

    let lpGained = player.lpGained;
    let lpLost = player.lpLost;

    if (lpGained === 0 && lpLost === 0) {
      const step = lpStepFromSnapshots(
        {
          tier: player.startTier,
          division: player.startDivision,
          lp: player.startLp,
        },
        toSnapshot
      );
      lpGained = step.gained;
      lpLost = step.lost;
    } else if (
      player.currentTier &&
      player.currentDivision != null &&
      player.currentLp != null
    ) {
      const step = lpStepFromSnapshots(
        {
          tier: player.currentTier,
          division: player.currentDivision,
          lp: player.currentLp,
        },
        toSnapshot
      );
      lpGained += step.gained;
      lpLost += step.lost;
    }

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
