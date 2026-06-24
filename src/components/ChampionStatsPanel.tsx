import Image from "next/image";
import type { ChampionStat } from "@/lib/champion-stats";
import { championIconUrl } from "@/lib/champion-stats";

type Props = {
  stats: ChampionStat[];
};

export function ChampionStatsPanel({ stats }: Props) {
  const top = stats.slice(0, 5);

  if (top.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden>
          🏆
        </div>
        <p className="font-display text-base text-gold-light mb-1">
          Aucun champion pour l&apos;instant
        </p>
        <p className="text-sm text-muted max-w-xs mx-auto">
          Lance une ranked solo — tes mains apparaîtront ici dès la prochaine
          sync des parties.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg text-gold-light mb-1">
        Champions du défi
      </h3>
      <p className="text-xs text-muted mb-4">
        Top {top.length} sur les parties ranked solo depuis l&apos;inscription
      </p>
      <ul className="space-y-3">
        {top.map((c, i) => (
          <li
            key={c.championName}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <span className="text-xs text-muted w-4 tabular-nums">{i + 1}</span>
            <Image
              src={championIconUrl(c.championName)}
              alt={c.championName}
              width={40}
              height={40}
              className="rounded-lg bg-black/40"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.championName}</p>
              <p className="text-xs text-muted tabular-nums">
                {c.games} game{c.games > 1 ? "s" : ""} · {c.wins}V /{" "}
                {c.games - c.wins}D
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-semibold tabular-nums ${
                  c.winrate >= 55
                    ? "text-emerald-400"
                    : c.winrate < 45
                      ? "text-red-400"
                      : "text-muted"
                }`}
              >
                {c.winrate}% WR
              </p>
              <p className="text-xs text-muted tabular-nums">
                KDA {c.avgKda.toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
