import { prisma } from "@/lib/db";
import { rankToScore } from "@/lib/ranks";

export const TEAMS = ["TEAM1", "TEAM2"] as const;
export type Team = (typeof TEAMS)[number];

export const TEAM_LABELS: Record<Team, string> = {
  TEAM1: "Équipe 1",
  TEAM2: "Équipe 2",
};

export type TeamCounts = Record<Team, number>;
export type TeamPowers = Record<Team, number>;

export function isValidTeam(value: string): value is Team {
  return TEAMS.includes(value as Team);
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

/** Somme des scores de rang de départ par équipe */
export async function getTeamStartPowers(
  excludePlayerId?: string
): Promise<TeamPowers> {
  const players = await prisma.player.findMany({
    where: excludePlayerId ? { id: { not: excludePlayerId } } : undefined,
    select: {
      team: true,
      startTier: true,
      startDivision: true,
      startLp: true,
    },
  });

  const powers: TeamPowers = { TEAM1: 0, TEAM2: 0 };
  for (const p of players) {
    const t = p.team as Team;
    if (t === "TEAM1" || t === "TEAM2") {
      powers[t] += rankToScore(p.startTier, p.startDivision, p.startLp);
    }
  }
  return powers;
}

/**
 * Équipes équilibrées : effectif (+1 max) ET puissance de rang de départ.
 * Tu rejoins une équipe seulement si, après inscription, sa puissance totale
 * de départ reste <= à l'autre équipe.
 */
export function canJoinTeam(
  team: Team,
  counts: TeamCounts,
  powers: TeamPowers,
  newStartScore: number
): boolean {
  const other: Team = team === "TEAM1" ? "TEAM2" : "TEAM1";
  const total = counts.TEAM1 + counts.TEAM2;

  if (total === 0) return true;

  if (counts[team] > counts[other]) return false;

  const afterTeam = powers[team] + newStartScore;
  const afterOther = powers[other];
  return afterTeam <= afterOther;
}

export function teamBlockReason(
  team: Team,
  counts: TeamCounts,
  powers: TeamPowers,
  newStartScore: number
): string | null {
  if (canJoinTeam(team, counts, powers, newStartScore)) return null;

  const other: Team = team === "TEAM1" ? "TEAM2" : "TEAM1";

  if (counts[team] > counts[other]) {
    return `${TEAM_LABELS[team]} a déjà un joueur de plus. Rejoins ${TEAM_LABELS[other]}.`;
  }

  const afterTeam = powers[team] + newStartScore;
  const afterOther = powers[other];
  return `${TEAM_LABELS[team]} serait trop forte en rang de départ (${afterTeam} vs ${afterOther} pts). Rejoins ${TEAM_LABELS[other]} pour équilibrer.`;
}
