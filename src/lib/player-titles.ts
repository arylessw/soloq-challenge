import type { PlayerView } from "@/lib/players";

export type PlayerTitle = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  tone: "gold" | "emerald" | "sky" | "red" | "violet";
};

function title(
  t: Omit<PlayerTitle, "description"> & { description: string }
): PlayerTitle {
  return t;
}

const MIN_GAMES_KDA = 5;
const MIN_GAMES_WR = 8;

function topBy<T>(
  players: PlayerView[],
  score: (p: PlayerView) => T | null,
  preferHigher: boolean
): string | null {
  let bestId: string | null = null;
  let best: T | null = null;

  for (const p of players) {
    const s = score(p);
    if (s == null) continue;
    if (
      best == null ||
      (preferHigher ? s > best : s < best) ||
      (s === best && preferHigher)
    ) {
      best = s;
      bestId = p.id;
    }
  }
  return bestId;
}

/** Titres globaux (un seul détenteur chacun) + titres personnels */
export function assignTitles(players: PlayerView[]): Map<string, PlayerTitle[]> {
  const map = new Map<string, PlayerTitle[]>();
  const push = (id: string, title: PlayerTitle) => {
    const list = map.get(id) ?? [];
    if (!list.some((t) => t.id === title.id)) list.push(title);
    map.set(id, list);
  };

  if (players.length === 0) return map;

  const roiLp = topBy(players, (p) => p.lpNet, true);
  if (roiLp) {
    push(
      roiLp,
      title({
        id: "roi-lp",
        label: "Roi du grind",
        emoji: "👑",
        tone: "gold",
        description:
          "Plus grande progression LP depuis le rang de départ du défi.",
      })
    );
  }

  const carry = topBy(
    players,
    (p) => (p.kdaGames != null && p.kdaGames >= MIN_GAMES_KDA ? p.avgKda : null),
    true
  );
  if (carry) {
    push(
      carry,
      title({
        id: "carry",
        label: "Carry",
        emoji: "⚔️",
        tone: "emerald",
        description: `Meilleur KDA moyen (min. ${MIN_GAMES_KDA} parties ranked).`,
      })
    );
  }

  const intable = topBy(
    players,
    (p) => {
      const g = (p.wins ?? 0) + (p.losses ?? 0);
      return g >= MIN_GAMES_WR && p.winrate != null ? p.winrate : null;
    },
    false
  );
  if (intable) {
    push(
      intable,
      title({
        id: "intable",
        label: "Intenable",
        emoji: "🎭",
        tone: "red",
        description: `Plus bas winrate du groupe (min. ${MIN_GAMES_WR} parties).`,
      })
    );
  }

  const sniper = topBy(
    players,
    (p) => {
      const g = (p.wins ?? 0) + (p.losses ?? 0);
      return g >= MIN_GAMES_WR && p.winrate != null ? p.winrate : null;
    },
    true
  );
  if (sniper && sniper !== intable) {
    push(
      sniper,
      title({
        id: "sniper",
        label: "Sniper",
        emoji: "🎯",
        tone: "sky",
        description: `Meilleur winrate du groupe (min. ${MIN_GAMES_WR} parties).`,
      })
    );
  }

  const marathon = topBy(
    players,
    (p) => (p.wins ?? 0) + (p.losses ?? 0),
    true
  );
  if (marathon) {
    push(
      marathon,
      title({
        id: "marathon",
        label: "Marathonien",
        emoji: "🏃",
        tone: "violet",
        description: "Le plus de parties ranked jouées cette saison.",
      })
    );
  }

  for (const p of players) {
    if (p.streakType === "WIN" && p.streakCount >= 4) {
      push(
        p.id,
        title({
          id: "on-fire",
          label: `En feu ×${p.streakCount}`,
          emoji: "🔥",
          tone: "emerald",
          description: `${p.streakCount} victoires d'affilée sur les dernières parties.`,
        })
      );
    }
    if (p.streakType === "LOSS" && p.streakCount >= 4) {
      push(
        p.id,
        title({
          id: "tilt",
          label: `Tilt ×${p.streakCount}`,
          emoji: "💀",
          tone: "red",
          description: `${p.streakCount} défaites d'affilée sur les dernières parties.`,
        })
      );
    }
    if (p.mainChampion && p.mainChampion.games >= 8 && p.mainChampion.winrate >= 58) {
      push(
        p.id,
        title({
          id: "otp",
          label: `OTP ${p.mainChampion.championName}`,
          emoji: "🎮",
          tone: "gold",
          description: `Main ${p.mainChampion.championName} : ${p.mainChampion.winrate}% WR sur ${p.mainChampion.games} games.`,
        })
      );
    }
    if (p.lpNet != null && p.lpNet >= 80) {
      push(
        p.id,
        title({
          id: "climber",
          label: "Grimpeur",
          emoji: "📈",
          tone: "emerald",
          description: `+${p.lpNet} LP de progression depuis l'inscription au défi.`,
        })
      );
    }
    if (p.lpNet != null && p.lpNet <= -60) {
      push(
        p.id,
        title({
          id: "diver",
          label: "En plongée",
          emoji: "📉",
          tone: "red",
          description: `${p.lpNet} LP de progression (en baisse depuis le départ).`,
        })
      );
    }
    if (p.avgKda != null && p.avgKda >= 4.5 && (p.kdaGames ?? 0) >= 3) {
      push(
        p.id,
        title({
          id: "god",
          label: "Monstre KDA",
          emoji: "✨",
          tone: "violet",
          description: `KDA moyen de ${p.avgKda?.toFixed(2)} sur les parties du défi.`,
        })
      );
    }
  }

  return map;
}

export function getPrimaryTitle(titles: PlayerTitle[]): PlayerTitle | null {
  return titles[0] ?? null;
}
