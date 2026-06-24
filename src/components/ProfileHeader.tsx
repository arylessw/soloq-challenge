"use client";

import type { ReactNode } from "react";
import { RankEmblem } from "@/components/RankEmblem";
import { ShareProfileButton } from "@/components/ShareProfileButton";
import { TitleBadgeList } from "@/components/TitleBadge";
import { PlayerMeta } from "@/components/PlayerMeta";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import type { PlayerView } from "@/lib/players";
import { playerListName } from "@/lib/player-display";
import type { PlayerTitle } from "@/lib/player-titles";
import { tierAccentKey, TIER_ACCENT_VARS, DEFAULT_TIER_ACCENT } from "@/lib/tier-accent";
import {
  DIVISIONS,
  TIERS,
  TIER_LABELS,
  divisionIndex,
  divisionRequired,
  tierIndex,
  type Division,
  type Tier,
} from "@/lib/ranks";

function nextStepLabel(tier: string, division: string | null): string {
  const t = tier.toUpperCase() as Tier;
  if (division && division.toUpperCase() === "I") {
    const next = TIERS[tierIndex(tier) + 1];
    return next ? `Promo ${TIER_LABELS[next]}` : "Palier max";
  }
  if (division) {
    const di = divisionIndex(division);
    const nextDiv = DIVISIONS[di + 1] as Division | undefined;
    if (nextDiv) return `${TIER_LABELS[t] ?? tier} ${nextDiv}`;
  }
  return "Division suivante";
}

type Props = {
  player: PlayerView;
  titles: PlayerTitle[];
};

export function ProfileHeader({ player, titles }: Props) {
  const tierKey = tierAccentKey(player.currentTier);
  const accent = TIER_ACCENT_VARS[tierKey] ?? DEFAULT_TIER_ACCENT;

  return (
    <header
      className="profile-banner relative overflow-hidden rounded-2xl border mb-8 z-[1]"
      style={{
        borderColor: `color-mix(in srgb, ${accent.main} 35%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent.main} 18%, #060a12) 0%, #0c1220 45%, #060a12 100%)`,
      }}
    >
      <div
        className="profile-banner-glow pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 20% 0%, color-mix(in srgb, ${accent.main} 25%, transparent), transparent 70%)`,
        }}
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {player.currentTier && (
            <RankEmblem
              tier={player.currentTier}
              size={72}
              className="shrink-0 drop-shadow-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted mb-1">
              Profil SoloQ Challenge
            </p>
            <h1
              className="font-display text-3xl sm:text-4xl mb-1"
              style={{ color: accent.light }}
            >
              {playerListName(player)}
            </h1>
            <p className="text-muted text-sm mb-2">#{player.tagLine}</p>
            {titles.length > 0 && (
              <div className="mb-2">
                <TitleBadgeList titles={titles} max={4} />
              </div>
            )}
            <PlayerMeta player={player} />
            <div className="mt-4">
              <ShareProfileButton player={player} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <StatTile label="Départ" value={player.startRank} />
          <StatTile label="Actuel" value={player.currentRank ?? "—"} />
          {player.lpNet != null && player.lpNet !== 0 ? (
            <StatTile
              label="Progression"
              value={
                <AnimatedNumber
                  value={player.lpNet}
                  prefix={player.lpNet > 0 ? "+" : ""}
                  suffix=" LP"
                  className={
                    player.lpNet > 0
                      ? "text-emerald-400 font-semibold text-lg"
                      : "text-red-400 font-semibold text-lg"
                  }
                />
              }
            />
          ) : (
            <StatTile label="Progression" value="—" />
          )}
          {player.wins != null && player.losses != null ? (
            <StatTile
              label="W/L saison"
              value={
                <span className="tabular-nums text-white/90 text-lg">
                  <AnimatedNumber value={player.wins} />V /{" "}
                  <AnimatedNumber value={player.losses} />D
                  {player.winrate != null && (
                    <span className="text-muted text-sm ml-1">
                      (
                      <AnimatedNumber value={player.winrate} suffix="%" />)
                    </span>
                  )}
                </span>
              }
            />
          ) : (
            <StatTile label="W/L saison" value="—" />
          )}
        </div>

        {player.currentTier && player.currentLp != null && (
          <RankProgress
            tier={player.currentTier}
            division={player.currentDivision}
            lp={player.currentLp}
            accent={accent}
          />
        )}
      </div>
    </header>
  );
}

function RankProgress({
  tier,
  division,
  lp,
  accent,
}: {
  tier: string;
  division: string | null;
  lp: number;
  accent: { main: string; light: string };
}) {
  const apex = !divisionRequired(tier);

  if (apex) {
    return (
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
          <span>Palier {TIER_LABELS[tier.toUpperCase() as Tier] ?? tier}</span>
          <span className="tabular-nums" style={{ color: accent.light }}>
            {lp} LP
          </span>
        </div>
        <div className="rank-lp-track">
          <div
            className="rank-lp-fill"
            style={{
              width: "100%",
              opacity: 0.5,
              background: `linear-gradient(90deg, ${accent.main}, ${accent.light})`,
            }}
          />
        </div>
      </div>
    );
  }

  const pct = Math.max(3, Math.min(100, lp));

  return (
    <div className="mt-5" title={`${lp} / 100 LP`}>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
        <span className="tabular-nums">{lp} / 100 LP</span>
        <span className="inline-flex items-center gap-1">
          <span className="opacity-60" aria-hidden>
            →
          </span>
          <span style={{ color: accent.light }}>
            {nextStepLabel(tier, division)}
          </span>
        </span>
      </div>
      <div className="rank-lp-track">
        <div
          className="rank-lp-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent.main}, ${accent.light})`,
          }}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="stat-tile rounded-xl border border-white/[0.08] bg-black/25 px-4 py-3">
      <p className="text-muted text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <div className="text-white/90 text-sm sm:text-base font-medium">{value}</div>
    </div>
  );
}
