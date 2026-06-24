import type { Accent, CompareMetric } from "@/lib/compare";

type Props = {
  metrics: CompareMetric[];
  accentA: Accent;
  accentB: Accent;
};

export function CompareMetricsGrid({ metrics, accentA, accentB }: Props) {
  return (
    <div className="card-glow relative z-[1] mb-8 board-stagger-2">
      <h3 className="relative z-[1] font-display text-lg text-gold-light mb-4">
        Face-à-face détaillé
      </h3>
      <ul className="relative z-[1] space-y-3">
        {metrics.map((m) => (
          <Row key={m.key} metric={m} accentA={accentA} accentB={accentB} />
        ))}
      </ul>
    </div>
  );
}

function Row({
  metric: m,
  accentA,
  accentB,
}: {
  metric: CompareMetric;
  accentA: Accent;
  accentB: Accent;
}) {
  const aWin = m.winner === "a";
  const bWin = m.winner === "b";

  return (
    <li className="rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5 sm:px-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-end gap-1.5 text-right">
          {aWin && <span className="text-emerald-400 text-xs" aria-hidden>▲</span>}
          <span
            className={`text-sm font-semibold tabular-nums truncate ${
              aWin ? "" : "text-white/70"
            }`}
            style={aWin ? { color: accentA.light } : undefined}
          >
            {m.aDisplay}
          </span>
        </div>
        <span className="px-1 sm:px-2 text-center text-[10px] uppercase tracking-wider text-muted leading-tight">
          {m.label}
        </span>
        <div className="flex items-center gap-1.5 text-left">
          <span
            className={`text-sm font-semibold tabular-nums truncate ${
              bWin ? "" : "text-white/70"
            }`}
            style={bWin ? { color: accentB.light } : undefined}
          >
            {m.bDisplay}
          </span>
          {bWin && <span className="text-emerald-400 text-xs" aria-hidden>▲</span>}
        </div>
      </div>

      {(m.aPct > 0 || m.bPct > 0) && (
        <div className="mt-2 flex items-center gap-1">
          <div className="flex flex-1 justify-end">
            <div
              className="h-1.5 rounded-l-full transition-all"
              style={{
                width: `${m.aPct}%`,
                background: accentA.main,
                opacity: aWin ? 1 : 0.4,
              }}
            />
          </div>
          <span className="h-2.5 w-px bg-white/15" aria-hidden />
          <div className="flex flex-1 justify-start">
            <div
              className="h-1.5 rounded-r-full transition-all"
              style={{
                width: `${m.bPct}%`,
                background: accentB.main,
                opacity: bWin ? 1 : 0.4,
              }}
            />
          </div>
        </div>
      )}
    </li>
  );
}
