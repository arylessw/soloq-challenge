"use client";

import { useMemo, useState } from "react";
import { LpChart } from "@/components/LpChart";
import type { LpHistoryPoint } from "@/lib/lp-snapshots";

type Accent = { main: string; light: string };

type RangeId = "7" | "30" | "all";

const RANGES: { id: RangeId; label: string; days: number | null }[] = [
  { id: "7", label: "7 j", days: 7 },
  { id: "30", label: "30 j", days: 30 },
  { id: "all", label: "Saison", days: null },
];

function windowPoints(
  points: LpHistoryPoint[],
  days: number
): LpHistoryPoint[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const inWindow = points.filter(
    (p) => new Date(p.recordedAt).getTime() >= cutoff
  );
  if (inWindow.length < 2) return inWindow;
  // Re-base : la courbe montre la progression DANS la fenêtre, pas le cumul.
  const base = inWindow[0].lpNet;
  return inWindow.map((p) => ({ ...p, lpNet: p.lpNet - base }));
}

export function LpChartRange({
  points,
  accent,
}: {
  points: LpHistoryPoint[];
  accent: Accent;
}) {
  const [range, setRange] = useState<RangeId>("all");

  const windows = useMemo(
    () => ({
      "7": windowPoints(points, 7),
      "30": windowPoints(points, 30),
      all: points,
    }),
    [points]
  );

  const shown = windows[range];
  const subtitle =
    range === "all"
      ? "Depuis le début du défi"
      : `Fenêtre glissante · ${range} jours`;

  const toolbar =
    points.length >= 2 ? (
      <div className="inline-flex rounded-lg border border-white/8 bg-black/20 p-0.5">
        {RANGES.map((r) => {
          const disabled = windows[r.id].length < 2;
          return (
            <button
              key={r.id}
              type="button"
              disabled={disabled}
              onClick={() => setRange(r.id)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                range === r.id
                  ? "bg-gold/15 text-gold-light"
                  : disabled
                    ? "text-muted/30 cursor-not-allowed"
                    : "text-muted hover:text-white"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <LpChart
      points={shown}
      accent={accent}
      subtitle={subtitle}
      toolbar={toolbar}
    />
  );
}
