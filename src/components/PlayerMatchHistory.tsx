"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { MatchDetailModal } from "@/components/MatchDetailModal";
import { MatchListSkeleton } from "@/components/Skeleton";
import type { MatchView } from "@/lib/matches";

type MatchFilter = "all" | "win" | "loss";

function gameKda(m: MatchView): number {
  return m.deaths === 0 ? m.kills + m.assists : (m.kills + m.assists) / m.deaths;
}

export function PlayerMatchHistory({ playerId }: { playerId: string }) {
  const [matches, setMatches] = useState<MatchView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MatchFilter>("all");

  const summary = useMemo(() => {
    if (matches.length === 0) return null;
    const wins = matches.filter((m) => m.win).length;
    const losses = matches.length - wins;
    const csSum = matches.reduce((s, m) => s + m.cs, 0);
    const kdaSum = matches.reduce((s, m) => s + gameKda(m), 0);
    return {
      wins,
      losses,
      winrate: Math.round((wins / matches.length) * 100),
      avgCs: Math.round(csSum / matches.length),
      avgKda: Math.round((kdaSum / matches.length) * 100) / 100,
    };
  }, [matches]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? matches
        : matches.filter((m) => (filter === "win" ? m.win : !m.win)),
    [matches, filter]
  );

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

      {summary && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MatchStat
            label={`Bilan (${matches.length})`}
            value={
              <span className="tabular-nums">
                <span className="text-emerald-400">
                  <AnimatedNumber value={summary.wins} />V
                </span>{" "}
                <span className="text-muted">/</span>{" "}
                <span className="text-red-400">
                  <AnimatedNumber value={summary.losses} />D
                </span>
              </span>
            }
          />
          <MatchStat
            label="Winrate"
            value={
              <span
                className={
                  summary.winrate >= 55
                    ? "text-emerald-400"
                    : summary.winrate < 45
                      ? "text-red-400"
                      : "text-white/90"
                }
              >
                <AnimatedNumber value={summary.winrate} suffix="%" />
              </span>
            }
          />
          <MatchStat
            label="KDA moyen"
            value={
              <span
                className={`tabular-nums ${
                  summary.avgKda >= 3
                    ? "text-emerald-400"
                    : summary.avgKda < 2
                      ? "text-red-400/90"
                      : "text-white/90"
                }`}
              >
                {summary.avgKda.toFixed(2)}
              </span>
            }
          />
          <MatchStat
            label="CS moyen"
            value={
              <span className="tabular-nums text-white/90">
                <AnimatedNumber value={summary.avgCs} />
              </span>
            }
          />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {matches.length > 0 ? (
          <div className="inline-flex rounded-xl border border-white/8 bg-black/20 p-1">
            {(
              [
                ["all", "Tous"],
                ["win", "Victoires"],
                ["loss", "Défaites"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  filter === key
                    ? "bg-gold/15 text-gold-light"
                    : "text-muted hover:text-white"
                }`}
              >
                {label}
                {summary && key !== "all" && (
                  <span className="ml-1 text-[10px] opacity-70 tabular-nums">
                    {key === "win" ? summary.wins : summary.losses}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            Clique sur une partie pour les détails (alliés, dégâts, or).
          </p>
        )}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="btn-primary text-sm disabled:opacity-50"
        >
          Actualiser
        </button>
      </div>

      {matches.length === 0 ? (
        error ? null : (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden>
              🎮
            </div>
            <p className="font-display text-base text-gold-light mb-1">
              Aucune partie ranked solo
            </p>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Aucune game trouvée depuis l&apos;inscription au défi. Joue une
              ranked solo et reviens — l&apos;historique se remplit tout seul.
            </p>
          </div>
        )
      ) : filtered.length === 0 ? (
        <p className="card text-center py-8 text-sm text-muted">
          Aucune partie pour ce filtre.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((m) => (
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

function MatchStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="stat-tile rounded-xl border border-white/[0.08] bg-black/25 px-3 py-2.5 text-center">
      <p className="text-muted text-[10px] uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="font-display text-base sm:text-lg">{value}</div>
    </div>
  );
}
