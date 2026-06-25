import { prisma } from "@/lib/db";
import { notifyDiscordDuelEnd } from "@/lib/discord";
import { getPlayerById, listPlayers, type PlayerView } from "@/lib/players";
import { playerWithOwnerInclude } from "@/lib/player-include";

export type DuelMetric = "lp" | "wins";

export type DuelSeriesPoint = { t: number; v: number };
export type DuelTimeline = { a: DuelSeriesPoint[]; b: DuelSeriesPoint[] };

export type DuelView = {
  id: string;
  metric: DuelMetric;
  status: string;
  startsAt: string;
  endsAt: string;
  playerA: PlayerView;
  playerB: PlayerView;
  scoreA: number;
  scoreB: number;
  leaderId: string | null;
  winnerId: string | null;
  daysLeft: number;
  /** Évolution du score (delta LP depuis le début) — duels LP actifs uniquement. */
  timeline: DuelTimeline | null;
};

function duelMetric(raw: string): DuelMetric {
  return raw === "wins" ? "wins" : "lp";
}

function scoreFor(
  player: PlayerView,
  side: "a" | "b",
  metric: DuelMetric,
  duel: {
    startLpNetA: number;
    startLpNetB: number;
    startWinsA: number;
    startWinsB: number;
  }
): number {
  if (metric === "lp") {
    const current = player.lpNet ?? 0;
    const start = side === "a" ? duel.startLpNetA : duel.startLpNetB;
    return current - start;
  }
  const wins = player.wins ?? 0;
  const start = side === "a" ? duel.startWinsA : duel.startWinsB;
  return Math.max(0, wins - start);
}

async function refreshDuelStatus(): Promise<void> {
  const now = new Date();
  const expired = await prisma.duel.findMany({
    where: { status: "active", endsAt: { lt: now } },
    include: {
      playerA: { include: playerWithOwnerInclude },
      playerB: { include: playerWithOwnerInclude },
    },
  });

  for (const d of expired) {
    const { toView } = await import("@/lib/players");
    const a = toView(d.playerA);
    const b = toView(d.playerB);
    const metric = duelMetric(d.metric);
    const scoreA = scoreFor(a, "a", metric, d);
    const scoreB = scoreFor(b, "b", metric, d);
    let winnerId: string | null = null;
    if (scoreA > scoreB) winnerId = d.playerAId;
    else if (scoreB > scoreA) winnerId = d.playerBId;

    await prisma.duel.update({
      where: { id: d.id },
      data: { status: "finished", winnerId },
    });

    if (winnerId) {
      const winner = winnerId === d.playerAId ? a : b;
      const loser = winnerId === d.playerAId ? b : a;
      try {
        await notifyDiscordDuelEnd(
          winner.riotId,
          loser.riotId,
          metric,
          winnerId === d.playerAId ? scoreA : scoreB,
          winnerId === d.playerAId ? scoreB : scoreA
        );
      } catch (e) {
        console.error("[duels] Discord notify", e);
      }
    }
  }
}

function toDuelView(
  duel: {
    id: string;
    metric: string;
    status: string;
    startsAt: Date;
    endsAt: Date;
    winnerId: string | null;
    playerAId: string;
    playerBId: string;
    startLpNetA: number;
    startLpNetB: number;
    startWinsA: number;
    startWinsB: number;
  },
  playerA: PlayerView,
  playerB: PlayerView
): DuelView {
  const metric = duelMetric(duel.metric);
  const scoreA = scoreFor(playerA, "a", metric, duel);
  const scoreB = scoreFor(playerB, "b", metric, duel);
  const leaderId =
    scoreA > scoreB
      ? duel.playerAId
      : scoreB > scoreA
        ? duel.playerBId
        : null;

  const msLeft = duel.endsAt.getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));

  return {
    id: duel.id,
    metric,
    status: duel.status,
    startsAt: duel.startsAt.toISOString(),
    endsAt: duel.endsAt.toISOString(),
    playerA,
    playerB,
    scoreA,
    scoreB,
    leaderId,
    winnerId: duel.winnerId,
    daysLeft,
    timeline: null,
  };
}

type RawDuel = {
  id: string;
  startsAt: Date;
  startLpNetA: number;
  startLpNetB: number;
  playerAId: string;
  playerBId: string;
};

/**
 * Attache à chaque duel LP actif l'évolution du score des deux joueurs
 * (delta LP depuis le début du duel) via une seule requête de snapshots.
 */
