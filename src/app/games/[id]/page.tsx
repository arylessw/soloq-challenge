import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerMatchHistory } from "@/components/PlayerMatchHistory";
import { getPlayerById } from "@/lib/players";

type Props = { params: Promise<{ id: string }> };

export default async function PlayerGamesPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) notFound();

  return (
    <div>
      <Link
        href="/games"
        className="text-sm text-muted hover:text-gold-light transition mb-6 inline-block"
      >
        ← Retour aux profils
      </Link>

      <header className="card mb-8">
        <h1 className="font-display text-3xl text-gold mb-2">{player.riotId}</h1>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <p className="text-muted text-xs uppercase tracking-wider">Départ</p>
            <p>{player.startRank}</p>
          </div>
          <div>
            <p className="text-muted text-xs uppercase tracking-wider">Actuel</p>
            <p>{player.currentRank ?? "—"}</p>
          </div>
          {player.lpNet != null && player.lpNet !== 0 && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wider">
                Progression
              </p>
              <p
                className={
                  player.lpNet > 0 ? "text-emerald-400" : "text-red-400"
                }
              >
                {player.progressLabel}
              </p>
            </div>
          )}
          {player.wins != null && player.losses != null && (
            <div>
              <p className="text-muted text-xs uppercase tracking-wider">Saison</p>
              <p>
                {player.wins}V / {player.losses}D
                {player.winrate != null ? ` (${player.winrate}%)` : ""}
              </p>
            </div>
          )}
        </div>
      </header>

      <h2 className="font-display text-xl text-gold mb-4">
        Historique ranked solo
      </h2>
      <PlayerMatchHistory playerId={id} />
    </div>
  );
}
