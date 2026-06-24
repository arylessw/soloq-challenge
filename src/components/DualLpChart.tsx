import type { LpHistoryPoint } from "@/lib/lp-snapshots";
import type { Accent } from "@/lib/compare";

type Series = {
  points: LpHistoryPoint[];
  accent: Accent;
  name: string;
};

type Props = {
  a: Series;
  b: Series;
};

const W = 640;
const H = 240;
const PAD_X = 44;
const PAD_Y = 30;
const INNER_W = W - PAD_X * 2;
const INNER_H = H - PAD_Y * 2;

export function DualLpChart({ a, b }: Props) {
  const allLp = [...a.points, ...b.points].map((p) => p.lpNet);

  if (a.points.length < 2 && b.points.length < 2) {
    return (
      <div className="card text-center py-12 text-sm text-muted">
        <p className="font-display text-base text-gold-light mb-1">
          Progression LP superposée
        </p>
        <p>
          Pas encore assez de points pour les deux joueurs. Les courbes se
          tracent à chaque sync.
        </p>
      </div>
    );
  }

  const minLp = Math.min(0, ...allLp);
  const maxLp = Math.max(0, ...allLp);
  const range = Math.max(maxLp - minLp, 20);
  const yMin = minLp - range * 0.12;
  const yMax = maxLp + range * 0.12;

  const toY = (lp: number) =>
    PAD_Y + INNER_H - ((lp - yMin) / (yMax - yMin)) * INNER_H;
  const toX = (i: number, n: number) =>
    n <= 1 ? PAD_X + INNER_W / 2 : PAD_X + (i / (n - 1)) * INNER_W;

  const zeroY = toY(0);

  return (
    <div className="card overflow-hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-gold-light">
            Progression LP superposée
          </h3>
          <p className="text-xs text-muted">Depuis le début du défi</p>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <Legend series={a} />
          <Legend series={b} />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Comparaison de progression LP entre ${a.name} et ${b.name}`}
      >
        <line
          x1={PAD_X}
          y1={zeroY}
          x2={W - PAD_X}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
        <SeriesPath series={b} idSuffix="b" toX={toX} toY={toY} />
        <SeriesPath series={a} idSuffix="a" toX={toX} toY={toY} />
      </svg>
    </div>
  );
}

function Legend({ series }: { series: Series }) {
  const last = series.points[series.points.length - 1];
  const lp = last?.lpNet ?? 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: series.accent.main }}
      />
      <span className="text-muted max-w-[140px] truncate">{series.name}</span>
      <span
        className="tabular-nums font-medium"
        style={{ color: series.accent.light }}
      >
        {lp > 0 ? `+${lp}` : lp} LP
      </span>
    </span>
  );
}

function SeriesPath({
  series,
  idSuffix,
  toX,
  toY,
}: {
  series: Series;
  idSuffix: string;
  toX: (i: number, n: number) => number;
  toY: (lp: number) => number;
}) {
  const n = series.points.length;
  if (n === 0) return null;

  const gradId = `dualLpGrad-${idSuffix}`;
  const glowId = `dualLpGlow-${idSuffix}`;
  const last = series.points[n - 1];

  if (n < 2) {
    return (
      <circle
        cx={toX(0, n)}
        cy={toY(last.lpNet)}
        r={5}
        fill={series.accent.light}
        stroke="#060a12"
        strokeWidth={1.5}
      />
    );
  }

  const linePath = series.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i, n)} ${toY(p.lpNet)}`)
    .join(" ");
  const areaPath = `${linePath} L ${toX(n - 1, n)} ${toY(0)} L ${toX(0, n)} ${toY(0)} Z`;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={series.accent.main} stopOpacity={0.22} />
          <stop offset="100%" stopColor={series.accent.main} stopOpacity={0} />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={series.accent.main}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />
      <circle
        cx={toX(n - 1, n)}
        cy={toY(last.lpNet)}
        r={8}
        fill={series.accent.main}
        opacity={0.25}
      >
        <animate
          attributeName="r"
          values="5;10;5"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.32;0;0.32"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={toX(n - 1, n)}
        cy={toY(last.lpNet)}
        r={4.5}
        fill={series.accent.light}
        stroke="#060a12"
        strokeWidth={1.5}
      />
    </g>
  );
}
