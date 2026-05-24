import type { RawMatchForPlayer } from "@/lib/riot-matches";

export type StreakType = "WIN" | "LOSS";

export function computeStreak(
  matches: RawMatchForPlayer[]
): { type: StreakType; count: number } | null {
  if (matches.length === 0) return null;

  const sorted = [...matches].sort((a, b) => b.gameCreation - a.gameCreation);
  const streakWin = sorted[0].win;
  let count = 0;

  for (const m of sorted) {
    if (m.win === streakWin) count++;
    else break;
  }

  return count > 0 ? { type: streakWin ? "WIN" : "LOSS", count } : null;
}

export function formatStreak(type: StreakType | null, count: number): string | null {
  if (!type || count <= 0) return null;
  return type === "WIN" ? `${count}V d'affilée` : `${count}D d'affilée`;
}
