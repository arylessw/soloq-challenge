import type { RawMatchForPlayer } from "@/lib/riot-matches";
import { gameKdaRatio } from "@/lib/kda";

export const MIN_GAMES_FOR_RANKING = 5;

export type RoleId = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export type RoleStat = {
  role: RoleId;
  label: string;
  games: number;
  wins: number;
  winrate: number;
  avgKda: number;
};

const ROLE_LABELS: Record<RoleId, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Milieu",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

export function roleLabel(role: RoleId): string {
  return ROLE_LABELS[role];
}

export function roleIconUrl(role: RoleId): string {
  const file: Record<RoleId, string> = {
    TOP: "top",
    JUNGLE: "jungle",
    MIDDLE: "middle",
    BOTTOM: "bottom",
    UTILITY: "utility",
  };
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-${file[role]}.png`;
}

function normalizeRole(raw: string | undefined | null): RoleId | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (upper in ROLE_LABELS) return upper as RoleId;
  return null;
}

export function computeRoleStats(matches: RawMatchForPlayer[]): RoleStat[] {
  const map = new Map<
    RoleId,
    { games: number; wins: number; kdaSum: number }
  >();

  for (const m of matches) {
    const role = normalizeRole(m.teamPosition);
    if (!role) continue;

    const entry = map.get(role) ?? { games: 0, wins: 0, kdaSum: 0 };
    entry.games += 1;
    if (m.win) entry.wins += 1;
    entry.kdaSum += gameKdaRatio(m.kills, m.deaths, m.assists);
    map.set(role, entry);
  }

  return [...map.entries()]
    .map(([role, s]) => ({
      role,
      label: roleLabel(role),
      games: s.games,
      wins: s.wins,
      winrate: Math.round((s.wins / s.games) * 100),
      avgKda: Math.round((s.kdaSum / s.games) * 100) / 100,
    }))
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate);
}

export function parseRoleStats(raw: unknown): RoleStat[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RoleStat =>
      typeof item === "object" &&
      item != null &&
      typeof (item as RoleStat).role === "string" &&
      typeof (item as RoleStat).games === "number"
  );
}

export function pickMainRole(stats: RoleStat[]): RoleStat | null {
  return stats[0] ?? null;
}
