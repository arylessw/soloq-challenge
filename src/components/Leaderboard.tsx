"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerView } from "@/lib/players";
import { TEAM_LABELS, type Team } from "@/lib/teams";

const AUTO_REFRESH_MS = 3 * 60 * 1000;

type LeaderboardData = {
  TEAM1: PlayerView[];
  TEAM2: PlayerView[];
  counts: { TEAM1: number; TEAM2: number };
  powers: { TEAM1: number; TEAM2: number };
};

function formatRelativeTime(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  return `il y a ${Math.floor(min / 60)} h`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

function TeamTable({
  team,
  players,
  startPower,
  accent,
}: {
  team: Team;
  players: PlayerView[];
  startPower: number;
  accent: "blue" | "red";
}) {
  const border = accent === "blue" ? "border-blue-400/30" : "border-red-400/30";
  const title = accent === "blue" ? "text-blue-300" : "text-red-300";

  return (
    <div className={`card border ${border}`}>
      <h2 className={`font-display text-xl mb-4 ${title}`}>
        {TEAM_LABELS[team]}
        <span className="ml-2 text-sm font-sans font-normal text-muted">
          {players.length} joueur{players.length !== 1 ? "s" : ""} · {startPower} pts départ
        </span>
      </h2>
      {players.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">Aucun joueur</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-muted uppercase text-xs tracking-wider">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Joueur</th>
                <th className="py-2 pr-3">Actuel</th>
                <th className="py-2 pr-3">Prog.</th>
                <th className="py-2">WR</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 pr-3 font-display text-gold">{i + 1}</td>
                  <td className="py-3 pr-3 font-medium">{p.riotId}</td>
                  <td className="py-3 pr-3 text-muted text-xs">
                    {p.currentRank ?? "—"}
                  </td>
                  <td className="py-3 pr-3">
                    {p.progressLabel ? (
                      <span
                        className={
                          (p.progress ?? 0) >= 0
                            ? "text-emerald-400 font-semibold"
                            : "text-red-400"
                        }
                      >
                        {p.progressLabel}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 text-muted">
                    {p.winrate != null ? `${p.winrate}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const syncingRef = useRef(false);
  const lastRefreshRef = useRef<Date | null>(null);

  const totalPlayers =
    (data?.TEAM1.length ?? 0) + (data?.TEAM2.length ?? 0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/players", { cache: "no-store" });
      if (!res.ok) throw new Error("Chargement impossible");
      setData(await res.json());
    } catch {
      setError("Impossible de charger le classement");
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(
    async (silent = false) => {
      if (syncingRef.current || totalPlayers === 0) return;

      syncingRef.current = true;
      if (!silent) setSyncing(true);
      if (!silent) setError(null);

      try {
        const res = await fetch("/api/sync", { method: "POST" });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Sync échouée");
        await load();
        const now = new Date();
        lastRefreshRef.current = now;
        setLastRefresh(now);
        setCountdown(AUTO_REFRESH_MS / 1000);
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : "Erreur de synchronisation");
        }
      } finally {
        syncingRef.current = false;
        if (!silent) setSyncing(false);
      }
    },
    [load, totalPlayers]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || totalPlayers === 0) return;

    const initial = setTimeout(() => syncAll(true), 2000);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") syncAll(true);
    }, AUTO_REFRESH_MS);

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const last = lastRefreshRef.current;
      if (!last) return;
      if (Date.now() - last.getTime() >= AUTO_REFRESH_MS) syncAll(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loading, totalPlayers, syncAll]);

  useEffect(() => {
    if (!lastRefresh) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastRefresh.getTime();
      setCountdown(Math.ceil(Math.max(0, AUTO_REFRESH_MS - elapsed) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastRefresh]);

  if (loading) {
    return <p className="text-center text-muted py-16">Chargement…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-muted space-y-1">
          <p>
            {totalPlayers} joueur{totalPlayers !== 1 ? "s" : ""} — Équipe 1 :{" "}
            {data?.counts.TEAM1 ?? 0} ({data?.powers.TEAM1 ?? 0} pts départ) · Équipe 2 :{" "}
            {data?.counts.TEAM2 ?? 0} ({data?.powers.TEAM2 ?? 0} pts départ)
          </p>
          {totalPlayers > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  syncing ? "bg-gold animate-pulse" : "bg-emerald-500/80"
                }`}
              />
              {syncing ? (
                "Actualisation en cours…"
              ) : lastRefresh ? (
                <>
                  Dernière sync {formatRelativeTime(lastRefresh)}
                  <span className="text-muted/60">·</span>
                  Prochaine dans {formatCountdown(countdown)}
                </>
              ) : (
                "Auto-actualisation toutes les 3 min"
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => syncAll(false)}
          disabled={syncing || totalPlayers === 0}
          className="btn-primary disabled:opacity-50"
        >
          {syncing ? "Sync en cours…" : "Actualiser maintenant"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {totalPlayers === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted mb-4">Aucun joueur inscrit.</p>
          <a href="/inscription" className="btn-primary inline-block">
            S&apos;inscrire →
          </a>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <TeamTable
            team="TEAM1"
            players={data?.TEAM1 ?? []}
            startPower={data?.powers.TEAM1 ?? 0}
            accent="blue"
          />
          <TeamTable
            team="TEAM2"
            players={data?.TEAM2 ?? []}
            startPower={data?.powers.TEAM2 ?? 0}
            accent="red"
          />
        </div>
      )}
    </div>
  );
}
