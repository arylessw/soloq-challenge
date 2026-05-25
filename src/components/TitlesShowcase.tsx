import Link from "next/link";
import { TitleBadge } from "@/components/TitleBadge";
import { assignTitles } from "@/lib/player-titles";
import { listPlayers } from "@/lib/players";
import { playerListName } from "@/lib/player-display";

export async function TitlesShowcase() {
  const players = await listPlayers();
  const map = assignTitles(players);

  const featured = players
    .map((p) => ({ player: p, titles: map.get(p.id) ?? [] }))
    .filter((x) => x.titles.length > 0)
    .slice(0, 6);

  if (featured.length === 0) return null;

  return (
    <section className="mb-10 board-stagger-1">
      <div className="section-header">
        <h2 className="font-display text-xl text-gold-light">Titres du défi</h2>
        <p className="text-sm text-muted">Attribués automatiquement selon les stats</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map(({ player, titles }) => (
          <Link
            key={player.id}
            href={`/games/${player.id}`}
            className="title-showcase-card group"
          >
            <p className="font-medium group-hover:text-gold-light transition truncate">
              {playerListName(player)}
            </p>
            <p className="text-[11px] text-muted mb-2">#{player.tagLine}</p>
            <div className="flex flex-wrap gap-1">
              {titles.slice(0, 3).map((t) => (
                <TitleBadge key={t.id} title={t} />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
