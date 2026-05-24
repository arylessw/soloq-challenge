import { GamesDirectory } from "@/components/GamesDirectory";
import { PageHero } from "@/components/PageHero";
import { listPlayers } from "@/lib/players";

export default async function GamesPage() {
  const players = await listPlayers();

  return (
    <div>
      <PageHero
        eyebrow="Historique"
        title="Games"
        description="Profils des joueurs — clique pour voir les 20 dernières parties ranked solo."
      />
      <GamesDirectory players={players} />
    </div>
  );
}
