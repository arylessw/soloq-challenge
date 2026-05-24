import type { RawMatchForPlayer } from "@/lib/riot-matches";
import { gameKdaRatio } from "@/lib/kda";

export type ChampionStat = {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  winrate: number;
  avgKda: number;
};

export function championIconUrl(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${championName}.png`;
}

export function computeChampionStats(
  matches: RawMatchForPlayer[]
): ChampionStat[] {
  const map = new Map<
    string,
    {
      championId: number;
      games: number;
      wins: number;
      kdaSum: number;
    }
  >();

  for (const m of matches) {
    const key = m.championName;
    const entry = map.get(key) ?? {
      championId: m.championId,
      games: 0,
      wins: 0,
      kdaSum: 0,
    };
    entry.games += 1;
    if (m.win) entry.wins += 1;
    entry.kdaSum += gameKdaRatio(m.kills, m.deaths, m.assists);
    map.set(key, entry);
  }

  return [...map.entries()]
    .map(([championName, s]) => ({
      championId: s.championId,
      championName,
      games: s.games,
      wins: s.wins,
      winrate: Math.round((s.wins / s.games) * 100),
      avgKda: Math.round((s.kdaSum / s.games) * 100) / 100,
    }))
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate);
}

export function pickMainChampion(stats: ChampionStat[]): ChampionStat | null {
  return stats[0] ?? null;
}

export function parseChampionStats(raw: unknown): ChampionStat[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ChampionStat =>
      typeof item === "object" &&
      item != null &&
      typeof (item as ChampionStat).championName === "string" &&
      typeof (item as ChampionStat).games === "number"
  );
}
