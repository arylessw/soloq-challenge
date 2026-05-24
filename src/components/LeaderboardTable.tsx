import Link from "next/link";
import { PlayerMeta } from "@/components/PlayerMeta";
import { RankWithEmblem } from "@/components/RankEmblem";
import { formatRelativeTimeFromIso } from "@/lib/format-time";
import type { PlayerView } from "@/lib/players";
import {
  formatMetric,
  metricSubtext,
  metricTone,
  type LeaderboardMeta,
} from "@/lib/leaderboards";

type Props = {
  players: PlayerView[];
  board: LeaderboardMeta;
  startRank?: number;
};

export function LeaderboardTable({ players, board, startRank = 1 }: Props) {
  if (players.length === 0) return null;

  return (
    <div className="table-shell">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gold/15 text-muted uppercase text-[11px] tracking-wider">
            <th className="py-3.5 pl-6 pr-4 font-medium">#</th>
            <th className="py-3.5 pr-4 font-medium">Joueur</th>
            {board.id === "lp" && (
              <>
                <th className="py-3.5 pr-4 hidden sm:table-cell font-medium">Départ</th>
                <th className="py-3.5 pr-4 font-medium">Actuel</th>
              </>
            )}
            {board.id === "rank" && (
              <th className="py-3.5 pr-4 hidden md:table-cell font-medium">Départ</th>
            )}
            <th className="py-3.5 pr-4 font-medium">{board.metricLabel}</th>
            <th className="py-3.5 pr-4 hidden md:table-cell font-medium">
              Dernière game
            </th>
            {(board.id === "lp" || board.id === "winrate") && (
              <>
                <th className="py-3.5 pr-4 hidden lg:table-cell font-medium">W/L</th>
                <th className="py-3.5 pr-4 hidden lg:table-cell font-medium">WR</th>
              </>
            )}
            {board.id === "kda" && (
              <th className="py-3.5 pr-4 hidden sm:table-cell font-medium">Parties</th>
            )}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const place = startRank + i;
            const tone = metricTone(p, board.id);

            return (
              <tr key={p.id} className="border-b border-white/[0.04]">
                <td className="py-4 pl-6 pr-4 w-14">
                  <span
                    className={`rank-badge text-xs ${
                      place <= 3 && startRank === 1 ? "rank-badge-muted" : "rank-badge-muted"
                    }`}
                  >
                    {place}
                  </span>
                </td>
                <td className="py-4 pr-4 font-medium min-w-[140px]">
                  <Link
                    href={`/games/${p.id}`}
                    className="hover:text-gold-light transition inline-flex flex-col"
                  >
                    <span>{p.gameName}</span>
                    <span className="text-[11px] text-muted font-normal">#{p.tagLine}</span>
                    <PlayerMeta player={p} />
                  </Link>
                </td>

                {board.id === "lp" && (
                  <>
                    <td className="py-4 pr-4 text-muted hidden sm:table-cell">
                      <RankWithEmblem tier={p.startTier} label={p.startRank} size={22} />
                    </td>
                    <td className="py-4 pr-4">
                      {p.currentTier && p.currentRank ? (
                        <RankWithEmblem tier={p.currentTier} label={p.currentRank} size={22} />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </>
                )}

                {board.id === "rank" && (
                  <td className="py-4 pr-4 text-muted hidden md:table-cell">
                    <RankWithEmblem tier={p.startTier} label={p.startRank} size={22} />
                  </td>
                )}

                <td className="py-4 pr-4">
                  <div>
                    {board.id === "rank" && p.currentTier && p.currentRank ? (
                      <RankWithEmblem tier={p.currentTier} label={p.currentRank} size={24} />
                    ) : (
                      <span
                        className={
                          tone === "positive"
                            ? "text-emerald-400 font-semibold"
                            : tone === "negative"
                              ? "text-red-400 font-semibold"
                              : "text-gold-light font-semibold"
                        }
                      >
                        {formatMetric(p, board.id)}
                      </span>
                    )}
                    {metricSubtext(p, board.id) &&
                      board.id !== "lp" &&
                      board.id !== "winrate" && (
                        <p className="text-xs text-muted mt-0.5">
                          {metricSubtext(p, board.id)}
                        </p>
                      )}
                  </div>
                </td>

                <td className="py-4 pr-4 text-muted hidden md:table-cell text-xs whitespace-nowrap">
                  {formatRelativeTimeFromIso(p.lastGameAt) ?? "—"}
                </td>

                {(board.id === "lp" || board.id === "winrate") && (
                  <>
                    <td className="py-4 pr-4 text-muted hidden lg:table-cell tabular-nums">
                      {p.wins != null && p.losses != null
                        ? `${p.wins}V / ${p.losses}D`
                        : "—"}
                    </td>
                    <td className="py-4 hidden lg:table-cell tabular-nums">
                      {p.winrate != null ? (
                        <span
                          className={
                            p.winrate >= 55
                              ? "text-emerald-400/90"
                              : p.winrate < 45
                                ? "text-red-400/80"
                                : "text-muted"
                          }
                        >
                          {p.winrate}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </>
                )}

                {board.id === "kda" && (
                  <td className="py-4 pr-4 text-muted hidden sm:table-cell tabular-nums">
                    {p.kdaGames ?? "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
