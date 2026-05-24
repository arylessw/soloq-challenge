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
