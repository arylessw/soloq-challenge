import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChampionStatsPanel } from "@/components/ChampionStatsPanel";
import { RoleStatsPanel } from "@/components/RoleStatsPanel";
import { LpChart } from "@/components/LpChart";
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory";
import { PlayerMeta } from "@/components/PlayerMeta";
import { RankEmblem } from "@/components/RankEmblem";
import { ShareProfileButton } from "@/components/ShareProfileButton";
import { getLpHistory } from "@/lib/lp-snapshots";
import { getPlayerById } from "@/lib/players";
import { getSiteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) return { title: "Joueur introuvable" };

  const siteUrl = getSiteUrl();
  const title = `${player.gameName}#${player.tagLine} — SoloQ Challenge`;
  const description = `${player.currentRank ?? "Profil"} · ${player.progressLabel ?? "Progression"} · SoloQ Challenge EUW`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${siteUrl}/games/${id}`,
      images: [{ url: `${siteUrl}/games/${id}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/games/${id}/opengraph-image`],
    },
  };
}

export default async function PlayerGamesPage({ params }: Props) {
  const { id } = await params;
  const [player, lpHistory] = await Promise.all([
    getPlayerById(id),
    getLpHistory(id),
  ]);

  if (!player) notFound();

  return (
    <div>
      <Link
        href="/games"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-gold-light transition mb-6"
      >
        <span aria-hidden>←</span> Retour aux profils
      </Link>

      <header className="card-glow mb-8 relative z-[1]">
        <div className="flex flex-wrap items-start gap-5">
          {player.currentTier && (
            <RankEmblem tier={player.currentTier} size={64} className="shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-gold-light mb-1">
              {player.gameName}
            </h1>
            <p className="text-muted text-sm mb-2">#{player.tagLine}</p>
            <PlayerMeta player={player} />
            <div className="mt-4">
              <ShareProfileButton player={player} />
            </div>
            <div className="flex flex-wrap gap-6 text-sm mt-6">
              <div>
                <p className="text-muted text-[10px] uppercase tracking-wider mb-1">
                  Départ
                </p>
                <p className="text-white/90">{player.startRank}</p>
              </div>
              <div>
                <p className="text-muted text-[10px] uppercase tracking-wider mb-1">
                  Actuel
                </p>
                <p className="text-white/90">{player.currentRank ?? "—"}</p>
              </div>
              {player.lpNet != null && player.lpNet !== 0 && (
                <div>
                  <p className="text-muted text-[10px] uppercase tracking-wider mb-1">
                    Progression
                  </p>
                  <p
                    className={
                      player.lpNet > 0
                        ? "text-emerald-400 font-semibold"
                        : "text-red-400 font-semibold"
                    }
                  >
                    {player.progressLabel}
                  </p>
                </div>
              )}
              {player.wins != null && player.losses != null && (
                <div>
                  <p className="text-muted text-[10px] uppercase tracking-wider mb-1">
                    W/L saison
                  </p>
                  <p className="tabular-nums text-white/90">
                    {player.wins}V / {player.losses}D
                    {player.winrate != null ? ` (${player.winrate}%)` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <LpChart points={lpHistory} />
        <ChampionStatsPanel stats={player.championStats} />
      </div>

      <div className="mb-10">
        <RoleStatsPanel stats={player.roleStats} />
      </div>

      <h2 className="font-display text-xl text-gold-light mb-4">
        20 dernières parties ranked solo
      </h2>
      <PlayerMatchHistory playerId={id} />
    </div>
  );
}
