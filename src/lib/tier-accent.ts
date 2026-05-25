/** Couleurs d’accent pour profils (alignées sur les rangs LoL). */
export const TIER_ACCENT_VARS: Record<string, { main: string; light: string; dim: string }> =
  {
    IRON: { main: "#a8a29e", light: "#d6d3d1", dim: "#57534e" },
    BRONZE: { main: "#ea580c", light: "#fdba74", dim: "#9a3412" },
    SILVER: { main: "#94a3b8", light: "#cbd5e1", dim: "#475569" },
    GOLD: { main: "#eab308", light: "#fde047", dim: "#a16207" },
    PLATINUM: { main: "#2dd4bf", light: "#99f6e4", dim: "#0f766e" },
    EMERALD: { main: "#34d399", light: "#a7f3d0", dim: "#059669" },
    DIAMOND: { main: "#22d3ee", light: "#a5f3fc", dim: "#0e7490" },
    MASTER: { main: "#a78bfa", light: "#ddd6fe", dim: "#6d28d9" },
    GRANDMASTER: { main: "#f87171", light: "#fecaca", dim: "#b91c1c" },
    CHALLENGER: { main: "#7dd3fc", light: "#e0f2fe", dim: "#0369a1" },
  };

export const DEFAULT_TIER_ACCENT = TIER_ACCENT_VARS.GOLD;

export function tierAccentKey(tier: string | null | undefined): string {
  if (!tier) return "GOLD";
  return tier.toUpperCase();
}
