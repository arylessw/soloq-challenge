import type { LpHistoryPoint } from "@/lib/lp-snapshots";

type Props = {
  points: LpHistoryPoint[];
};

function formatAxisDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function LpChart({ points }: Props) {
  if (points.length < 2) {
    return (
      <div className="card text-center py-10 text-muted text-sm">
        <p>Pas encore assez de données pour le graphique.</p>
        <p className="text-xs mt-2 opacity-80">
          Le graphique se remplit à chaque sync (toutes les 3 min).
        </p>
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

  const toX = (i: number) =>
    padX + (i / (points.length - 1)) * innerW;
  const toY = (lp: number) =>
    padY + innerH - ((lp - yMin) / (yMax - yMin)) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.lpNet)}`)
    .join(" ");

  const areaPath = `${linePath} L ${toX(points.length - 1)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`;

  const zeroY = toY(0);
  const last = points[points.length - 1];
  const positive = last.lpNet >= 0;

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
          <h3 className="font-display text-lg text-gold-light">
            Progression LP
          </h3>
          <p className="text-xs text-muted">Depuis le début du défi</p>
        </div>
        <p
          className={`font-display text-2xl tabular-nums ${
            positive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {last.lpNet > 0 ? `+${last.lpNet}` : last.lpNet} LP
        </p>
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
        <path d={areaPath} fill="url(#lpGradient)" opacity={0.35} />
        <path
          d={linePath}
          fill="none"
          stroke={positive ? "#34d399" : "#f87171"}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.recordedAt}
            cx={toX(i)}
            cy={toY(p.lpNet)}
            r={i === points.length - 1 ? 5 : 3}
            fill={positive ? "#34d399" : "#f87171"}
            stroke="#060a12"
            strokeWidth={1.5}
          />
        ))}
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
            <stop
              offset="0%"
              stopColor={positive ? "#34d399" : "#f87171"}
            />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
