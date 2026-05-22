"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { MatchDetailModal } from "@/components/MatchDetailModal";
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
      <p className="text-center text-muted py-12">
        Chargement des 20 dernières parties ranked solo… (peut prendre 15–25 s)
      </p>
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
          Clique sur une partie pour voir alliés, ennemis, dégâts et or.
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
        <ul className="space-y-3">
          {matches.map((m) => (
            <li key={m.matchId}>
              <button
                type="button"
                onClick={() => setSelectedMatchId(m.matchId)}
                className={`card w-full flex flex-wrap items-center gap-4 border-l-4 text-left transition hover:border-gold/40 hover:bg-white/5 cursor-pointer ${
                  m.win ? "border-l-emerald-500/80" : "border-l-red-500/80"
                }`}
              >
                <Image
                  src={m.championIconUrl}
                  alt={m.championName}
                  width={48}
                  height={48}
                  className="rounded-lg bg-black/40"
                  unoptimized
                />
                <div className="min-w-[120px] flex-1">
                  <p className="font-medium">{m.championName}</p>
                  <p className="text-xs text-muted">
                    {m.playedAtLabel} · {m.durationLabel}
                  </p>
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${
                      m.win ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {m.win ? "Victoire" : "Défaite"}
                  </p>
                  <p className="text-xs text-muted mt-0.5">Ranked Solo</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg">
                    {m.kills} / {m.deaths} / {m.assists}
                  </p>
                  <p className="text-xs text-muted">
                    KDA {m.kda} · {m.cs} CS
                  </p>
                </div>
                <span className="text-xs text-gold-light/70 w-full sm:w-auto sm:ml-auto">
                  Voir détails →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
