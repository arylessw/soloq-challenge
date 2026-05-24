export type TierStyle = {
  border: string;
  glow: string;
  text: string;
  bg: string;
};

const TIER_STYLES: Record<string, TierStyle> = {
  IRON: {
    border: "border-stone-500/50",
    glow: "shadow-stone-500/25",
    text: "text-stone-300",
    bg: "bg-stone-500/10",
  },
  BRONZE: {
    border: "border-orange-700/50",
    glow: "shadow-orange-700/25",
    text: "text-orange-400",
    bg: "bg-orange-700/10",
  },
  SILVER: {
    border: "border-slate-400/50",
    glow: "shadow-slate-400/20",
    text: "text-slate-300",
    bg: "bg-slate-400/10",
  },
  GOLD: {
    border: "border-yellow-500/50",
    glow: "shadow-yellow-500/30",
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  PLATINUM: {
    border: "border-teal-400/50",
    glow: "shadow-teal-400/25",
    text: "text-teal-300",
    bg: "bg-teal-400/10",
  },
  EMERALD: {
    border: "border-emerald-500/50",
    glow: "shadow-emerald-500/25",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  DIAMOND: {
    border: "border-cyan-400/50",
    glow: "shadow-cyan-400/30",
    text: "text-cyan-300",
    bg: "bg-cyan-400/10",
  },
  MASTER: {
    border: "border-purple-500/50",
    glow: "shadow-purple-500/30",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
  },
  GRANDMASTER: {
    border: "border-red-500/50",
    glow: "shadow-red-500/30",
    text: "text-red-400",
    bg: "bg-red-500/10",
  },
  CHALLENGER: {
    border: "border-sky-300/60",
    glow: "shadow-sky-300/35",
    text: "text-sky-300",
    bg: "bg-sky-400/10",
  },
};

const DEFAULT_STYLE: TierStyle = {
  border: "border-gold/30",
  glow: "shadow-gold/20",
  text: "text-gold-light",
  bg: "bg-gold/10",
};

export function getTierStyle(tier: string | null | undefined): TierStyle {
  if (!tier) return DEFAULT_STYLE;
  return TIER_STYLES[tier.toUpperCase()] ?? DEFAULT_STYLE;
}

export function tierCardClass(tier: string | null | undefined): string {
  const s = getTierStyle(tier);
  return `${s.border} ${s.glow} ${s.bg}`;
}
