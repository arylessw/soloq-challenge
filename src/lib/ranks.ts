export const TIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

export type Tier = (typeof TIERS)[number];

export const DIVISIONS = ["IV", "III", "II", "I"] as const;
export type Division = (typeof DIVISIONS)[number];

export const TIER_LABELS: Record<Tier, string> = {
  IRON: "Fer",
  BRONZE: "Bronze",
  SILVER: "Argent",
  GOLD: "Or",
  PLATINUM: "Platine",
  EMERALD: "Émeraude",
  DIAMOND: "Diamant",
  MASTER: "Maître",
  GRANDMASTER: "Grand Maître",
  CHALLENGER: "Challenger",
};

const TIER_ORDER: Record<Tier, number> = {
  IRON: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
  EMERALD: 5,
  DIAMOND: 6,
  MASTER: 7,
  GRANDMASTER: 8,
  CHALLENGER: 9,
};

const DIVISION_ORDER: Record<Division, number> = {
  IV: 0,
  III: 1,
  II: 2,
  I: 3,
};

export function tierIndex(tier: string): number {
  return TIER_ORDER[tier.toUpperCase() as Tier] ?? 0;
}

/** Compare uniquement le tier (Diamant II = Diamant III pour la hiérarchie) */
export function compareTierOnly(tierA: string, tierB: string): number {
  return tierIndex(tierA) - tierIndex(tierB);
}

/** Tier > division > LP — pour départager à l'intérieur d'un même tier */
export function compareRankHierarchy(
  tierA: string,
  divisionA: string,
  lpA: number,
  tierB: string,
  divisionB: string,
  lpB: number
): number {
  const tA = TIER_ORDER[(tierA.toUpperCase() as Tier)] ?? 0;
  const tB = TIER_ORDER[(tierB.toUpperCase() as Tier)] ?? 0;
  if (tA !== tB) return tA - tB;

  if (tA >= TIER_ORDER.MASTER) return lpA - lpB;

  const dA = DIVISION_ORDER[(divisionA.toUpperCase() as Division)] ?? 0;
  const dB = DIVISION_ORDER[(divisionB.toUpperCase() as Division)] ?? 0;
  if (dA !== dB) return dA - dB;

  return lpA - lpB;
}

/** Score linéaire (cohérent avec la hiérarchie tier → division → LP) */
export function rankToScore(tier: string, division: string, lp: number): number {
  const t = tier.toUpperCase() as Tier;
  const tierIdx = TIER_ORDER[t] ?? 0;

  if (tierIdx >= TIER_ORDER.MASTER) {
    return tierIdx * 10_000 + lp;
  }

  const div = division.toUpperCase() as Division;
  const divIdx = DIVISION_ORDER[div] ?? 0;
  return tierIdx * 10_000 + divIdx * 500 + lp;
}

export function formatRank(tier: string, division: string, lp: number): string {
  const t = tier.toUpperCase() as Tier;
  const label = TIER_LABELS[t] ?? tier;

  if (TIER_ORDER[t] >= TIER_ORDER.MASTER) {
    return `${label} — ${lp} LP`;
  }

  return `${label} ${division} — ${lp} LP`;
}

/** Entre tiers : écart de rank. Même tier : uniquement les LP (les divisions ne comptent pas). */
export function progressBetween(
  startTier: string,
  _startDivision: string,
  startLp: number,
  currentTier: string,
  _currentDivision: string,
  currentLp: number
): number {
  const tierGap = tierIndex(currentTier) - tierIndex(startTier);

  if (tierGap !== 0) {
    return tierGap * 10_000;
  }

  return currentLp - startLp;
}

export function formatProgressLabel(
  startTier: string,
  _startDivision: string,
  startLp: number,
  currentTier: string,
  _currentDivision: string,
  currentLp: number
): string {
  const tierGap = tierIndex(currentTier) - tierIndex(startTier);

  if (tierGap !== 0) {
    const n = Math.abs(tierGap);
    return tierGap > 0
      ? `+${n} rank${n > 1 ? "s" : ""}`
      : `-${n} rank${n > 1 ? "s" : ""}`;
  }

  const lp = currentLp - startLp;
  if (lp === 0) return "—";
  return lp > 0 ? `+${lp} LP` : `${lp} LP`;
}

export function isValidTier(tier: string): tier is Tier {
  return TIERS.includes(tier.toUpperCase() as Tier);
}

export function isValidDivision(division: string): division is Division {
  return DIVISIONS.includes(division.toUpperCase() as Division);
}

export function divisionRequired(tier: string): boolean {
  const t = tier.toUpperCase() as Tier;
  return TIER_ORDER[t] < TIER_ORDER.MASTER;
}
