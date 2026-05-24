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
      className="card-glow mb-8 block relative z-[1] transition hover:border-gold/40 hover:-translate-y-0.5 group"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold/80 mb-1">
            Joueur de la semaine
          </p>
          <h2 className="font-display text-2xl text-gold-light group-hover:text-gold transition">
            {player.gameName}
            <span className="text-muted text-base font-sans ml-2">
              #{player.tagLine}
            </span>
          </h2>
          <p className="text-sm text-muted mt-1">
            {player.currentRank ?? "Rang en sync…"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 font-display text-3xl tabular-nums">
            +{player.lpDelta} LP
          </p>
          <p className="text-xs text-muted mt-1">cette semaine</p>
        </div>
      </div>
    </Link>
  );
}
