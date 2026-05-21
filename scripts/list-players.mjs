import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const players = await prisma.player.findMany({
  select: { id: true, gameName: true, tagLine: true },
});
console.log(JSON.stringify(players, null, 2));
await prisma.$disconnect();
