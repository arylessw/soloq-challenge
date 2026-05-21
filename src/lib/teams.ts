import { prisma } from "@/lib/db";

export const TEAMS = ["TEAM1", "TEAM2"] as const;
export type Team = (typeof TEAMS)[number];

export const TEAM_LABELS: Record<Team, string> = {
  TEAM1: "Équipe 1",
  TEAM2: "Équipe 2",
};

export type TeamCounts = Record<Team, number>;

export function isValidTeam(value: string): value is Team {
  return TEAMS.includes(value as Team);
}

export function canJoinTeam(team: Team, counts: TeamCounts): boolean {
  if (team === "TEAM1") return counts.TEAM1 <= counts.TEAM2;
  return counts.TEAM2 <= counts.TEAM1;
}

export function teamBlockReason(team: Team, counts: TeamCounts): string | null {
  if (canJoinTeam(team, counts)) return null;
  const other = team === "TEAM1" ? TEAM_LABELS.TEAM2 : TEAM_LABELS.TEAM1;
  return `${TEAM_LABELS[team]} est pleine (+1 joueur). Rejoins ${other} pour équilibrer.`;
}

export async function getTeamCounts(
  excludePlayerId?: string
): Promise<TeamCounts> {
  const players = await prisma.player.findMany({
    where: excludePlayerId ? { id: { not: excludePlayerId } } : undefined,
    select: { team: true },
  });
  return {
    TEAM1: players.filter((p) => p.team === "TEAM1").length,
    TEAM2: players.filter((p) => p.team === "TEAM2").length,
  };
}
