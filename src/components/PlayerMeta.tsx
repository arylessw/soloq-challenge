import { PresenceBadge } from "@/components/PresenceBadge";
import type { PlayerView } from "@/lib/players";
import type { StreakType } from "@/lib/streak";

export function StreakBadge({
  type,
  label,
}: {
  type: StreakType | null;
  label: string | null;
}) {
  if (!type || !label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        type === "WIN"
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"
      }`}
    >
      {type === "WIN" ? "🔥" : "💀"} {label}
    </span>
  );
}

export function PlayerMeta({ player }: { player: PlayerView }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      <PresenceBadge presence={player.presence} />
      <StreakBadge type={player.streakType} label={player.streakLabel} />
    </div>
  );
}
