import { Leaderboard } from "@/components/Leaderboard";
import { PageHero } from "@/components/PageHero";
import { PlayerOfWeekBanner } from "@/components/PlayerOfWeekBanner";
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
      <Leaderboard />
    </div>
  );
}
