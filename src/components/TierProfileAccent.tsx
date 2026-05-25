import { tierAccentKey } from "@/lib/tier-accent";

type Props = {
  tier: string | null | undefined;
  children: React.ReactNode;
};

export function TierProfileAccent({ tier, children }: Props) {
  const key = tierAccentKey(tier);
  return (
    <div className="profile-tier-accent" data-tier-accent={key}>
      {children}
    </div>
  );
}
