"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { MatchDetailView } from "@/lib/match-detail";

function ParticipantTable({
  title,
  team,
  variant,
}: {
  title: string;
  team: MatchDetailView["allies"];
  variant: "ally" | "enemy";
}) {
  return (
    <div>
      <h3
        className={`font-display text-sm uppercase tracking-wider mb-3 ${
          variant === "ally" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10 text-xs text-muted uppercase tracking-wider">
              <th className="py-2.5 px-3">Joueur</th>
              <th className="py-2.5 px-3">KDA</th>
              <th className="py-2.5 px-3 text-right">Dégâts</th>
              <th className="py-2.5 px-3 text-right">Or</th>
              <th className="py-2.5 px-3 text-right">CS</th>
            </tr>
          </thead>
          <tbody>
            {team.map((p) => (
              <tr
                key={p.puuid}
                className={`border-b border-white/5 ${
                  p.isViewer ? "bg-gold/10" : ""
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src={p.championIconUrl}
                      alt={p.championName}
                      width={32}
                      height={32}
                      className="rounded-md"
                      unoptimized
                    />
                    <div>
                      <p className="font-medium text-xs">{p.championName}</p>
                      <p
                        className={`text-xs ${
                          p.isViewer ? "text-gold-light" : "text-muted"
                        }`}
                      >
                        {p.riotId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {p.kills}/{p.deaths}/{p.assists}
                  <span className="text-muted text-xs ml-1">({p.kda})</span>
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {p.damageLabel}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {p.goldLabel}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">{p.cs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MatchDetailModal({
  playerId,
  matchId,
  onClose,
}: {
  playerId: string;
  matchId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<MatchDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/players/${playerId}/matches/${encodeURIComponent(matchId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chargement impossible");
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [playerId, matchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 sm:pt-16 overflow-y-auto bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {loading ? (
              <h2 className="font-display text-xl text-gold">Chargement…</h2>
            ) : detail ? (
              <>
                <h2 className="font-display text-xl text-gold">
                  Détail de la partie
                </h2>
                <p className="text-sm text-muted mt-1">
                  {detail.playedAtLabel} · {detail.durationLabel} ·{" "}
                  {detail.queueLabel}
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    detail.win ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {detail.win ? "Victoire" : "Défaite"}
                </p>
              </>
            ) : (
              <h2 className="font-display text-xl text-gold">Partie</h2>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white text-2xl leading-none px-2"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 mb-4">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-center text-muted py-8">Récupération des stats…</p>
        )}

        {detail && !loading && (
          <div className="space-y-8">
            <ParticipantTable
              title="Alliés"
              team={detail.allies}
              variant="ally"
            />
            <ParticipantTable
              title="Ennemis"
              team={detail.enemies}
              variant="enemy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
