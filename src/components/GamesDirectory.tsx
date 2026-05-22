import Link from "next/link";
import type { PlayerView } from "@/lib/players";

export function GamesDirectory({ players }: { players: PlayerView[] }) {
  if (players.length === 0) {
    return (
      <div className="card text-center py-12">
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
          className="card block transition hover:border-gold/40 hover:bg-white/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg text-gold">{p.riotId}</h2>
              <p className="text-sm text-muted mt-1">
                {p.currentRank ?? "Rang non sync"}
              </p>
            </div>
            {p.lpNet != null && p.lpNet !== 0 && (
              <span
                className={
                  p.lpNet > 0
                    ? "text-emerald-400 text-sm font-semibold"
                    : "text-red-400 text-sm font-semibold"
                }
              >
                {p.lpNet > 0 ? `+${p.lpNet}` : p.lpNet} LP
              </span>
            )}
          </div>
          {p.wins != null && p.losses != null && (
            <p className="text-xs text-muted mt-3">
              {p.wins}V / {p.losses}D
              {p.winrate != null ? ` · ${p.winrate}% WR` : ""}
            </p>
          )}
          <p className="text-xs text-gold-light/80 mt-3">Voir les parties →</p>
        </Link>
      ))}
    </div>
  );
}
