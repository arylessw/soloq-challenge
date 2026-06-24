import { RankEmblem } from "@/components/RankEmblem";
import { UserAvatar } from "@/components/UserAvatar";
import { accentFor } from "@/lib/compare";
import { playerListName } from "@/lib/player-display";
import type { PlayerView } from "@/lib/players";

type Props = {
  a: PlayerView;
  b: PlayerView;
  aWins: number;
  bWins: number;
};

export function CompareVsBanner({ a, b, aWins, bWins }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-3 sm:gap-4 mb-8 board-stagger-1">
      <PlayerSide player={a} align="right" leading={aWins > bWins} />
      <div className="flex flex-col items-center justify-center px-1 sm:px-3">
        <span className="duel-vs text-2xl sm:text-3xl">VS</span>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold tabular-nums">
          <span className={aWins >= bWins ? "text-gold-light" : "text-muted"}>
            {aWins}
          </span>
          <span className="text-muted/50">–</span>
          <span className={bWins >= aWins ? "text-gold-light" : "text-muted"}>
            {bWins}
          </span>
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-wider text-muted/70">
          domaines
        </span>
      </div>
      <PlayerSide player={b} align="left" leading={bWins > aWins} />
    </div>
  );
}

function PlayerSide({
  player,
  align,
  leading,
}: {
  player: PlayerView;
  align: "left" | "right";
  leading: boolean;
}) {
  const accent = accentFor(player);
  const right = align === "right";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 sm:p-5"
      style={{
        borderColor: `color-mix(in srgb, ${accent.main} ${leading ? "55%" : "30%"}, transparent)`,
        background: `linear-gradient(${right ? "135deg" : "225deg"}, color-mix(in srgb, ${accent.main} 16%, #060a12) 0%, #0c1220 55%, #060a12 100%)`,
        boxShadow: leading
          ? `0 0 32px -10px color-mix(in srgb, ${accent.main} 60%, transparent)`
          : undefined,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at ${right ? "85%" : "15%"} 0%, color-mix(in srgb, ${accent.main} 22%, transparent), transparent 70%)`,
        }}
        aria-hidden
      />
      <div
        className={`relative flex items-center gap-3 text-left ${right ? "sm:flex-row-reverse sm:text-right" : ""}`}
      >
        {player.currentTier ? (
          <RankEmblem
            tier={player.currentTier}
            size={52}
            className="shrink-0 drop-shadow-lg"
          />
        ) : player.owner ? (
          <UserAvatar
            displayName={player.owner.displayName}
            avatarUrl={player.owner.avatarUrl}
            size={52}
            className="shrink-0"
          />
        ) : null}
        <div className="min-w-0">
          {leading && (
            <span className="mb-1 inline-block text-[10px] uppercase tracking-wider" style={{ color: accent.light }}>
              ★ En tête
            </span>
          )}
          <h2
            className="font-display text-xl sm:text-2xl truncate"
            style={{ color: accent.light }}
          >
            {playerListName(player)}
          </h2>
          <p className="text-xs text-muted truncate">{player.riotId}</p>
          <p className="mt-1 text-sm text-white/85 truncate">
            {player.currentRank ?? "Non classé"}
          </p>
        </div>
      </div>
    </div>
  );
}
