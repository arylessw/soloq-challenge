import type { PlayerView } from "@/lib/players";
import { roleLabel, type RoleId } from "@/lib/role-stats";

export type RoleSlice = {
  role: RoleId;
  label: string;
  games: number;
  pct: number;
};

export type GroupStats = {
  playerCount: number;
  totalGames: number;
  avgWinrate: number | null;
  avgKda: number | null;
  topChampion: { name: string; games: number; winrate: number } | null;
  roleDistribution: RoleSlice[];
};

/**
 * Agrégat des stats du défi à partir des joueurs déjà chargés.
 * Aucune requête supplémentaire : exploite championStats / roleStats persistés.
 */
export function getGroupStats(players: PlayerView[]): GroupStats | null {
  if (players.length === 0) return null;

  const champ = new Map<string, { games: number; wins: number }>();
  const role = new Map<RoleId, number>();
  let totalGames = 0;

  for (const p of players) {
    for (const c of p.championStats) {
      const e = champ.get(c.championName) ?? { games: 0, wins: 0 };
      e.games += c.games;
      e.wins += c.wins;
      champ.set(c.championName, e);
      totalGames += c.games;
    }
    for (const r of p.roleStats) {
      role.set(r.role, (role.get(r.role) ?? 0) + r.games);
    }
  }

  const wrValues = players
    .map((p) => p.winrate)
    .filter((v): v is number => v != null);
  const kdaValues = players
    .map((p) => p.avgKda)
    .filter((v): v is number => v != null);

  const avgWinrate = wrValues.length
    ? Math.round(wrValues.reduce((a, b) => a + b, 0) / wrValues.length)
    : null;
  const avgKda = kdaValues.length
    ? Math.round((kdaValues.reduce((a, b) => a + b, 0) / kdaValues.length) * 100) /
      100
    : null;

  let topChampion: GroupStats["topChampion"] = null;
  for (const [name, e] of champ) {
    if (!topChampion || e.games > topChampion.games) {
      topChampion = {
        name,
        games: e.games,
        winrate: Math.round((e.wins / e.games) * 100),
      };
    }
  }

  const roleTotal = [...role.values()].reduce((a, b) => a + b, 0);
  const roleDistribution: RoleSlice[] = [...role.entries()]
    .map(([r, games]) => ({
      role: r,
      label: roleLabel(r),
      games,
      pct: roleTotal ? Math.round((games / roleTotal) * 100) : 0,
    }))
    .sort((a, b) => b.games - a.games);

  return {
    playerCount: players.length,
    totalGames,
    avgWinrate,
    avgKda,
    topChampion,
    roleDistribution,
  };
}
