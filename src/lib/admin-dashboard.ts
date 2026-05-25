import { prisma } from "@/lib/db";
import { isDiscordConfigured } from "@/lib/discord";
import { listPlayers } from "@/lib/players";

export type AdminDashboard = {
  stats: {
    players: number;
    users: number;
    duelsActive: number;
    duelsFinished: number;
    discordConfigured: boolean;
  };
  users: Array<{
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    playerCount: number;
  }>;
  duels: Array<{
    id: string;
    status: string;
    metric: string;
    playerA: string;
    playerB: string;
    endsAt: string;
    winnerId: string | null;
  }>;
  players: Awaited<ReturnType<typeof listPlayers>>;
};

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const [players, userRows, duelsActive, duelsFinished, userCount, duels] =
    await Promise.all([
      listPlayers(),
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          _count: { select: { players: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.duel.count({ where: { status: "active" } }),
      prisma.duel.count({ where: { status: "finished" } }),
      prisma.user.count(),
      prisma.duel.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          playerA: { select: { gameName: true, tagLine: true } },
          playerB: { select: { gameName: true, tagLine: true } },
        },
      }),
    ]);

  return {
    stats: {
      players: players.length,
      users: userCount,
      duelsActive,
      duelsFinished,
      discordConfigured: isDiscordConfigured(),
    },
    users: userRows.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      createdAt: u.createdAt.toISOString(),
      playerCount: u._count.players,
    })),
    duels: duels.map((d) => ({
      id: d.id,
      status: d.status,
      metric: d.metric,
      playerA: `${d.playerA.gameName}#${d.playerA.tagLine}`,
      playerB: `${d.playerB.gameName}#${d.playerB.tagLine}`,
      endsAt: d.endsAt.toISOString(),
      winnerId: d.winnerId,
    })),
    players,
  };
}
