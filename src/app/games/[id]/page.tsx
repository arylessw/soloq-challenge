import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChampionStatsPanel } from "@/components/ChampionStatsPanel";
import { RoleStatsPanel } from "@/components/RoleStatsPanel";
import { LpChart } from "@/components/LpChart";
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory";
import { ProfileHeader } from "@/components/ProfileHeader";
import { TierProfileAccent } from "@/components/TierProfileAccent";
import { getLpHistory } from "@/lib/lp-snapshots";
import { assignTitles } from "@/lib/player-titles";
import { getPlayerById, listPlayers } from "@/lib/players";
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
  const [player, lpHistory, allPlayers] = await Promise.all([
    getPlayerById(id),
    getLpHistory(id),
    listPlayers(),
  ]);

  if (!player) notFound();

  const titles = assignTitles(allPlayers).get(id) ?? [];

  return (
    <TierProfileAccent tier={player.currentTier}>
    <div>
      <Link
        href="/games"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-gold-light transition mb-6"
      >
        <span aria-hidden>←</span> Retour aux profils
      </Link>

      <ProfileHeader player={player} titles={titles} />

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
    </TierProfileAccent>
  );
}
