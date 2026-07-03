import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { getWeeklyProgress } from "@/lib/lp-snapshots";
import { listPlayers } from "@/lib/players";
import { buildRecords, type ChallengeRecord } from "@/lib/records";

export const metadata: Metadata = {
  title: "Records — SoloQ Challenge",
  description:
    "Le hall of fame du défi : sommets, séries, ascensions et descentes mémorables.",
};

const TONE_CLASS: Record<ChallengeRecord["tone"], string> = {
  gold: "text-gold-light",
  win: "text-emerald-400",
  loss: "text-red-400",
};

export default async function RecordsPage() {
  const [players, weekly] = await Promise.all([
    listPlayers(),
    getWeeklyProgress(),
  ]);
  const records = buildRecords(players, weekly);

  return (
    <div>
      <PageHero
        eyebrow="Hall of Fame"
        title="Records"
        description="Les exploits (et les naufrages) du défi — recalculés en continu sur les stats de la saison."
      />

      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden>
            🏆
          </div>
          <p className="mb-1 font-display text-base text-gold-light">
            Pas encore de records
          </p>
          <p className="mx-auto max-w-xs text-sm text-muted">
            Les records apparaissent dès que les joueurs ont des stats
            synchronisées.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 board-stagger-1">
          {records.map((r) => (
            <Link
              key={r.id}
              href={`/games/${r.playerId}`}
              className="card group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40"
            >
              <div className="empty-state-icon" aria-hidden>
                {r.emoji}
              </div>
              <p className="label-condensed text-[11px] uppercase tracking-[0.28em] text-muted mb-2">
                {r.label}
              </p>
              <p className="font-display text-lg text-gold-light truncate max-w-full group-hover:text-gold transition">
                {r.playerName}
              </p>
              <p className="text-[11px] text-muted mb-2 truncate max-w-full">
                {r.riotId}
              </p>
              <p className={`text-metric text-xl ${TONE_CLASS[r.tone]}`}>
                {r.value}
              </p>
              <p className="mt-3 text-xs text-muted/80 leading-relaxed">
                {r.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
