import Link from "next/link";
import { RankEmblem } from "@/components/RankEmblem";
import { Sparkline } from "@/components/Sparkline";
import { UserAvatar } from "@/components/UserAvatar";
import { getWeeklyProgress, type WeeklyProgress } from "@/lib/lp-snapshots";
import { playerListName, playerListSubtitle } from "@/lib/player-display";
import { listPlayers, type PlayerView } from "@/lib/players";

const POSITIVE = "#34d399";
const NEGATIVE = "#f87171";

function momentum(delta: number): { emoji: string; label: string; cls: string } {
  if (delta >= 30) return { emoji: "🚀", label: "Fusée", cls: "text-emerald-400" };
  if (delta <= -30) return { emoji: "🪂", label: "Chute libre", cls: "text-red-400" };
  if (delta > 0) return { emoji: "📈", label: "En hausse", cls: "text-emerald-400/90" };
  if (delta < 0) return { emoji: "📉", label: "En baisse", cls: "text-red-400/90" };
  return { emoji: "•", label: "Stable", cls: "text-muted" };
}

export async function WeeklyRace() {
  const [players, weekly] = await Promise.all([
    listPlayers(),
    getWeeklyProgress(),
  ]);

  const rows = players
    .map((p) => ({ p, w: weekly.get(p.id) }))
    .filter(
      (x): x is { p: PlayerView; w: WeeklyProgress } =>
        x.w != null && x.w.delta !== 0
    )
    .sort((a, b) => b.w.delta - a.w.delta);

  // Une "course" n'a de sens qu'avec au moins deux joueurs qui ont bougé.
  if (rows.length < 2) return null;

  const shown = rows.slice(0, 8);

  return (
    <section className="mb-10 board-stagger-1">
      <div className="section-header">
        <h2 className="font-display text-xl text-gold-light">Cette semaine</h2>
        <p className="text-sm text-muted">
          Progression LP sur les 7 derniers jours
        </p>
      </div>

      <div className="card-glow relative z-[1]">
        <ul className="relative z-[1] space-y-1.5">
          {shown.map(({ p, w }, i) => {
            const m = momentum(w.delta);
            const positive = w.delta >= 0;
            return (
              <li key={p.id}>
                <Link
                  href={`/games/${p.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2 transition-colors hover:border-gold/20 hover:bg-white/[0.03]"
                >
                  <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted">
                    {i + 1}
                  </span>
                  {p.owner ? (
                    <UserAvatar
                      displayName={p.owner.displayName}
                      avatarUrl={p.owner.avatarUrl}
                      size={32}
                      className="shrink-0"
                    />
                  ) : p.currentTier ? (
                    <RankEmblem
                      tier={p.currentTier}
                      size={30}
                      className="shrink-0"
                    />
                  ) : (
                    <span className="h-8 w-8 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium group-hover:text-gold-light transition">
                      {playerListName(p)}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {playerListSubtitle(p)}
                      <span className={`ml-1.5 ${m.cls}`}>
                        {m.emoji} {m.label}
                      </span>
                    </p>
                  </div>
                  <Sparkline
                    values={w.points.map((pt) => pt.v)}
                    color={positive ? POSITIVE : NEGATIVE}
                  />
                  <span
                    className={`w-16 shrink-0 text-right font-display text-base tabular-nums ${
                      positive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {w.delta > 0 ? `+${w.delta}` : w.delta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
