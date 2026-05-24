import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const players = await prisma.player.findMany({
  select: {
    gameName: true,
    tagLine: true,
    startTier: true,
    startDivision: true,
    startLp: true,
    currentTier: true,
    currentDivision: true,
    currentLp: true,
  },
});

for (const p of players) {
  const lpDelta = (p.currentLp ?? 0) - p.startLp;
  console.log(
    `${p.gameName}#${p.tagLine}`,
    `start ${p.startTier} ${p.startDivision} ${p.startLp} LP`,
    `→ now ${p.currentTier} ${p.currentDivision} ${p.currentLp} LP`,
    `delta=${lpDelta}`
  );
}

await prisma.$disconnect();
