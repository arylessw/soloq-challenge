import Image from "next/image";
import type { RoleStat } from "@/lib/role-stats";
import { roleIconUrl } from "@/lib/role-stats";

type Props = {
  stats: RoleStat[];
};

export function RoleStatsPanel({ stats }: Props) {
  const top = stats.slice(0, 5);

  if (top.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden>
          🎯
        </div>
        <p className="font-display text-base text-gold-light mb-1">
          Rôles à découvrir
        </p>
        <p className="text-sm text-muted max-w-xs mx-auto">
          Tes rôles favoris se révèlent après quelques parties ranked solo.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg text-gold-light mb-1">Rôles du défi</h3>
      <p className="text-xs text-muted mb-4">
        Top {top.length} sur les parties ranked solo depuis l&apos;inscription
      </p>
      <ul className="space-y-3">
        {top.map((r, i) => (
          <li
            key={r.role}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
          >
            <span className="text-xs text-muted w-4 tabular-nums">{i + 1}</span>
            <Image
              src={roleIconUrl(r.role)}
              alt={r.label}
              width={36}
              height={36}
              className="rounded-lg bg-black/40"
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{r.label}</p>
              <p className="text-xs text-muted tabular-nums">
                {r.games} game{r.games > 1 ? "s" : ""} · {r.wins}V / {r.games - r.wins}D
              </p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`text-sm font-semibold tabular-nums ${
                  r.winrate >= 55
                    ? "text-emerald-400"
                    : r.winrate < 45
                      ? "text-red-400"
                      : "text-muted"
                }`}
              >
                {r.winrate}% WR
              </p>
              <p className="text-xs text-muted tabular-nums">
                KDA {r.avgKda.toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
