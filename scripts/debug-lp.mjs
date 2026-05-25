import { PrismaClient } from "@prisma/client";

const LP_PER_DIVISION = 100;
const TIER_ORDER = {
  IRON: 0, BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4,
  EMERALD: 5, DIAMOND: 6, MASTER: 7, GRANDMASTER: 8, CHALLENGER: 9,
};
const DIVISION_ORDER = { IV: 0, III: 1, II: 2, I: 3 };

function tierIndex(t) { return TIER_ORDER[t?.toUpperCase()] ?? 0; }
function divisionIndex(d) { return DIVISION_ORDER[d?.toUpperCase()] ?? 0; }

const LP_PER_TIER = LP_PER_DIVISION * 4;

function rankToLpTotal(tier, division, lp) {
  const ti = tierIndex(tier);
  if (ti >= 7) return ti * LP_PER_TIER + lp;
  return ti * LP_PER_TIER + divisionIndex(division) * LP_PER_DIVISION + lp;
}

function lpStep(from, to) {
  const fromTier = tierIndex(from.tier);
  const toTier = tierIndex(to.tier);
  const fromDiv = divisionIndex(from.division);
  const toDiv = divisionIndex(to.division);

  if (from.tier?.toUpperCase() === to.tier?.toUpperCase() && from.division?.toUpperCase() === to.division?.toUpperCase()) {
    const d = to.lp - from.lp;
    if (d >= 0) return { gained: d, lost: 0 };
    return { gained: 0, lost: -d };
  }
  if (fromTier === toTier && toDiv > fromDiv) {
    return { gained: (LP_PER_DIVISION - from.lp) + to.lp, lost: 0 };
  }
  if (fromTier === toTier && toDiv < fromDiv) {
    return { gained: to.lp, lost: from.lp };
  }
  const diff = rankToLpTotal(to.tier, to.division, to.lp) - rankToLpTotal(from.tier, from.division, from.lp);
  if (diff >= 0) return { gained: diff, lost: 0 };
  return { gained: 0, lost: -diff };
}

const prisma = new PrismaClient();
const players = await prisma.player.findMany();

for (const p of players) {
  const start = { tier: p.startTier, division: p.startDivision, lp: p.startLp };
  const cur = { tier: p.currentTier, division: p.currentDivision, lp: p.currentLp };
  const sim = lpStep(start, cur);
  const naive = (p.currentLp ?? 0) - p.startLp;
  const net = p.lpGained - p.lpLost;
  console.log(`\n${p.gameName}#${p.tagLine}`);
  console.log(`  start: ${p.startTier} ${p.startDivision} ${p.startLp} LP`);
  console.log(`  now:   ${p.currentTier} ${p.currentDivision} ${p.currentLp} LP`);
  console.log(`  DB: +${p.lpGained} / -${p.lpLost} (net ${net})`);
  console.log(`  sim start→now: +${sim.gained} / -${sim.lost}`);
  console.log(`  naive LP diff (same div only meaningful): ${naive}`);
}

await prisma.$disconnect();
