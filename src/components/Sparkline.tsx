type Props = {
  values: number[];
  color: string;
  width?: number;
  height?: number;
};

/** Mini-courbe sans axe — tendance d'une série de valeurs. */
export function Sparkline({ values, color, width = 132, height = 36 }: Props) {
  if (values.length === 0) {
    return <div style={{ width, height }} aria-hidden />;
  }

  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = Math.max(max - min, 1);

  const toX = (i: number) =>
    values.length <= 1 ? pad + innerW / 2 : pad + (i / (values.length - 1)) * innerW;
  const toY = (v: number) => pad + innerH - ((v - min) / span) * innerH;

  const last = values[values.length - 1];

  if (values.length === 1) {
    return (
      <svg width={width} height={height} aria-hidden>
        <circle cx={toX(0)} cy={toY(last)} r={3} fill={color} />
      </svg>
    );
  }

  const line = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${toX(values.length - 1).toFixed(1)} ${toY(min).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(min).toFixed(1)} Z`;
  const zeroY = toY(0);

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      {min < 0 && max > 0 && (
        <line
          x1={pad}
          y1={zeroY}
          x2={width - pad}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="3 3"
        />
      )}
      <path d={area} fill={color} fillOpacity={0.14} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={toX(values.length - 1)} cy={toY(last)} r={2.6} fill={color} />
    </svg>
  );
}
