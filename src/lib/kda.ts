import type { RawMatchForPlayer } from "@/lib/riot-matches";

export function gameKdaRatio(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
}

export function computeAvgKda(matches: RawMatchForPlayer[]): {
  avgKda: number;
  games: number;
} | null {
  if (matches.length === 0) return null;

  let sum = 0;
  for (const m of matches) {
    sum += gameKdaRatio(m.kills, m.deaths, m.assists);
  }

  return {
    avgKda: Math.round((sum / matches.length) * 100) / 100,
    games: matches.length,
  };
}

export function formatKdaValue(avg: number): string {
  if (avg >= 10) return avg.toFixed(1);
  return avg.toFixed(2);
}
