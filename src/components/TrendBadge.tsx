type Props = {
  delta?: number;
};

/** Petit indicateur de mouvement de classement entre deux syncs. */
export function TrendBadge({ delta }: Props) {
  if (delta == null || delta === 0) return null;

  const up = delta > 0;
  const abs = Math.abs(delta);
  const label = up
    ? `+${abs} place${abs > 1 ? "s" : ""} depuis la dernière sync`
    : `${abs} place${abs > 1 ? "s" : ""} perdue${abs > 1 ? "s" : ""}`;

  return (
    <span className={`trend-badge ${up ? "trend-up" : "trend-down"}`} title={label}>
      <span aria-hidden>
        {up ? "▲" : "▼"}
        {abs}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
