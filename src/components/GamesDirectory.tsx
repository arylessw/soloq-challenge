import Link from "next/link";
import { PlayerMeta } from "@/components/PlayerMeta";
import { RankEmblem } from "@/components/RankEmblem";
import { formatRelativeTimeFromIso } from "@/lib/format-time";
import type { PlayerView } from "@/lib/players";
import { tierCardClass } from "@/lib/tier-styles";

export function GamesDirectory({ players }: { players: PlayerView[] }) {
  if (players.length === 0) {
    return (
      <div className="card-glow text-center py-12 relative z-[1]">
        <p className="text-muted mb-4">Aucun joueur inscrit.</p>
        <Link href="/inscription" className="btn-primary inline-block">
          S&apos;inscrire →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {players.map((p) => (
        <Link
          key={p.id}
          href={`/games/${p.id}`}
          className={`card group block transition-all duration-200 hover:-translate-y-0.5 ${tierCardClass(p.currentTier)}`}
        >
          <div className="flex items-start gap-4">
            {p.currentTier && (
              <RankEmblem tier={p.currentTier} size={48} className="shrink-0 opacity-90 group-hover:opacity-100" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-display text-lg text-gold-light truncate group-hover:text-gold transition">
                    {p.gameName}
                  </h2>
                  <p className="text-xs text-muted">#{p.tagLine}</p>
                  <PlayerMeta player={p} />
                </div>
                {p.lpNet != null && p.lpNet !== 0 && (
                  <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      p.lpNet > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {p.lpNet > 0 ? `+${p.lpNet}` : p.lpNet} LP
                  </span>
                )}
              </div>
              <p className="text-sm text-muted mt-2 truncate">
                {p.currentRank ?? "Rang non sync"}
              </p>
              {p.wins != null && p.losses != null && (
                <p className="text-xs text-muted/80 mt-2 tabular-nums">
                  {p.wins}V / {p.losses}D
                  {p.winrate != null ? ` · ${p.winrate}% WR` : ""}
                </p>
              )}
              {p.lastGameAt && (
                <p className="text-xs text-muted/70 mt-1">
                  Dernière game {formatRelativeTimeFromIso(p.lastGameAt)}
                </p>
              )}
              <p className="text-xs text-gold/70 mt-3 group-hover:text-gold-light transition">
                Voir les parties →
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
