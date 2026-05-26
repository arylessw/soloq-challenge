"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MatchDetailModal } from "@/components/MatchDetailModal";
import { MatchListSkeleton } from "@/components/Skeleton";
import type { MatchView } from "@/lib/matches";

export function PlayerMatchHistory({ playerId }: { playerId: string }) {
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch(`/api/players/${playerId}/matches`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Impossible de charger les parties");
      }

      setMatches(data.matches ?? []);
      if (data.warning) setWarning(data.warning);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <p className="text-xs text-muted mb-4">
          Chargement des parties ranked solo… (15–25 s)
        </p>
        <MatchListSkeleton />
      </div>
    );
  }

  return (
    <div>
      {selectedMatchId && (
        <MatchDetailModal
          playerId={playerId}
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {warning && !error && (
        <p className="mb-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold-light">
          {warning}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          Clique sur une partie pour les détails (alliés, dégâts, or).
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn-primary text-sm disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      {matches.length === 0 && !error ? (
        <div className="card text-center py-10 text-muted">
          Aucune partie ranked solo trouvée depuis l&apos;inscription.
        </div>
      ) : (
        <ul className="space-y-2">
          {matches.map((m) => (
            <li key={m.matchId}>
              <button
                type="button"
                onClick={() => setSelectedMatchId(m.matchId)}
                className={`match-row-opgg w-full text-left ${m.win ? "match-row-opgg--win" : "match-row-opgg--loss"}`}
              >
                <div className="match-row-opgg__accent" aria-hidden />
                <div className="match-row-opgg__champ">
                  <Image
                    src={m.championIconUrl}
                    alt={m.championName}
                    width={52}
                    height={52}
                    className="rounded-lg"
                    unoptimized
                  />
                </div>
                <div className="match-row-opgg__info min-w-0 flex-1">
                  <p className="font-semibold text-white/95 truncate">
                    {m.championName}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {m.playedAtLabel} · {m.durationLabel}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted/80 mt-1">
                    Ranked Solo
                  </p>
                </div>
                <div className="match-row-opgg__result text-center shrink-0">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      m.win ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.win ? "Victoire" : "Défaite"}
                  </span>
                </div>
                <div className="match-row-opgg__kda text-right shrink-0">
                  <p className="font-display text-xl tabular-nums leading-none">
                    <span className="text-white/90">{m.kills}</span>
                    <span className="text-muted mx-0.5">/</span>
                    <span className={m.deaths >= 6 ? "text-red-400" : "text-white/70"}>
                      {m.deaths}
                    </span>
                    <span className="text-muted mx-0.5">/</span>
                    <span className="text-white/90">{m.assists}</span>
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    {m.kda === "Perfect" ? "Perfect" : `${m.kda} KDA`} · {m.cs} CS
                  </p>
                </div>
                <span className="match-row-opgg__arrow text-muted hidden sm:block">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
