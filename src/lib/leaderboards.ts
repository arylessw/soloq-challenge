import type { PlayerView } from "@/lib/players";
import { rankToScore } from "@/lib/ranks";
import { formatKdaValue } from "@/lib/kda";

export type LeaderboardId = "lp" | "rank" | "winrate" | "kda";

export type LeaderboardMeta = {
  id: LeaderboardId;
  label: string;
  shortLabel: string;
  description: string;
  metricLabel: string;
};

export const LEADERBOARDS: LeaderboardMeta[] = [
  {
    id: "lp",
    label: "Progression LP",
    shortLabel: "LP",
    description: "Plus de LP gagnés depuis le rang de départ",
    metricLabel: "Progression",
  },
  {
    id: "rank",
    label: "Rang actuel",
    shortLabel: "Rang",
    description: "Le plus haut rang SoloQ actuel",
    metricLabel: "Rang",
  },
  {
    id: "winrate",
    label: "Winrate",
    shortLabel: "WR",
    description: "Meilleur ratio de victoires (saison SoloQ)",
    metricLabel: "Winrate",
  },
  {
    id: "kda",
    label: "KDA moyen",
    shortLabel: "KDA",
    description: "KDA moyen sur les parties ranked depuis l'inscription",
    metricLabel: "KDA",
  },
];

function rankScore(p: PlayerView): number {
  if (!p.currentTier || p.currentDivision == null || p.currentLp == null) {
    return -1;
  }
  return rankToScore(p.currentTier, p.currentDivision, p.currentLp);
}

function sortKey(p: PlayerView, id: LeaderboardId): number {
  switch (id) {
    case "lp":
      return p.lpNet ?? -99999;
    case "rank":
      return rankScore(p);
    case "winrate":
      return p.winrate ?? -1;
    case "kda":
      return p.avgKda ?? -1;
  }
}

export function sortPlayersForBoard(
  players: PlayerView[],
  id: LeaderboardId
): PlayerView[] {
  return [...players].sort((a, b) => sortKey(b, id) - sortKey(a, id));
}

export function formatMetric(p: PlayerView, id: LeaderboardId): string {
  switch (id) {
    case "lp":
      return p.progressLabel && p.lpNet !== 0 ? p.progressLabel : "—";
    case "rank":
      return p.currentRank ?? "—";
    case "winrate":
      return p.winrate != null ? `${p.winrate}%` : "—";
    case "kda":
      return p.avgKda != null ? formatKdaValue(p.avgKda) : "—";
  }
}

export function metricTone(
  p: PlayerView,
  id: LeaderboardId
): "positive" | "negative" | "neutral" {
  if (id === "lp" && p.lpNet != null && p.lpNet !== 0) {
    return p.lpNet > 0 ? "positive" : "negative";
  }
  if (id === "winrate" && p.winrate != null) {
    if (p.winrate >= 55) return "positive";
    if (p.winrate < 45) return "negative";
  }
  if (id === "kda" && p.avgKda != null) {
    if (p.avgKda >= 3) return "positive";
    if (p.avgKda < 2) return "negative";
  }
  return "neutral";
}

export function metricSubtext(p: PlayerView, id: LeaderboardId): string | null {
  switch (id) {
    case "lp":
      return p.currentRank;
    case "rank":
      return p.lpNet != null && p.lpNet !== 0 ? p.progressLabel : null;
    case "winrate":
      return p.wins != null && p.losses != null
        ? `${p.wins}V / ${p.losses}D`
        : null;
    case "kda":
      return p.kdaGames != null && p.kdaGames > 0
        ? `${p.kdaGames} partie${p.kdaGames > 1 ? "s" : ""}`
        : null;
  }
}
