"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BoardTransition } from "@/components/BoardTransition";
import { LeaderboardSkeleton } from "@/components/Skeleton";
import { LeaderboardPodium } from "@/components/LeaderboardPodium";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { PlayerView } from "@/lib/players";
import { assignTitles } from "@/lib/player-titles";
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

  const titleMap = useMemo(() => assignTitles(players), [players]);

  const ranked = useMemo(
    () => sortPlayersForBoard(players, activeBoard),
    [players, activeBoard]
  );

  // Mouvement de classement entre deux syncs (calculé côté client, par board)
  const [movementsByBoard, setMovementsByBoard] = useState<
    Map<LeaderboardId, Map<string, number>>
  >(new Map());
  const prevOrderRef = useRef<Map<LeaderboardId, string[]>>(new Map());

  useEffect(() => {
    if (players.length === 0) return;
    const next = new Map<LeaderboardId, Map<string, number>>();
    for (const board of LEADERBOARDS) {
      const order = sortPlayersForBoard(players, board.id).map((p) => p.id);
      const prev = prevOrderRef.current.get(board.id);
      const deltas = new Map<string, number>();
      if (prev) {
        order.forEach((id, idx) => {
          const oldIdx = prev.indexOf(id);
          if (oldIdx >= 0) deltas.set(id, oldIdx - idx);
        });
      }
      next.set(board.id, deltas);
      prevOrderRef.current.set(board.id, order);
    }
    setMovementsByBoard(next);
  }, [players]);

  const movements = movementsByBoard.get(activeBoard);

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
    return <LeaderboardSkeleton />;
  }

  const totalCountdown = AUTO_REFRESH_MS / 1000;
  const progressPct = Math.max(
    0,
    Math.min(100, (1 - countdown / totalCountdown) * 100)
  );

  return (
    <div>
      <div className="leaderboard-panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="leaderboard-tabs flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {LEADERBOARDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => switchBoard(b.id)}
              className={`leaderboard-tab relative ${activeBoard === b.id ? "leaderboard-tab-active" : ""}`}
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
            <div className="mt-4 flex flex-col items-center gap-2.5">
              <div className="sync-pill">
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
              {lastRefresh && (
                <div className="sync-progress-track" aria-hidden>
                  <div
                    className="sync-progress-fill"
                    style={{ width: syncing ? "100%" : `${progressPct}%` }}
                  />
                </div>
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
                <LeaderboardPodium
                  players={ranked}
                  boardId={activeBoard}
                  titleMap={titleMap}
                  movements={movements}
                />
              </div>
            )}
            <div className="board-stagger-3">
              <LeaderboardTable
                players={ranked.length >= 3 ? ranked.slice(3) : ranked}
                board={boardMeta}
                startRank={ranked.length >= 3 ? 4 : 1}
                titleMap={titleMap}
                movements={movements}
              />
            </div>
            {activeBoard === "kda" && ranked.every((p) => p.avgKda == null) && (
              <p className="mt-4 text-center text-xs text-muted">
                KDA calculé après la prochaine sync (historique des parties
                ranked).
              </p>
            )}
            {(activeBoard === "champion" || activeBoard === "role") &&
              ranked.every(
                (p) =>
                  (activeBoard === "champion"
                    ? !p.mainChampion || p.mainChampion.games < 5
                    : !p.mainRole || p.mainRole.games < 5)
              ) && (
                <p className="mt-4 text-center text-xs text-muted">
                  Classement disponible après au moins 5 parties sur le main (
                  sync des matchs requise).
                </p>
              )}
          </>
        )}
      </BoardTransition>
    </div>
  );
}
