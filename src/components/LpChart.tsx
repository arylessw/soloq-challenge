import type { ReactNode } from "react";
import type { LpHistoryPoint } from "@/lib/lp-snapshots";

type Accent = { main: string; light: string };

type Props = {
  points: LpHistoryPoint[];
  accent?: Accent;
  subtitle?: string;
  toolbar?: ReactNode;
};

const DEFAULT_ACCENT: Accent = { main: "#d4af37", light: "#f0e6b8" };

function formatAxisDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function LpChart({
  points,
  accent = DEFAULT_ACCENT,
  subtitle = "Depuis le début du défi",
  toolbar,
}: Props) {
  if (points.length < 2) {
    const started = points.length === 1;
    return (
      <div className="card relative overflow-hidden text-center py-10">
        <div
          className="pointer-events-none absolute left-1/2 top-2 h-24 w-48 -translate-x-1/2 rounded-full opacity-50 blur-2xl"
          style={{ background: `radial-gradient(circle, ${accent.main}55, transparent 70%)` }}
          aria-hidden
        />
        <div className="relative">
          <span className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center">
            <span
              className="absolute inset-0 rounded-full opacity-60 lp-empty-pulse"
              style={{ background: accent.main }}
              aria-hidden
            />
            <span
              className="relative h-4 w-4 rounded-full"
              style={{ background: accent.light, boxShadow: `0 0 16px ${accent.main}` }}
            />
          </span>
          <h3 className="font-display text-lg" style={{ color: accent.light }}>
            Progression LP
          </h3>
          <p className="mt-2 text-sm text-muted">
            {started
              ? "Premier point enregistré — la courbe se trace dès la prochaine sync."
              : "La courbe se remplit automatiquement à chaque sync (toutes les 3 min)."}
          </p>
        </div>
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padX = 44;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const lpValues = points.map((p) => p.lpNet);
  const minLp = Math.min(0, ...lpValues);
  const maxLp = Math.max(0, ...lpValues);
  const range = Math.max(maxLp - minLp, 20);
  const yMin = minLp - range * 0.1;
  const yMax = maxLp + range * 0.1;

  const toX = (i: number) => padX + (i / (points.length - 1)) * innerW;
  const toY = (lp: number) =>
    padY + innerH - ((lp - yMin) / (yMax - yMin)) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.lpNet)}`)
    .join(" ");

  const areaPath = `${linePath} L ${toX(points.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  const zeroY = toY(0);
  const last = points[points.length - 1];
  const positive = last.lpNet >= 0;
  const peak = Math.max(...lpValues);
  const peakIdx = lpValues.indexOf(peak);

  const xLabels = [
    { i: 0, label: formatAxisDate(points[0].recordedAt) },
    {
      i: points.length - 1,
      label: formatAxisDate(points[points.length - 1].recordedAt),
    },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <div>
          <h3 className="font-display text-lg" style={{ color: accent.light }}>
            Progression LP
          </h3>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {toolbar}
          <div className="text-right">
            <p
              className={`text-metric text-2xl ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {last.lpNet > 0 ? `+${last.lpNet}` : last.lpNet} LP
            </p>
            {peak > 0 && peak !== last.lpNet && (
              <p className="text-[11px] text-muted tabular-nums">
                Pic +{peak} LP
              </p>
            )}
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        role="img"
        aria-label="Graphique de progression LP"
      >
        <line
          x1={padX}
          y1={zeroY}
          x2={width - padX}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
        <path d={areaPath} fill="url(#lpGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke={accent.main}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#lpGlow)"
        />
        {peakIdx >= 0 && peak > 0 && peakIdx !== points.length - 1 && (
          <circle
            cx={toX(peakIdx)}
            cy={toY(peak)}
            r={3.5}
            fill={accent.light}
            stroke="#060a12"
            strokeWidth={1.5}
          />
        )}
        <circle
          cx={toX(points.length - 1)}
          cy={toY(last.lpNet)}
          r={9}
          fill={accent.main}
          opacity={0.25}
        >
          <animate
            attributeName="r"
            values="6;11;6"
            dur="2.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.35;0;0.35"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx={toX(points.length - 1)}
          cy={toY(last.lpNet)}
          r={5}
          fill={accent.light}
          stroke="#060a12"
          strokeWidth={1.5}
        />
        {xLabels.map(({ i, label }) => (
          <text
            key={label}
            x={toX(i)}
            y={height - 6}
            textAnchor={i === 0 ? "start" : "end"}
            fill="#8b9cb8"
            fontSize={11}
          >
            {label}
          </text>
        ))}
        <defs>
          <linearGradient id="lpGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent.main} stopOpacity={0.32} />
            <stop offset="100%" stopColor={accent.main} stopOpacity={0} />
          </linearGradient>
          <filter id="lpGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
