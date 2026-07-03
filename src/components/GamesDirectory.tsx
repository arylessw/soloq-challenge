"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlayerMeta } from "@/components/PlayerMeta";
import { RankEmblem } from "@/components/RankEmblem";
import { formatRelativeTimeFromIso } from "@/lib/format-time";
import { playerListName } from "@/lib/player-display";
import type { PlayerView } from "@/lib/players";
import { roleLabel, type RoleId } from "@/lib/role-stats";
import { tierCardClass } from "@/lib/tier-styles";

const ROLE_OPTIONS: RoleId[] = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];

type SortId = "rank" | "lp" | "wr" | "recent";

const SORTERS: Record<SortId, (p: PlayerView) => number> = {
  rank: (p) => p.rankScore ?? -Infinity,
  lp: (p) => p.lpNet ?? -Infinity,
  wr: (p) => p.winrate ?? -Infinity,
  recent: (p) => (p.lastGameAt ? new Date(p.lastGameAt).getTime() : -Infinity),
};

export function GamesDirectory({ players }: { players: PlayerView[] }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleId | "ALL">("ALL");
  const [sort, setSort] = useState<SortId>("rank");
  const [compare, setCompare] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const score = SORTERS[sort];
    return players
      .filter((p) => {
        if (role !== "ALL" && p.mainRole?.role !== role) return false;
        if (!q) return true;
        return (
          p.gameName.toLowerCase().includes(q) ||
          p.riotId.toLowerCase().includes(q) ||
          (p.owner?.displayName.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => score(b) - score(a));
  }, [players, search, role, sort]);

  function toggleCompare(id: string) {
    setCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : [prev[1], id]
    );
  }

  const selected = compare
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is PlayerView => p != null);

  // La barre flottante est fixée en bas : réserve de l'espace pour ne pas
  // masquer le footer tant qu'une sélection est active.
  useEffect(() => {
    if (compare.length === 0) return;
    document.body.style.paddingBottom = "6rem";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [compare.length]);

  if (players.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden>
          🎮
        </div>
        <p className="mb-1 font-display text-base text-gold-light">
          Aucun joueur inscrit
        </p>
        <p className="mx-auto mb-4 max-w-xs text-sm text-muted">
          Ajoute un compte LoL au défi pour suivre sa progression ranked.
        </p>
        <Link href="/inscription" className="btn-primary inline-block">
          S&apos;inscrire →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted/60"
            aria-hidden
          >
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur…"
            className="input !pl-9"
            aria-label="Rechercher un joueur"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={role === "ALL"}
            onClick={() => setRole("ALL")}
            label="Tous"
          />
          {ROLE_OPTIONS.map((r) => (
            <FilterChip
              key={r}
              active={role === r}
              onClick={() => setRole(r)}
              label={roleLabel(r)}
            />
          ))}
        </div>
        <select
          className="input !w-auto !py-2 text-xs shrink-0"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortId)}
          aria-label="Trier les profils"
        >
          <option value="rank">Tri : Rang</option>
          <option value="lp">Tri : Progression LP</option>
          <option value="wr">Tri : Winrate</option>
          <option value="recent">Tri : Activité récente</option>
        </select>
      </div>

      <p className="mb-5 text-xs text-muted/80">
        ⚔️ Astuce : sélectionne deux joueurs avec le bouton{" "}
        <span className="text-gold/80">Comparer</span> pour les confronter.
      </p>

      {filtered.length === 0 ? (
        <p className="card py-8 text-center text-sm text-muted">
          Aucun joueur ne correspond à ta recherche.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => {
            const isSelected = compare.includes(p.id);
            return (
              <div key={p.id} className="relative">
                <Link
                  href={`/games/${p.id}`}
                  className={`card group block transition-all duration-200 hover:-translate-y-0.5 ${tierCardClass(p.currentTier)} ${
                    isSelected ? "ring-2 ring-gold/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {p.currentTier && (
                      <RankEmblem
                        tier={p.currentTier}
                        size={48}
                        className="shrink-0 opacity-90 group-hover:opacity-100"
                      />
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
                <button
                  type="button"
                  onClick={() => toggleCompare(p.id)}
                  className={`absolute bottom-3 right-3 z-10 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                    isSelected
                      ? "border-gold/50 bg-gold/20 text-gold-light"
                      : "border-white/10 bg-black/40 text-muted hover:border-gold/30 hover:text-gold-light"
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? "✓ Sélectionné" : "⚔️ Comparer"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-pop-in">
          <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-bg/95 px-4 py-3 shadow-2xl backdrop-blur">
            <div className="min-w-0 flex-1 text-sm">
              {selected.length === 1 ? (
                <span className="text-muted">
                  <span className="text-gold-light">
                    {playerListName(selected[0])}
                  </span>{" "}
                  · choisis un 2e joueur
                </span>
              ) : (
                <span className="truncate text-white/90">
                  <span className="text-gold-light">
                    {playerListName(selected[0])}
                  </span>{" "}
                  vs{" "}
                  <span className="text-gold-light">
                    {playerListName(selected[1])}
                  </span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCompare([])}
              className="shrink-0 text-xs text-muted hover:text-white"
            >
              Annuler
            </button>
            {selected.length === 2 && (
              <Link
                href={`/games/compare?p1=${compare[0]}&p2=${compare[1]}`}
                className="btn-primary shrink-0 text-sm"
              >
                Comparer →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-gold/40 bg-gold/15 text-gold-light"
          : "border-white/8 text-muted hover:border-gold/25 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