async function attachTimelines(
  views: DuelView[],
  raws: RawDuel[]
): Promise<void> {
  const lp = views
    .map((v, i) => ({ v, raw: raws[i] }))
    .filter((x) => x.v.metric === "lp");
  if (lp.length === 0) return;

  const playerIds = [
    ...new Set(lp.flatMap((x) => [x.v.playerA.id, x.v.playerB.id])),
  ];
  const minStart = new Date(
    Math.min(...lp.map((x) => x.raw.startsAt.getTime()))
  );

  const snaps = await prisma.lpSnapshot.findMany({
    where: { playerId: { in: playerIds }, recordedAt: { gte: minStart } },
    orderBy: { recordedAt: "asc" },
    select: { playerId: true, lpNet: true, recordedAt: true },
  });

  const byPlayer = new Map<string, { lpNet: number; recordedAt: Date }[]>();
  for (const s of snaps) {
    const arr = byPlayer.get(s.playerId) ?? [];
    arr.push(s);
    byPlayer.set(s.playerId, arr);
  }

  const now = Date.now();
  const series = (
    playerId: string,
    startsAt: Date,
    startLp: number,
    currentScore: number
  ): DuelSeriesPoint[] => {
    const startMs = startsAt.getTime();
    const pts: DuelSeriesPoint[] = [{ t: startMs, v: 0 }];
    for (const s of byPlayer.get(playerId) ?? []) {
      const t = s.recordedAt.getTime();
      if (t >= startMs) pts.push({ t, v: s.lpNet - startLp });
    }
    pts.push({ t: now, v: currentScore });
    return pts;
  };

  for (const { v, raw } of lp) {
    v.timeline = {
      a: series(raw.playerAId, raw.startsAt, raw.startLpNetA, v.scoreA),
      b: series(raw.playerBId, raw.startsAt, raw.startLpNetB, v.scoreB),
    };
  }
}

export async function listDuels(): Promise<{
  active: DuelView[];
  finished: DuelView[];
}> {
  await refreshDuelStatus();

  const duels = await prisma.duel.findMany({
    orderBy: [{ status: "asc" }, { endsAt: "desc" }],
    include: {
      playerA: { include: playerWithOwnerInclude },
      playerB: { include: playerWithOwnerInclude },
    },
  });

  const { toView } = await import("@/lib/players");
  const active: DuelView[] = [];
  const activeRaw: RawDuel[] = [];
  const finished: DuelView[] = [];

  for (const d of duels) {
    const view = toDuelView(d, toView(d.playerA), toView(d.playerB));
    if (d.status === "active") {
      active.push(view);
      activeRaw.push(d);
    } else {
      finished.push(view);
    }
  }

  await attachTimelines(active, activeRaw);

  return { active, finished: finished.slice(0, 10) };
}

export async function createDuel(input: {
  playerAId: string;
  playerBId: string;
  metric: DuelMetric;
  days: number;
}): Promise<DuelView> {
  if (input.playerAId === input.playerBId) {
    throw new Error("Choisis deux joueurs différents");
  }

  const days = Math.min(30, Math.max(1, input.days));
  const [a, b] = await Promise.all([
    getPlayerById(input.playerAId),
    getPlayerById(input.playerBId),
  ]);

  if (!a || !b) throw new Error("Joueur introuvable");

  const existing = await prisma.duel.findFirst({
    where: {
      status: "active",
      OR: [
        { playerAId: input.playerAId, playerBId: input.playerBId },
        { playerAId: input.playerBId, playerBId: input.playerAId },
      ],
    },
  });
  if (existing) {
    throw new Error("Un duel est déjà en cours entre ces deux joueurs");
  }

  const endsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const duel = await prisma.duel.create({
    data: {
      playerAId: input.playerAId,
      playerBId: input.playerBId,
      metric: input.metric,
      startLpNetA: a.lpNet ?? 0,
      startLpNetB: b.lpNet ?? 0,
      startWinsA: a.wins ?? 0,
      startWinsB: b.wins ?? 0,
      endsAt,
    },
    include: {
      playerA: { include: playerWithOwnerInclude },
      playerB: { include: playerWithOwnerInclude },
    },
  });

  const { toView } = await import("@/lib/players");
  return toDuelView(duel, toView(duel.playerA), toView(duel.playerB));
}

export async function getDuelPlayers(): Promise<PlayerView[]> {
  return listPlayers();
}
