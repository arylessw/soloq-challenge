import { prisma } from "@/lib/db";
import {
  capturePreSyncSnapshot,
  notifyDiscordAfterSync,
} from "@/lib/discord-sync";
import { MATCH_STATS_REFRESH_MS, syncPlayerById } from "@/lib/sync-player";

export type SyncResult = {
  id: string;
  ok: boolean;
  error?: string;
};

/** Marge avant le timeout serverless (maxDuration 60 s sur la route). */
const TIME_BUDGET_MS = 45_000;
const DELAY_BETWEEN_PLAYERS_MS = 400;
/** Max de syncs « lourdes » (historique de matchs, ~21 appels) par passage. */
const MAX_MATCH_REFRESH_PER_RUN = 3;

export async function syncAllPlayers(): Promise<{
  synced: number;
  results: SyncResult[];
  at: string;
}> {
  // Les joueurs jamais synchronisés ou les plus anciens passent en premier :
  // même si le passage est interrompu (timeout, 429), tout le monde finit
  // par tourner sur les passages suivants.
  const players = await prisma.player.findMany({
    orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
  });
  const before = await capturePreSyncSnapshot();
  const results: SyncResult[] = [];
  const deadline = Date.now() + TIME_BUDGET_MS;
  let heavyUsed = 0;

  for (const player of players) {
    if (Date.now() > deadline) break;

    const matchStatsDue =
      !player.lastKdaSyncedAt ||
      Date.now() - player.lastKdaSyncedAt.getTime() >= MATCH_STATS_REFRESH_MS;
    const allowHeavy = !matchStatsDue || heavyUsed < MAX_MATCH_REFRESH_PER_RUN;
    if (matchStatsDue && allowHeavy) heavyUsed++;

    const result = await syncPlayerById(player.id, { matchStats: allowHeavy });
    results.push({ id: player.id, ...result });

    // Rate limit Riot atteint : inutile d'insister, les joueurs restants
    // repasseront en tête au prochain passage (lastSyncedAt inchangé).
    if (result.error?.includes("Limite API")) break;

    if (players.length > 1) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_PLAYERS_MS));
    }
  }

  try {
    await notifyDiscordAfterSync(before);
  } catch (e) {
    console.error("[sync-all] Discord notify", e);
  }

  return {
    synced: results.filter((r) => r.ok).length,
    results,
    at: new Date().toISOString(),
  };
}
