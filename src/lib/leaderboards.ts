import type { PlayerView } from "@/lib/players";
import { MIN_GAMES_FOR_RANKING } from "@/lib/role-stats";
import { rankToScore } from "@/lib/ranks";
import { formatKdaValue } from "@/lib/kda";

export type LeaderboardId =
  | "lp"
  | "rank"
  | "winrate"
  | "kda"
  | "champion"
  | "role";

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
  {
    id: "champion",
    label: "Main champion",
    shortLabel: "Champ",
    description: `Meilleur winrate sur le champion le plus joué (min. ${MIN_GAMES_FOR_RANKING} parties)`,
    metricLabel: "WR main",
  },
  {
    id: "role",
    label: "Main rôle",
    shortLabel: "Rôle",
    description: `Meilleur winrate sur le rôle le plus joué (min. ${MIN_GAMES_FOR_RANKING} parties)`,
    metricLabel: "WR rôle",
  },
];

function mainChampionScore(p: PlayerView): number {
  const main = p.mainChampion;
  if (!main || main.games < MIN_GAMES_FOR_RANKING) return -1;
  return main.winrate;
}

function mainRoleScore(p: PlayerView): number {
  const main = p.mainRole;
  if (!main || main.games < MIN_GAMES_FOR_RANKING) return -1;
  return main.winrate;
}

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
    case "champion":
      return mainChampionScore(p);
    case "role":
      return mainRoleScore(p);
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
    case "champion":
      if (!p.mainChampion || p.mainChampion.games < MIN_GAMES_FOR_RANKING) {
        return "—";
      }
      return `${p.mainChampion.winrate}%`;
    case "role":
      if (!p.mainRole || p.mainRole.games < MIN_GAMES_FOR_RANKING) {
        return "—";
      }
      return `${p.mainRole.winrate}%`;
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
  if (
    (id === "champion" && p.mainChampion && p.mainChampion.games >= MIN_GAMES_FOR_RANKING) ||
    (id === "role" && p.mainRole && p.mainRole.games >= MIN_GAMES_FOR_RANKING)
  ) {
    const wr = id === "champion" ? p.mainChampion!.winrate : p.mainRole!.winrate;
    if (wr >= 55) return "positive";
    if (wr < 45) return "negative";
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
    case "champion":
      return p.mainChampion
        ? `${p.mainChampion.championName} · ${p.mainChampion.games} games`
        : null;
    case "role":
      return p.mainRole
        ? `${p.mainRole.label} · ${p.mainRole.games} games`
        : null;
  }
}
