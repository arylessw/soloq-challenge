import { prisma } from "@/lib/db";
import { computeLpProgress } from "@/lib/ranks";

const MIN_SNAPSHOT_INTERVAL_MS = 60 * 60 * 1000;

export type LpHistoryPoint = {
  recordedAt: string;
  lpNet: number;
  label: string | null;
};

export async function recordLpSnapshot(
  playerId: string,
  data: {
    startTier: string;
    startDivision: string;
    startLp: number;
    currentTier: string | null;
    currentDivision: string | null;
    currentLp: number | null;
  }
): Promise<void> {
  if (
    !data.currentTier ||
    data.currentDivision == null ||
    data.currentLp == null
  ) {
    return;
  }

  const { lpNet } = computeLpProgress(
    {
      tier: data.startTier,
      division: data.startDivision,
      lp: data.startLp,
    },
    {
      tier: data.currentTier,
      division: data.currentDivision,
      lp: data.currentLp,
    }
  );

  const last = await prisma.lpSnapshot.findFirst({
    where: { playerId },
    orderBy: { recordedAt: "desc" },
  });

  if (
    last &&
    last.lpNet === lpNet &&
    Date.now() - last.recordedAt.getTime() < MIN_SNAPSHOT_INTERVAL_MS
  ) {
    return;
  }

  await prisma.lpSnapshot.create({
    data: {
      playerId,
      lpNet,
      tier: data.currentTier,
      division: data.currentDivision,
      lp: data.currentLp,
    },
  });
}

export async function seedInitialLpSnapshot(
  playerId: string,
  createdAt: Date
): Promise<void> {
  const existing = await prisma.lpSnapshot.count({ where: { playerId } });
  if (existing > 0) return;

  await prisma.lpSnapshot.create({
    data: {
      playerId,
      lpNet: 0,
      recordedAt: createdAt,
    },
  });
}

export async function getLpHistory(playerId: string): Promise<LpHistoryPoint[]> {
  const snapshots = await prisma.lpSnapshot.findMany({
    where: { playerId },
    orderBy: { recordedAt: "asc" },
    take: 90,
  });

  return snapshots.map((s) => ({
    recordedAt: s.recordedAt.toISOString(),
    lpNet: s.lpNet,
    label:
      s.tier && s.division != null && s.lp != null
        ? `${s.tier} ${s.division}`
        : null,
  }));
}

export type WeekPoint = { t: string; v: number };
export type WeeklyProgress = { delta: number; points: WeekPoint[] };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Progression LP de chaque joueur sur les 7 derniers jours (fenêtre glissante).
 * Une seule requête : tous les snapshots de la fenêtre, groupés par joueur.
 * delta = lpNet du dernier point − lpNet du premier point de la fenêtre.
 */
export async function getWeeklyProgress(): Promise<Map<string, WeeklyProgress>> {
  const weekStart = new Date(Date.now() - WEEK_MS);

  // Points dans la fenêtre + baseline = dernier snapshot AVANT la fenêtre
  // (sinon le premier mouvement de la semaine serait absorbé dans la base).
  const [inWindow, baselines] = await Promise.all([
    prisma.lpSnapshot.findMany({
      where: { recordedAt: { gte: weekStart } },
      orderBy: { recordedAt: "asc" },
      select: { playerId: true, lpNet: true, recordedAt: true },
    }),
    prisma.lpSnapshot.findMany({
      where: { recordedAt: { lt: weekStart } },
      orderBy: { recordedAt: "desc" },
      distinct: ["playerId"],
      select: { playerId: true, lpNet: true },
    }),
  ]);

  const baseMap = new Map(baselines.map((b) => [b.playerId, b.lpNet]));

  const grouped = new Map<string, { lpNet: number; recordedAt: Date }[]>();
  for (const s of inWindow) {
    const arr = grouped.get(s.playerId) ?? [];
    arr.push(s);
    grouped.set(s.playerId, arr);
  }

  const result = new Map<string, WeeklyProgress>();
  for (const [playerId, arr] of grouped) {
    const base = baseMap.get(playerId) ?? arr[0].lpNet;
    const last = arr[arr.length - 1].lpNet;
    const points: WeekPoint[] = [
      { t: weekStart.toISOString(), v: 0 },
      ...arr.map((s) => ({ t: s.recordedAt.toISOString(), v: s.lpNet - base })),
    ];
    result.set(playerId, { delta: last - base, points });
  }

  return result;
}

export async function getLpDeltaSince(
  playerId: string,
  since: Date
): Promise<number | null> {
  const [baseline, latest] = await Promise.all([
    prisma.lpSnapshot.findFirst({
      where: { playerId, recordedAt: { lte: since } },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.lpSnapshot.findFirst({
      where: { playerId },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  if (!latest) return null;

  const baseLpNet = baseline?.lpNet ?? 0;
  return latest.lpNet - baseLpNet;
}
