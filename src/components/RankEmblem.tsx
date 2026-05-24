import Image from "next/image";
import { getTierStyle } from "@/lib/tier-styles";

const EMBLEM_SLUG: Record<string, string> = {
  IRON: "iron",
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  EMERALD: "emerald",
  DIAMOND: "diamond",
  MASTER: "master",
  GRANDMASTER: "grandmaster",
  CHALLENGER: "challenger",
};

function emblemUrl(tier: string): string {
  const slug = EMBLEM_SLUG[tier.toUpperCase()] ?? "silver";
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-${slug}.png`;
}

type Props = {
  tier: string;
  size?: number;
  className?: string;
};

export function RankEmblem({ tier, size = 28, className = "" }: Props) {
  return (
    <Image
      src={emblemUrl(tier)}
      alt=""
      width={size}
      height={size}
      className={`inline-block shrink-0 ${className}`}
      unoptimized
    />
  );
}

export function RankWithEmblem({
  tier,
  label,
  size = 28,
}: {
  tier: string;
  label: string;
  size?: number;
}) {
  const style = getTierStyle(tier);
  return (
    <span className="inline-flex items-center gap-2">
      <RankEmblem tier={tier} size={size} />
      <span className={style.text}>{label}</span>
    </span>
  );
}
