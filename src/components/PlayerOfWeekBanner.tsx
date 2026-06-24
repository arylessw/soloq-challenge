import Link from "next/link";
import type { PlayerOfWeekView } from "@/lib/player-of-week";

type Props = {
  player: PlayerOfWeekView | null;
  hasData: boolean;
};

export function PlayerOfWeekBanner({ player, hasData }: Props) {
  if (!player) {
    if (!hasData) return null;
    return (
      <div className="card-glow mb-8 text-center py-6 relative z-[1]">
        <p className="text-sm text-muted">
          Joueur de la semaine — pas encore de progression cette semaine.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/games/${player.playerId}`}
      className="potw-banner potw-shimmer animate-pop-in mb-8 block relative z-[1] group"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="potw-label flex items-center gap-1.5">
            <span aria-hidden className="potw-crown inline-block text-sm">
              👑
            </span>
            Joueur de la semaine
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-gold-light group-hover:text-gold transition">
            {player.gameName}
            <span className="text-muted text-base font-sans ml-2">
              #{player.tagLine}
            </span>
          </h2>
          <p className="text-sm text-muted mt-1">
            {player.currentRank ?? "Rang en sync…"}
          </p>
        </div>
        <div className="relative text-right shrink-0">
          <div
            className="potw-lp-glow pointer-events-none absolute -inset-6 -z-[1]"
            aria-hidden
          />
          <p className="text-emerald-400 font-display text-3xl sm:text-4xl tabular-nums drop-shadow-lg">
            +{player.lpDelta} LP
          </p>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider">
            cette semaine
          </p>
        </div>
      </div>
    </Link>
  );
}
