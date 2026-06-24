import Image from "next/image";
import { championIconUrl, type ChampionStat } from "@/lib/champion-stats";
import { accentFor } from "@/lib/compare";
import { playerListName } from "@/lib/player-display";
import type { PlayerView } from "@/lib/players";
import { roleIconUrl, type RoleStat } from "@/lib/role-stats";

type Props = {
  a: PlayerView;
  b: PlayerView;
};

export function CompareChampionsRoles({ a, b }: Props) {
  if (
    a.championStats.length === 0 &&
    b.championStats.length === 0 &&
    a.roleStats.length === 0 &&
    b.roleStats.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 board-stagger-3">
      <PlayerColumn player={a} />
      <PlayerColumn player={b} />
    </div>
  );
}

function wrClass(wr: number): string {
  return wr >= 55
    ? "text-emerald-400"
    : wr < 45
      ? "text-red-400"
      : "text-muted";
}

function PlayerColumn({ player }: { player: PlayerView }) {
  const accent = accentFor(player);
  const champs = player.championStats.slice(0, 3);
  const roles = player.roleStats.slice(0, 3);

  return (
    <div className="card">
      <h3
        className="font-display text-base truncate mb-3"
        style={{ color: accent.light }}
      >
        {playerListName(player)}
      </h3>

      <p className="text-[10px] uppercase tracking-wider text-muted mb-2">
        Champions
      </p>
      {champs.length === 0 ? (
        <p className="text-xs text-muted mb-4">Aucun champion encore.</p>
      ) : (
        <ul className="space-y-2 mb-4">
          {champs.map((c) => (
            <ChampRow key={c.championName} c={c} />
          ))}
        </ul>
      )}

      <p className="text-[10px] uppercase tracking-wider text-muted mb-2">
        Rôles
      </p>
      {roles.length === 0 ? (
        <p className="text-xs text-muted">Aucun rôle encore.</p>
      ) : (
        <ul className="space-y-2">
          {roles.map((r) => (
            <RoleRow key={r.role} r={r} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ChampRow({ c }: { c: ChampionStat }) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
      <Image
        src={championIconUrl(c.championName)}
        alt={c.championName}
        width={28}
        height={28}
        className="rounded-md bg-black/40"
        unoptimized
      />
      <span className="min-w-0 flex-1 truncate text-sm">{c.championName}</span>
      <span className="text-[11px] text-muted tabular-nums shrink-0">
        {c.games}g
      </span>
      <span
        className={`text-xs font-semibold tabular-nums shrink-0 ${wrClass(c.winrate)}`}
      >
        {c.winrate}%
      </span>
    </li>
  );
}

function RoleRow({ r }: { r: RoleStat }) {
  return (
    <li className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
      <Image
        src={roleIconUrl(r.role)}
        alt={r.label}
        width={26}
        height={26}
        className="rounded-md bg-black/40"
        unoptimized
      />
      <span className="min-w-0 flex-1 truncate text-sm">{r.label}</span>
      <span className="text-[11px] text-muted tabular-nums shrink-0">
        {r.games}g
      </span>
      <span
        className={`text-xs font-semibold tabular-nums shrink-0 ${wrClass(r.winrate)}`}
      >
        {r.winrate}%
      </span>
    </li>
  );
}
