import { GamesDirectory } from "@/components/GamesDirectory";
import { listPlayers } from "@/lib/players";

export default async function GamesPage() {
  const players = await listPlayers();

  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-gold mb-2">Games</h1>
        <p className="text-muted max-w-xl mx-auto">
          Profils des joueurs inscrits — clique sur un nom pour voir l&apos;historique
          des 20 dernières parties ranked solo (clic pour le détail complet).
        </p>
      </header>
      <GamesDirectory players={players} />
    </div>
  );
}
