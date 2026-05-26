"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { PlayerView } from "@/lib/players";
import { formatKdaValue } from "@/lib/kda";
import { formatMetric, type LeaderboardId } from "@/lib/leaderboards";

type Tone = "positive" | "negative" | "neutral";

type Props = {
  player: PlayerView;
  boardId: LeaderboardId;
  tone: Tone;
  className?: string;
};

function toneClass(tone: Tone): string {
  if (tone === "positive") return "text-emerald-400 font-semibold";
  if (tone === "negative") return "text-red-400 font-semibold";
  return "text-gold-light font-semibold";
}

export function AnimatedMetric({ player, boardId, tone, className = "" }: Props) {
  const cls = `${toneClass(tone)} ${className}`;

  if (boardId === "lp" && player.lpNet != null && player.lpNet !== 0) {
    const n = player.lpNet;
    return (
      <AnimatedNumber
        value={n}
        prefix={n > 0 ? "+" : ""}
        suffix=" LP"
        className={cls}
      />
    );
  }

  if (boardId === "winrate" && player.winrate != null) {
    return (
      <AnimatedNumber value={player.winrate} suffix="%" className={cls} />
    );
  }

  if (boardId === "kda" && player.avgKda != null) {
    return (
      <span className={cls}>
        <AnimatedNumber value={player.avgKda} decimals={2} />
      </span>
    );
  }

  if (
    boardId === "champion" &&
    player.mainChampion &&
    player.mainChampion.games >= 5
  ) {
    return (
      <AnimatedNumber
        value={player.mainChampion.winrate}
        suffix="%"
        className={cls}
      />
    );
  }

  if (boardId === "role" && player.mainRole && player.mainRole.games >= 5) {
    return (
      <AnimatedNumber value={player.mainRole.winrate} suffix="%" className={cls} />
    );
  }

  return <span className={cls}>{formatMetric(player, boardId)}</span>;
}
