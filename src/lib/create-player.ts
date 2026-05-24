import { prisma } from "@/lib/db";
import { seedInitialLpSnapshot } from "@/lib/lp-snapshots";
import { fetchAccount, fetchSoloQueue } from "@/lib/riot";
import {
  computeLpProgress,
  divisionRequired,
  isValidDivision,
  isValidTier,
} from "@/lib/ranks";

export type CreatePlayerInput = {
  gameName: string;
  tagLine: string;
  startTier: string;
  startDivision: string;
  startLp: number;
};

export class PlayerLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerLinkError";
  }
}

export async function createOrUpdatePlayer(
  input: CreatePlayerInput,
  linkUserId?: string
): Promise<{ id: string; linked: boolean }> {
  const gameName = input.gameName.trim();
  const tagLine = input.tagLine.trim();
  const startTier = input.startTier.trim().toUpperCase();
  const startDivision = input.startDivision.trim().toUpperCase();
  const startLp = Math.max(0, Math.min(100, input.startLp));

  if (!gameName || !tagLine) {
    throw new Error("Pseudo et tag requis");
  }
  if (!isValidTier(startTier)) {
    throw new Error("Rang de départ invalide");
  }
  if (divisionRequired(startTier) && !isValidDivision(startDivision)) {
    throw new Error("Division invalide");
  }

  const division = divisionRequired(startTier) ? startDivision : "I";

  let stats: {
    tier: string;
    division: string;
    lp: number;
    wins: number;
    losses: number;
    puuid: string;
    summonerId: string;
  };

  try {
    stats = await fetchSoloQueue(gameName, tagLine);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur Riot API";
    if (msg !== "UNRANKED") throw e;

    const account = await fetchAccount(gameName, tagLine);
    stats = {
      tier: startTier,
      division,
      lp: startLp,
      wins: 0,
      losses: 0,
      puuid: account.puuid,
      summonerId: account.puuid,
    };
  }

  const existing = await prisma.player.findUnique({
    where: { gameName_tagLine: { gameName, tagLine } },
    select: { id: true, userId: true, createdAt: true },
  });

  if (existing && linkUserId) {
    if (existing.userId && existing.userId !== linkUserId) {
      throw new PlayerLinkError(
        "Ce compte LoL est déjà relié à un autre profil site"
      );
    }
  }

  const initialLp = computeLpProgress(
    { tier: startTier, division, lp: startLp },
    { tier: stats.tier, division: stats.division, lp: stats.lp }
  );

  const userIdToSet =
    linkUserId && (!existing?.userId || existing.userId === linkUserId)
      ? linkUserId
      : undefined;

  const player = await prisma.player.upsert({
    where: { gameName_tagLine: { gameName, tagLine } },
    create: {
      gameName,
      tagLine,
      puuid: stats.puuid,
      summonerId: stats.summonerId,
      startTier,
      startDivision: division,
      startLp,
      currentTier: stats.tier,
      currentDivision: stats.division,
      currentLp: stats.lp,
      lpGained: initialLp.lpGained,
      lpLost: initialLp.lpLost,
      wins: stats.wins,
      losses: stats.losses,
      winsAtStart: stats.wins,
      lossesAtStart: stats.losses,
      lastSyncedAt: new Date(),
      userId: userIdToSet,
    },
    update: {
      puuid: stats.puuid,
      summonerId: stats.summonerId,
      currentTier: stats.tier,
      currentDivision: stats.division,
      currentLp: stats.lp,
      wins: stats.wins,
      losses: stats.losses,
      lastSyncedAt: new Date(),
      ...(userIdToSet ? { userId: userIdToSet } : {}),
    },
  });

  if (!existing) {
    await seedInitialLpSnapshot(player.id, player.createdAt);
  }

  return {
    id: player.id,
    linked: !!userIdToSet,
  };
}
