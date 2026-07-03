import type { WeeklyProgress } from "@/lib/lp-snapshots";
import { playerListName } from "@/lib/player-display";
import type { PlayerView } from "@/lib/players";

export type ChallengeRecord = {
  id: string;
  emoji: string;
  label: string;
  description: string;
  playerId: string;
  playerName: string;
  riotId: string;
  value: string;
  tone: "gold" | "win" | "loss";
};

function best<T>(
  items: T[],
  score: (x: T) => number | null,
  higher = true
): T | null {
  let bestItem: T | null = null;
  let bestScore: number | null = null;
  for (const it of items) {
    const s = score(it);
    if (s == null) continue;
    if (bestScore == null || (higher ? s > bestScore : s < bestScore)) {
      bestScore = s;
      bestItem = it;
    }
  }
  return bestItem;
}

function games(p: PlayerView): number | null {
  if (p.wins == null || p.losses == null) return null;
  return p.wins + p.losses;
}

/** Les records du défi — calculés sur les stats déjà persistées. */
export function buildRecords(
  players: PlayerView[],
  weekly: Map<string, WeeklyProgress>
): ChallengeRecord[] {
  const records: ChallengeRecord[] = [];

  const add = (
    id: string,
    emoji: string,
    label: string,
    description: string,
    p: PlayerView | null,
    value: string,
    tone: ChallengeRecord["tone"] = "gold"
  ) => {
    if (!p) return;
    records.push({
      id,
      emoji,
      label,
      description,
      playerId: p.id,
      playerName: playerListName(p),
      riotId: p.riotId,
      value,
      tone,
    });
  };

  const summit = best(players, (p) => p.rankScore);
  add(
    "summit",
    "👑",
    "Sommet du défi",
    "Le rang SoloQ le plus haut du groupe en ce moment.",
    summit,
    summit?.currentRank ?? "—"
  );

  const climber = best(players, (p) =>
    p.lpNet != null && p.lpNet > 0 ? p.lpNet : null
  );
  add(
    "climb",
    "📈",
    "Plus grosse ascension",
    "La plus grande progression LP depuis le rang de départ.",
    climber,
    climber?.lpNet != null ? `+${climber.lpNet} LP` : "—",
    "win"
  );

  const weekBest = best(players, (p) => {
    const w = weekly.get(p.id);
    return w && w.delta > 0 ? w.delta : null;
  });
  add(
    "week-best",
    "🚀",
    "Meilleure semaine",
    "Le plus de LP gagnés sur les 7 derniers jours.",
    weekBest,
    weekBest ? `+${weekly.get(weekBest.id)!.delta} LP` : "—",
    "win"
  );

  const streaker = best(players, (p) =>
    p.streakType === "WIN" && p.streakCount >= 2 ? p.streakCount : null
  );
  add(
    "streak",
    "🔥",
    "Série en cours",
    "La plus longue série de victoires active.",
    streaker,
    streaker ? `${streaker.streakCount} victoires d'affilée` : "—",
    "win"
  );

  const sniper = best(players, (p) => {
    const g = games(p);
    return g != null && g >= 20 && p.winrate != null ? p.winrate : null;
  });
  add(
    "winrate",
    "🎯",
    "Précision chirurgicale",
    "Le meilleur winrate de la saison (min. 20 parties).",
    sniper,
    sniper?.winrate != null
      ? `${sniper.winrate} % (${sniper.wins}V / ${sniper.losses}D)`
      : "—",
    "win"
  );

  const kdaGod = best(players, (p) =>
    p.avgKda != null && (p.kdaGames ?? 0) >= 5 ? p.avgKda : null
  );
  add(
    "kda",
    "⚔️",
    "Machine à KDA",
    "Le meilleur KDA moyen (min. 5 parties suivies).",
    kdaGod,
    kdaGod?.avgKda != null ? kdaGod.avgKda.toFixed(2) : "—"
  );

  const marathon = best(players, (p) => games(p));
  add(
    "marathon",
    "🏃",
    "Marathonien",
    "Le plus de parties ranked jouées cette saison.",
    marathon,
    marathon ? `${games(marathon)} parties` : "—"
  );

  const otp = best(players, (p) => p.mainChampion?.games ?? null);
  add(
    "otp",
    "🎮",
    "Fidélité absolue",
    "Le plus de parties sur un seul champion depuis l'inscription.",
    otp,
    otp?.mainChampion
      ? `${otp.mainChampion.championName} · ${otp.mainChampion.games} games`
      : "—"
  );

  const diver = best(
    players,
    (p) => (p.lpNet != null && p.lpNet < 0 ? p.lpNet : null),
    false
  );
  add(
    "dive",
    "💀",
    "Descente aux abysses",
    "La plus grosse perte de LP depuis le rang de départ. Courage.",
    diver,
    diver?.lpNet != null ? `${diver.lpNet} LP` : "—",
    "loss"
  );

  const weekWorst = best(
    players,
    (p) => {
      const w = weekly.get(p.id);
      return w && w.delta < 0 ? w.delta : null;
    },
    false
  );
  add(
    "week-worst",
    "🎢",
    "Semaine cauchemar",
    "Le plus de LP perdus sur les 7 derniers jours.",
    weekWorst,
    weekWorst ? `${weekly.get(weekWorst.id)!.delta} LP` : "—",
    "loss"
  );

  return records;
}
