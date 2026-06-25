import type { DuelSeriesPoint } from "@/lib/duels";

type Side = {
  points: DuelSeriesPoint[];
  color: string;
  name: string;
};

type Props = {
  a: Side;
  b: Side;
};

const W = 600;
const H = 120;
const PAD_X = 10;
const PAD_Y = 16;

export function DuelTimelineChart({ a, b }: Props) {
  if (a.points.length < 2 || b.points.length < 2) return null;

  const all = [...a.points, ...b.points];
  const ts = all.map((p) => p.t);
  const vs = all.map((p) => p.v);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const tSpan = Math.max(tMax - tMin, 1);
  const vMin = Math.min(0, ...vs);
  const vMax = Math.max(0, ...vs);
  const vSpan = Math.max(vMax - vMin, 1);

  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;
  const toX = (t: number) => PAD_X + ((t - tMin) / tSpan) * innerW;
  const toY = (v: number) => PAD_Y + innerH - ((v - vMin) / vSpan) * innerH;
  const zeroY = toY(0);

  const path = (pts: DuelSeriesPoint[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.t).toFixed(1)} ${toY(p.v).toFixed(1)}`)
      .join(" ");

  const lead = a.points[a.points.length - 1].v - b.points[b.points.length - 1].v;

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted">
          Évolution du duel
        </p>
        <p className="text-[10px] text-muted">
          {lead === 0 ? "À égalité" : `Écart ${Math.abs(lead)} LP`}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Évolution du duel entre ${a.name} et ${b.name}`}
      >
        <line
          x1={PAD_X}
          y1={zeroY}
          x2={W - PAD_X}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 4"
        />
        {[
          { s: b, key: "b" },
          { s: a, key: "a" },
        ].map(({ s, key }) => {
          const lastPt = s.points[s.points.length - 1];
          return (
            <g key={key}>
              <path
                d={path(s.points)}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle
                cx={toX(lastPt.t)}
                cy={toY(lastPt.v)}
                r={4}
                fill={s.color}
                stroke="#060a12"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
