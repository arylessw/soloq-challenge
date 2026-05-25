import { PrismaClient } from "@prisma/client";

const LP_PER_DIVISION = 100;
const LP_PER_TIER = LP_PER_DIVISION * 4;
const TIER_ORDER = {
  IRON: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  EMERALD: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
};
const DIVISION_ORDER = { IV: 0, III: 1, II: 2, I: 3 };

function tierIndex(t) {
  return TIER_ORDER[t?.toUpperCase()] ?? 0;
}
function divisionIndex(d) {
  return DIVISION_ORDER[d?.toUpperCase()] ?? 0;
}

function rankToLpTotal(tier, division, lp) {
  const ti = tierIndex(tier);
  if (ti >= 7) return ti * LP_PER_TIER + lp;
  return ti * LP_PER_TIER + divisionIndex(division) * LP_PER_DIVISION + lp;
}

function computeLpProgress(start, current) {
  const lpNet =
    rankToLpTotal(current.tier, current.division, current.lp) -
    rankToLpTotal(start.tier, start.division, start.lp);
  return { lpGained: Math.max(0, lpNet), lpLost: Math.max(0, -lpNet), lpNet };
}

const prisma = new PrismaClient();
const players = await prisma.player.findMany();

for (const p of players) {
  if (!p.currentTier || p.currentDivision == null || p.currentLp == null) continue;

  const start = {
    tier: p.startTier,
    division: p.startDivision,
    lp: p.startLp,
  };
  const progress = computeLpProgress(start, {
    tier: p.currentTier,
    division: p.currentDivision,
    lp: p.currentLp,
  });

  await prisma.player.update({
    where: { id: p.id },
    data: { lpGained: progress.lpGained, lpLost: progress.lpLost },
  });

  const snapshots = await prisma.lpSnapshot.findMany({
    where: { playerId: p.id },
    orderBy: { recordedAt: "asc" },
  });

  for (const s of snapshots) {
    if (!s.tier || s.division == null || s.lp == null) continue;
    const snapNet = computeLpProgress(start, {
      tier: s.tier,
      division: s.division,
      lp: s.lp,
    }).lpNet;
    if (s.lpNet !== snapNet) {
      await prisma.lpSnapshot.update({
        where: { id: s.id },
        data: { lpNet: snapNet },
      });
    }
  }

  console.log(
    `${p.gameName}#${p.tagLine}: ${progress.lpNet >= 0 ? "+" : ""}${progress.lpNet} LP`
  );
}

await prisma.$disconnect();
