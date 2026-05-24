"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BoardTransition } from "@/components/BoardTransition";
import { LeaderboardPodium } from "@/components/LeaderboardPodium";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { PlayerView } from "@/lib/players";
import {
  LEADERBOARDS,
  sortPlayersForBoard,
  type LeaderboardId,
} from "@/lib/leaderboards";

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
  const [activeBoard, setActiveBoard] = useState<LeaderboardId>("lp");
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000);
  const syncingRef = useRef(false);
  const lastRefreshRef = useRef<Date | null>(null);

  const boardMeta = LEADERBOARDS.find((b) => b.id === activeBoard)!;

  const ranked = useMemo(
    () => sortPlayersForBoard(players, activeBoard),
    [players, activeBoard]
  );

  const switchBoard = useCallback(
    (next: LeaderboardId) => {
      if (next === activeBoard) return;
      const order = LEADERBOARDS.map((b) => b.id);
      const prevIdx = order.indexOf(activeBoard);
      const nextIdx = order.indexOf(next);
      setSlideDir(nextIdx > prevIdx ? 1 : -1);
      setActiveBoard(next);
    },
    [activeBoard]
  );

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
  }, [loading, players.length, syncAll]);

  useEffect(() => {
    if (!lastRefresh) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastRefresh.getTime();
      setCountdown(Math.ceil(Math.max(0, AUTO_REFRESH_MS - elapsed) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastRefresh]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        <p className="text-sm text-muted">Chargement du classement…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="leaderboard-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {LEADERBOARDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => switchBoard(b.id)}
              className={`leaderboard-tab ${activeBoard === b.id ? "leaderboard-tab-active" : ""}`}
            >
              {b.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => syncAll(false)}
          disabled={syncing || players.length === 0}
          className="btn-primary shrink-0"
        >
          {syncing ? "Sync…" : "Actualiser"}
        </button>
      </div>

      <BoardTransition boardId={activeBoard} direction={slideDir}>
        <div className="mb-10 text-center board-stagger-1">
          <h2 className="font-display text-2xl sm:text-3xl text-gold-light mb-2">
            {boardMeta.label}
          </h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            {boardMeta.description}
          </p>
          {players.length > 0 && (
            <div className="sync-pill mt-4 mx-auto">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  syncing ? "bg-gold animate-pulse" : "bg-emerald-400"
                }`}
              />
              {syncing ? (
                "Actualisation…"
              ) : lastRefresh ? (
                <>
                  Sync {formatRelativeTime(lastRefresh)}
                  <span className="text-muted/40">·</span>
                  prochaine {formatCountdown(countdown)}
                </>
              ) : (
                "Auto toutes les 3 min"
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {players.length === 0 ? (
          <div className="card-glow text-center py-12 relative z-[1]">
            <p className="text-muted mb-4">Aucun joueur inscrit.</p>
            <a href="/inscription" className="btn-primary inline-block">
              S&apos;inscrire →
            </a>
          </div>
        ) : (
          <>
            {ranked.length >= 2 && (
              <div className="board-stagger-2">
                <LeaderboardPodium players={ranked} boardId={activeBoard} />
              </div>
            )}
            <div className="board-stagger-3">
              <LeaderboardTable
                players={ranked.length >= 3 ? ranked.slice(3) : ranked}
                board={boardMeta}
                startRank={ranked.length >= 3 ? 4 : 1}
              />
            </div>
            {activeBoard === "kda" && ranked.every((p) => p.avgKda == null) && (
              <p className="mt-4 text-center text-xs text-muted">
                KDA calculé après la prochaine sync (max 10 parties depuis
                l&apos;inscription).
              </p>
            )}
          </>
        )}
      </BoardTransition>
    </div>
  );
}
