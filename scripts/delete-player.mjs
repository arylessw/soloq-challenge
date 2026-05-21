import { PrismaClient } from "@prisma/client";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/delete-player.mjs <id>");
  process.exit(1);
}

const prisma = new PrismaClient();
await prisma.player.delete({ where: { id } });
console.log("Joueur supprimé:", id);
await prisma.$disconnect();
