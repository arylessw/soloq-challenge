import type { PlayerView } from "@/lib/players";

export function playerListName(p: PlayerView): string {
  return p.owner?.displayName ?? p.gameName;
}

export function playerListSubtitle(p: PlayerView): string {
  if (p.owner) {
    return `${p.gameName}#${p.tagLine}`;
  }
  return `#${p.tagLine}`;
}
