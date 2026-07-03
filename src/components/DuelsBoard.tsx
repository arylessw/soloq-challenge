"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DuelTimelineChart } from "@/components/DuelTimelineChart";
import { TitleBadgeList } from "@/components/TitleBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { accentFor } from "@/lib/compare";
import { assignTitles } from "@/lib/player-titles";
import type { DuelView } from "@/lib/duels";
import type { PlayerView } from "@/lib/players";
import { playerListName } from "@/lib/player-display";

export function DuelsBoard() {
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [active, setActive] = useState<DuelView[]>([]);
  const [finished, setFinished] = useState<DuelView[]>([]);
  const [playerAId, setPlayerAId] = useState("");
  const [playerBId, setPlayerBId] = useState("");
  const [metric, setMetric] = useState<"lp" | "wins">("lp");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function rematch(duel: DuelView) {
    setPlayerAId(duel.playerA.id);
    setPlayerBId(duel.playerB.id);
    setMetric(duel.metric);
    const durationDays = Math.max(
      1,
      Math.min(
        30,
        Math.round(
          (new Date(duel.endsAt).getTime() -
            new Date(duel.startsAt).getTime()) /
            86400000
        )
      )
    );
    setDays(durationDays);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const titleMap = assignTitles(players);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [duelsRes, playersRes] = await Promise.all([
        fetch("/api/duels", { cache: "no-store" }),
        fetch("/api/players", { cache: "no-store" }),
      ]);
      const duelsData = await duelsRes.json();
      const playersData = await playersRes.json();
      if (!duelsRes.ok) throw new Error(duelsData.error ?? "Erreur duels");
      if (!playersRes.ok) throw new Error("Erreur joueurs");
      setActive(duelsData.active ?? []);
      setFinished(duelsData.finished ?? []);
      setPlayers(playersData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createDuel(e: React.FormEvent) {
    e.preventDefault();
    if (!playerAId || !playerBId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/duels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerAId, playerBId, metric, days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec");
      setPlayerAId("");
      setPlayerBId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  function DuelCard({ duel }: { duel: DuelView }) {
    const isFinished = duel.status === "finished";
    const metricLabel = duel.metric === "lp" ? "LP gagnés" : "Victoires";
    const aWins = duel.leaderId === duel.playerA.id;
    const bWins = duel.leaderId === duel.playerB.id;

    return (
      <article className={`duel-card ${isFinished ? "duel-card-finished" : ""}`}>
        <div className="duel-card-header">
          <div className="flex items-center gap-2">
            <span className="duel-vs">VS</span>
            <span className="duel-timer">
              {duel.metric === "lp" ? "📊 LP" : "⚔️ Victoires"}
            </span>
          </div>
          {isFinished ? (
            <span className="flex items-center gap-2">
              <span className="text-xs text-muted">Terminé</span>
              <button
                type="button"
                onClick={() => rematch(duel)}
                className="duel-timer transition hover:border-gold/40 hover:text-gold-light"
                title="Relancer le même duel"
              >
                🔄 Rejouer
              </button>
            </span>
          ) : (
            <span className="duel-timer">
              {duel.daysLeft > 0 ? `${duel.daysLeft} j restant${duel.daysLeft > 1 ? "s" : ""}` : "Dernier jour"}
            </span>
          )}
        </div>

        <div className="duel-fighters">
          <DuelFighter
            player={duel.playerA}
            score={duel.scoreA}
            metricLabel={metricLabel}
            winning={aWins && !isFinished}
            won={duel.winnerId === duel.playerA.id}
            titles={titleMap.get(duel.playerA.id) ?? []}
          />
          <DuelFighter
            player={duel.playerB}
            score={duel.scoreB}
            metricLabel={metricLabel}
            winning={bWins && !isFinished}
            won={duel.winnerId === duel.playerB.id}
            titles={titleMap.get(duel.playerB.id) ?? []}
          />
        </div>

        {duel.metric === "lp" && duel.timeline && (
          <DuelTimelineChart
            a={{
              points: duel.timeline.a,
              color: accentFor(duel.playerA).main,
              name: playerListName(duel.playerA),
            }}
            b={{
              points: duel.timeline.b,
              color: accentFor(duel.playerB).main,
              name: playerListName(duel.playerB),
            }}
          />
        )}
      </article>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={createDuel}
        className="card-glow relative z-[1] space-y-4 scroll-mt-24"
      >
        <h2 className="font-display text-xl text-gold-light">Lancer un duel</h2>
        <p className="text-sm text-muted">
          Deux joueurs s&apos;affrontent sur une période — le gagnant est celui qui progresse le
          plus (LP ou victoires).
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Joueur 1</label>
            <select
              className="input"
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              required
            >
              <option value="">Choisir…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.gameName}#{p.tagLine}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Joueur 2</label>
            <select
              className="input"
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              required
            >
              <option value="">Choisir…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === playerAId}>
                  {p.gameName}#{p.tagLine}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">Objectif</label>
            <select
              className="input w-auto min-w-[140px]"
              value={metric}
              onChange={(e) => setMetric(e.target.value as "lp" | "wins")}
            >
              <option value="lp">Progression LP</option>
              <option value="wins">Victoires</option>
            </select>
          </div>
          <div>
            <label className="label">Durée (jours)</label>
            <input
              type="number"
              min={1}
              max={30}
              className="input w-24"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-sm text-emerald-300/90">
          <span aria-hidden>{metric === "lp" ? "📊" : "⚔️"}</span>
          Duel sur {days} jour{days > 1 ? "s" : ""} — gagnant&nbsp;= celui qui
          gagne le plus {metric === "lp" ? "de LP" : "de victoires"}.
        </p>
        {error && (
          <p className="text-sm text-red-300">{error}</p>
        )}
        <button type="submit" disabled={creating} className="btn-primary">
          {creating ? "Création…" : "Créer le duel"}
        </button>
      </form>

      {error && !creating && (
        <p className="text-sm text-red-300 text-center">{error}</p>
      )}

      <section>
        <h2 className="font-display text-xl text-gold-light mb-4">Duels en cours</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted text-center py-8 card">
            Aucun duel actif — lance le premier !
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        )}
      </section>

      {finished.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-muted mb-4">Derniers duels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {finished.map((d) => (
              <DuelCard key={d.id} duel={d} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DuelFighter({
  player,
  score,
  metricLabel,
  winning,
  won,
  titles,
}: {
  player: PlayerView;
  score: number;
  metricLabel: string;
  winning: boolean;
  won: boolean;
  titles: import("@/lib/player-titles").PlayerTitle[];
}) {
  return (
    <Link
      href={`/games/${player.id}`}
      className={`duel-fighter ${winning ? "duel-fighter-lead" : ""} ${won ? "duel-fighter-won" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {player.owner && (
          <UserAvatar
            displayName={player.owner.displayName}
            avatarUrl={player.owner.avatarUrl}
            size={32}
          />
        )}
        <div className="min-w-0">
          <p className="font-medium truncate text-sm">{playerListName(player)}</p>
          <p className="text-[10px] text-muted truncate">#{player.tagLine}</p>
        </div>
      </div>
      <p
        className={`font-display text-2xl tabular-nums ${
          score > 0 ? "text-emerald-400" : score < 0 ? "text-red-400" : "text-muted"
        }`}
      >
        {score > 0 ? "+" : ""}
        {score}
      </p>
      <p className="text-[10px] text-muted uppercase tracking-wide">{metricLabel}</p>
      {won && <span className="duel-winner-pill">Gagnant</span>}
      <div className="mt-2">
        <TitleBadgeList titles={titles} max={1} />
      </div>
    </Link>
  );
}
