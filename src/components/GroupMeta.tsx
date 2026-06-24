import Image from "next/image";
import type { ReactNode } from "react";
import { championIconUrl } from "@/lib/champion-stats";
import { getGroupStats } from "@/lib/group-stats";
import { listPlayers } from "@/lib/players";
import type { RoleId } from "@/lib/role-stats";

const ROLE_COLORS: Record<RoleId, string> = {
  TOP: "#ef4444",
  JUNGLE: "#22c55e",
  MIDDLE: "#3b82f6",
  BOTTOM: "#eab308",
  UTILITY: "#a855f7",
};

export async function GroupMeta() {
  const players = await listPlayers();
  const stats = getGroupStats(players);

  if (!stats || stats.totalGames === 0) return null;

  return (
    <section className="mb-10 board-stagger-1">
      <div className="section-header">
        <h2 className="font-display text-xl text-gold-light">Meta du groupe</h2>
        <p className="text-sm text-muted">
          Les stats cumulées du défi · {stats.playerCount} joueur
          {stats.playerCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="card-glow relative z-[1]">
        <div className="relative z-[1]">
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Parties du défi" value={stats.totalGames.toString()} />
            <Tile
              label="Winrate moyen"
              value={stats.avgWinrate != null ? `${stats.avgWinrate}%` : "—"}
              tone={
                stats.avgWinrate == null
                  ? "neutral"
                  : stats.avgWinrate >= 52
                    ? "positive"
                    : stats.avgWinrate < 48
                      ? "negative"
                      : "neutral"
              }
            />
            <Tile
              label="KDA moyen"
              value={stats.avgKda != null ? stats.avgKda.toFixed(2) : "—"}
            />
            {stats.topChampion ? (
              <div className="stat-tile flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3">
                <Image
                  src={championIconUrl(stats.topChampion.name)}
                  alt={stats.topChampion.name}
                  width={36}
                  height={36}
                  className="rounded-lg bg-black/40"
                  unoptimized
                />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    Champion phare
                  </p>
                  <p className="truncate text-sm font-medium text-white/90">
                    {stats.topChampion.name}
                  </p>
                  <p className="text-[11px] text-muted tabular-nums">
                    {stats.topChampion.games} game
                    {stats.topChampion.games > 1 ? "s" : ""} ·{" "}
                    {stats.topChampion.winrate}% WR
                  </p>
                </div>
              </div>
            ) : (
              <Tile label="Champion phare" value="—" />
            )}
          </div>

          {stats.roleDistribution.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">
                Répartition des rôles
              </p>
              <div className="flex h-3 w-full overflow-hidden rounded-full border border-white/10">
                {stats.roleDistribution.map((r) => (
                  <div
                    key={r.role}
                    style={{ width: `${r.pct}%`, background: ROLE_COLORS[r.role] }}
                    title={`${r.label} · ${r.pct}%`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {stats.roleDistribution.map((r) => (
                  <span
                    key={r.role}
                    className="inline-flex items-center gap-1.5 text-xs text-muted"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: ROLE_COLORS[r.role] }}
                    />
                    {r.label}{" "}
                    <span className="tabular-nums text-white/70">{r.pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Tile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-white/90";

  return (
    <div className="stat-tile rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className={`font-display text-xl tabular-nums ${toneClass}`}>{value}</p>
    </div>
  );
}
