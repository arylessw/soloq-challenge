"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerView } from "@/lib/players";

/** Comme op.gg : refresh régulier tant que la page est ouverte */
const AUTO_REFRESH_MS = 3 * 60 * 1000;

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

export function Leaderboard() {
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const syncingRef = useRef(false);
  const lastRefreshRef = useRef<Date | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/players", { cache: "no-store" });
      if (!res.ok) throw new Error("Chargement impossible");
      setPlayers(await res.json());
    } catch {
      setError("Impossible de charger le classement");
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(
    async (silent = false) => {
      if (syncingRef.current || players.length === 0) return;

      syncingRef.current = true;
      if (!silent) setSyncing(true);
      if (!silent) setError(null);

      try {
        const res = await fetch("/api/sync", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Sync échouée");
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
    [load, players.length]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || players.length === 0) return;

    const initial = setTimeout(() => syncAll(true), 2000);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        syncAll(true);
      }
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
  }, [loading, players.length, syncAll]);

  useEffect(() => {
    if (!lastRefresh) return;

    const tick = setInterval(() => {
      const elapsed = Date.now() - lastRefresh.getTime();
      const remaining = Math.max(0, AUTO_REFRESH_MS - elapsed);
      setCountdown(Math.ceil(remaining / 1000));
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
            {players.length} joueur{players.length !== 1 ? "s" : ""} — tri par
            progression
          </p>
          {players.length > 0 && (
            <p className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  syncing ? "bg-gold animate-pulse" : "bg-emerald-500/80"
                }`}
                aria-hidden
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
          disabled={syncing || players.length === 0}
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

      {players.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted mb-4">Aucun joueur inscrit pour l&apos;instant.</p>
          <a href="/inscription" className="btn-primary inline-block">
            Premier inscrit →
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/20 text-muted uppercase text-xs tracking-wider">
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">Joueur</th>
                <th className="py-3 pr-4">Départ</th>
                <th className="py-3 pr-4">Actuel</th>
                <th className="py-3 pr-4">Progression</th>
                <th className="py-3 pr-4">W/L</th>
                <th className="py-3">WR</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-4 pr-4 font-display text-gold text-lg">
                    {i + 1}
                  </td>
                  <td className="py-4 pr-4 font-medium">{p.riotId}</td>
                  <td className="py-4 pr-4 text-muted">{p.startRank}</td>
                  <td className="py-4 pr-4">
                    {p.currentRank ?? <span className="text-muted">—</span>}
                  </td>
                  <td className="py-4 pr-4">
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
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-muted">
                    {p.wins != null && p.losses != null
                      ? `${p.wins}V / ${p.losses}D`
                      : "—"}
                  </td>
                  <td className="py-4">
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
