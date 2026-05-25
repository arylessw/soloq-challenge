/** Panneaux latéraux uniquement — pas de popup ni d’interstitiel. */

export type AdRailPosition = "left" | "right";

export function adsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
}

export function getAdSenseClient(): string | null {
  const id = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (!id || id.includes("xxxx")) return null;
  return id;
}

export function getAdSenseSlot(position: AdRailPosition): string | null {
  const key =
    position === "left"
      ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT
      : process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT;
  const slot = key?.trim();
  if (!slot || slot.includes("xxxx")) return null;
  return slot;
}

export function hasAdSense(): boolean {
  return adsEnabled() && !!getAdSenseClient();
}
