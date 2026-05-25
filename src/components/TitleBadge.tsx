import type { PlayerTitle } from "@/lib/player-titles";

const toneClass: Record<PlayerTitle["tone"], string> = {
  gold: "title-badge-gold",
  emerald: "title-badge-emerald",
  sky: "title-badge-sky",
  red: "title-badge-red",
  violet: "title-badge-violet",
};

export function TitleBadge({ title }: { title: PlayerTitle }) {
  return (
    <span className="title-badge-wrap">
      <span className={`title-badge ${toneClass[title.tone]}`}>
        <span aria-hidden>{title.emoji}</span>
        {title.label}
      </span>
      <span className="title-tooltip" role="tooltip">
        {title.description}
      </span>
    </span>
  );
}

export function TitleBadgeList({
  titles,
  max = 2,
}: {
  titles: PlayerTitle[];
  max?: number;
}) {
  if (titles.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {titles.slice(0, max).map((t) => (
        <TitleBadge key={t.id} title={t} />
      ))}
    </span>
  );
}
