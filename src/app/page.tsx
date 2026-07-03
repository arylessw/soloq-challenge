import Link from "next/link";
import { GroupMeta } from "@/components/GroupMeta";
import { Leaderboard } from "@/components/Leaderboard";
import { PageHero } from "@/components/PageHero";
import { PlayerOfWeekBanner } from "@/components/PlayerOfWeekBanner";
import { TitlesShowcase } from "@/components/TitlesShowcase";
import { WeeklyRace } from "@/components/WeeklyRace";
import { getPlayerOfWeek, hasEnoughWeekData } from "@/lib/player-of-week";

export default async function HomePage() {
  const [playerOfWeek, hasData] = await Promise.all([
    getPlayerOfWeek(),
    hasEnoughWeekData(),
  ]);

  return (
    <div>
      <PageHero
        title="SoloQ Challenge"
        description="Plusieurs classements pour suivre le défi entre amis — progression, rang, winrate et KDA."
      />
      <PlayerOfWeekBanner player={playerOfWeek} hasData={hasData} />

      <div className="flex flex-wrap justify-center gap-3 mb-10 board-stagger-1">
        <Link href="/duels" className="quick-link-card">
          <span className="quick-link-icon">⚔️</span>
          <span>
            <span className="font-medium text-gold-light">Duels 1v1</span>
            <span className="block text-xs text-muted">Affronte un ami sur la semaine</span>
          </span>
        </Link>
        <Link href="/games" className="quick-link-card">
          <span className="quick-link-icon">📊</span>
          <span>
            <span className="font-medium text-gold-light">Profils</span>
            <span className="block text-xs text-muted">Stats, champions & rôles</span>
          </span>
        </Link>
        <Link href="/records" className="quick-link-card">
          <span className="quick-link-icon">🏆</span>
          <span>
            <span className="font-medium text-gold-light">Records</span>
            <span className="block text-xs text-muted">Le hall of fame du défi</span>
          </span>
        </Link>
      </div>

      <WeeklyRace />
      <TitlesShowcase />
      <GroupMeta />
      <Leaderboard />
    </div>
  );
}
