import type { PlayerView } from "@/lib/players";

export type PlayerTitle = {
  id: string;
  label: string;
  emoji: string;
  tone: "gold" | "emerald" | "sky" | "red" | "violet";
};

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
    push(roiLp, { id: "roi-lp", label: "Roi du grind", emoji: "👑", tone: "gold" });
  }

  const carry = topBy(
    players,
    (p) => (p.kdaGames != null && p.kdaGames >= MIN_GAMES_KDA ? p.avgKda : null),
    true
  );
  if (carry) {
    push(carry, { id: "carry", label: "Carry", emoji: "⚔️", tone: "emerald" });
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
    push(intable, {
      id: "intable",
      label: "Intenable",
      emoji: "🎭",
      tone: "red",
    });
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
    push(sniper, {
      id: "sniper",
      label: "Sniper",
      emoji: "🎯",
      tone: "sky",
    });
  }

  const marathon = topBy(
    players,
    (p) => (p.wins ?? 0) + (p.losses ?? 0),
    true
  );
  if (marathon) {
    push(marathon, {
      id: "marathon",
      label: "Marathonien",
      emoji: "🏃",
      tone: "violet",
    });
  }

  for (const p of players) {
    if (p.streakType === "WIN" && p.streakCount >= 4) {
      push(p.id, {
        id: "on-fire",
        label: `En feu ×${p.streakCount}`,
        emoji: "🔥",
        tone: "emerald",
      });
    }
    if (p.streakType === "LOSS" && p.streakCount >= 4) {
      push(p.id, {
        id: "tilt",
        label: `Tilt ×${p.streakCount}`,
        emoji: "💀",
        tone: "red",
      });
    }
    if (p.mainChampion && p.mainChampion.games >= 8 && p.mainChampion.winrate >= 58) {
      push(p.id, {
        id: "otp",
        label: `OTP ${p.mainChampion.championName}`,
        emoji: "🎮",
        tone: "gold",
      });
    }
    if (p.lpNet != null && p.lpNet >= 80) {
      push(p.id, {
        id: "climber",
        label: "Grimpeur",
        emoji: "📈",
        tone: "emerald",
      });
    }
    if (p.lpNet != null && p.lpNet <= -60) {
      push(p.id, {
        id: "diver",
        label: "En plongée",
        emoji: "📉",
        tone: "red",
      });
    }
    if (p.avgKda != null && p.avgKda >= 4.5 && (p.kdaGames ?? 0) >= 3) {
      push(p.id, {
        id: "god",
        label: "Monstre KDA",
        emoji: "✨",
        tone: "violet",
      });
    }
  }

  return map;
}

export function getPrimaryTitle(titles: PlayerTitle[]): PlayerTitle | null {
  return titles[0] ?? null;
}
