import Image from "next/image";
import Link from "next/link";
import { PlayerMeta } from "@/components/PlayerMeta";
import { RankEmblem } from "@/components/RankEmblem";
import { UserAvatar } from "@/components/UserAvatar";
import { championIconUrl } from "@/lib/champion-stats";
import { playerListName, playerListSubtitle } from "@/lib/player-display";
import { roleIconUrl } from "@/lib/role-stats";
import type { PlayerView } from "@/lib/players";
import {
  formatMetric,
  metricSubtext,
  metricTone,
  type LeaderboardId,
} from "@/lib/leaderboards";
import { tierCardClass } from "@/lib/tier-styles";

const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_HEIGHT = ["h-24", "h-32", "h-20"] as const;

type Props = {
  players: PlayerView[];
  boardId: LeaderboardId;
};

export function LeaderboardPodium({ players, boardId }: Props) {
  const top = players.slice(0, 3);
  if (top.length === 0) return null;

  const slots = PODIUM_ORDER.map((rankIdx, displayIdx) => {
    const p = top[rankIdx];
    if (!p) return null;
    const place = rankIdx + 1;
    const tone = metricTone(p, boardId);
    const isFirst = place === 1;

    return (
      <div
        key={p.id}
        className={`flex flex-col items-center flex-1 max-w-[220px] ${
          displayIdx === 1 ? "order-2 sm:-mt-4 z-10" : displayIdx === 0 ? "order-1" : "order-3"
        }`}
      >
        <Link
          href={`/games/${p.id}`}
          className={`podium-card w-full group shadow-lg ${tierCardClass(p.currentTier)} ${
            isFirst ? "podium-first ring-1 ring-gold/40" : ""
          }`}
        >
          <div
            className={`rank-badge mx-auto mb-3 ${
              isFirst ? "rank-badge-gold h-11 w-11 text-lg" : "rank-badge-muted"
            }`}
          >
            {place}
          </div>
          {p.owner ? (
            <UserAvatar
              displayName={p.owner.displayName}
              avatarUrl={p.owner.avatarUrl}
              size={isFirst ? 72 : 56}
              className="mx-auto mb-2"
            />
          ) : boardId === "champion" && p.mainChampion ? (
            <Image
              src={championIconUrl(p.mainChampion.championName)}
              alt={p.mainChampion.championName}
              width={isFirst ? 72 : 56}
              height={isFirst ? 72 : 56}
              className="mx-auto mb-2 rounded-xl border-2 border-gold/40"
              unoptimized
            />
          ) : boardId === "role" && p.mainRole ? (
            <Image
              src={roleIconUrl(p.mainRole.role)}
              alt={p.mainRole.label}
              width={isFirst ? 56 : 44}
              height={isFirst ? 56 : 44}
              className="mx-auto mb-2"
              unoptimized
            />
          ) : (
            p.currentTier && (
              <RankEmblem
                tier={p.currentTier}
                size={isFirst ? 44 : 36}
                className="mx-auto mb-2 drop-shadow-lg"
              />
            )
          )}
          <p className="font-medium truncate group-hover:text-gold-light transition">
            {playerListName(p)}
          </p>
          <p className="text-[11px] text-muted truncate">{playerListSubtitle(p)}</p>
          <PlayerMeta player={p} />
          <p
            className={`font-display text-2xl mt-2 ${
              tone === "positive"
                ? "text-emerald-400"
                : tone === "negative"
                  ? "text-red-400"
                  : "text-gold-light"
            }`}
          >
            {formatMetric(p, boardId)}
          </p>
          {metricSubtext(p, boardId) && (
            <p className="text-xs text-muted mt-1">{metricSubtext(p, boardId)}</p>
          )}
        </Link>
        <div
          className={`podium-pillar ${PODIUM_HEIGHT[displayIdx]} ${
            isFirst ? "podium-pillar-gold" : ""
          }`}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted/80 font-medium">
            {place === 1 ? "1er" : place === 2 ? "2e" : "3e"}
          </span>
        </div>
      </div>
    );
  });

  return (
    <div className="mb-12 flex items-end justify-center gap-2 sm:gap-5 px-1">
      {slots}
    </div>
  );
}
