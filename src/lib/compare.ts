import type { PlayerView } from "@/lib/players";
import { formatLpProgress } from "@/lib/ranks";
import {
  TIER_ACCENT_VARS,
  DEFAULT_TIER_ACCENT,
  tierAccentKey,
} from "@/lib/tier-accent";

export type Accent = { main: string; light: string; dim: string };

export function accentFor(player: PlayerView): Accent {
  return TIER_ACCENT_VARS[tierAccentKey(player.currentTier)] ?? DEFAULT_TIER_ACCENT;
}

export type Winner = "a" | "b" | "tie" | "none";

export type CompareMetric = {
  key: string;
  label: string;
  aDisplay: string;
  bDisplay: string;
  aPct: number;
  bPct: number;
  winner: Winner;
  /** Compte dans le score global "qui mène" (métriques de skill uniquement). */
  countsForLead: boolean;
};

function decide(
  a: number | null,
  b: number | null,
  better: "higher" | "lower"
): Winner {
  if (a == null || b == null) return "none";
  if (a === b) return "tie";
  if (better === "higher") return a > b ? "a" : "b";
  return a < b ? "a" : "b";
}

/**
 * Longueur des barres comparatives (0-100).
 * Normalise sur [min(a,b,0), max(a,b)] pour que le MEILLEUR ait toujours la
 * barre la plus longue, même pour une métrique signée (ex. progression LP
 * négative). Si une valeur manque, aucune barre (évite une barre orpheline).
 */
function barPercents(a: number | null, b: number | null): [number, number] {
  if (a == null || b == null) return [0, 0];
  const lo = Math.min(a, b, 0);
  const hi = Math.max(a, b);
  const span = hi - lo;
  if (span <= 0) return [0, 0];
  const f = (v: number) => Math.round(((v - lo) / span) * 100);
  return [f(a), f(b)];
}

function gamesOf(p: PlayerView): number | null {
  if (p.wins == null || p.losses == null) return null;
  return p.wins + p.losses;
}

export type Comparison = {
  metrics: CompareMetric[];
  aWins: number;
  bWins: number;
};

export function buildComparison(a: PlayerView, b: PlayerView): Comparison {
  const metrics: CompareMetric[] = [];

  const add = (
    key: string,
    label: string,
    av: number | null,
    bv: number | null,
    aDisplay: string,
    bDisplay: string,
    better: "higher" | "lower",
    countsForLead: boolean
  ) => {
    const [aPct, bPct] = barPercents(av, bv);
    metrics.push({
      key,
      label,
      aDisplay,
      bDisplay,
      aPct,
      bPct,
      winner: decide(av, bv, better),
      countsForLead,
    });
  };

  add(
    "rank",
    "Rang actuel",
    a.rankScore,
    b.rankScore,
    a.currentRank ?? "Non classé",
    b.currentRank ?? "Non classé",
    "higher",
    true
  );

  add(
    "lp",
    "Progression LP",
    a.lpNet,
    b.lpNet,
    a.lpNet != null ? formatLpProgress(a.lpNet) : "—",
    b.lpNet != null ? formatLpProgress(b.lpNet) : "—",
    "higher",
    true
  );

  add(
    "winrate",
    "Winrate",
    a.winrate,
    b.winrate,
    a.winrate != null ? `${a.winrate}%` : "—",
    b.winrate != null ? `${b.winrate}%` : "—",
    "higher",
    true
  );

  add(
    "kda",
    "KDA moyen",
    a.avgKda,
    b.avgKda,
    a.avgKda != null ? a.avgKda.toFixed(2) : "—",
    b.avgKda != null ? b.avgKda.toFixed(2) : "—",
    "higher",
    true
  );

  const aChamp = a.mainChampion;
  const bChamp = b.mainChampion;
  add(
    "champion",
    "Champion (WR)",
    aChamp?.winrate ?? null,
    bChamp?.winrate ?? null,
    aChamp ? `${aChamp.championName} · ${aChamp.winrate}%` : "—",
    bChamp ? `${bChamp.championName} · ${bChamp.winrate}%` : "—",
    "higher",
    true
  );

  const aRole = a.mainRole;
  const bRole = b.mainRole;
  add(
    "role",
    "Rôle (WR)",
    aRole?.winrate ?? null,
    bRole?.winrate ?? null,
    aRole ? `${aRole.label} · ${aRole.winrate}%` : "—",
    bRole ? `${bRole.label} · ${bRole.winrate}%` : "—",
    "higher",
    true
  );

  const ag = gamesOf(a);
  const bg = gamesOf(b);
  add(
    "games",
    "Activité",
    ag,
    bg,
    ag != null ? `${a.wins}V / ${a.losses}D` : "—",
    bg != null ? `${b.wins}V / ${b.losses}D` : "—",
    "higher",
    false
  );

  metrics.push({
    key: "streak",
    label: "Série",
    aDisplay: a.streakLabel ?? "—",
    bDisplay: b.streakLabel ?? "—",
    aPct: 0,
    bPct: 0,
    winner: "none",
    countsForLead: false,
  });

  const aWins = metrics.filter((m) => m.countsForLead && m.winner === "a").length;
  const bWins = metrics.filter((m) => m.countsForLead && m.winner === "b").length;

  return { metrics, aWins, bWins };
}
