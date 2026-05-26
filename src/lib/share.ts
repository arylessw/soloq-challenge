import type { PlayerView } from "@/lib/players";
import { playerProfileUrl, playerShareImageUrl } from "@/lib/site-url";

export function buildProfileShareText(
  player: PlayerView,
  siteUrl?: string
): string {
  const profileUrl = playerProfileUrl(player.id, siteUrl);
  const lines = [
    `🏆 ${player.gameName}#${player.tagLine} — SoloQ Challenge EUW`,
    player.currentRank ? `Rang : ${player.currentRank}` : null,
    player.progressLabel ? `Progression : ${player.progressLabel}` : null,
    player.mainChampion && player.mainChampion.games >= 5
      ? `Main : ${player.mainChampion.championName} (${player.mainChampion.winrate}% WR)`
      : null,
    player.mainRole && player.mainRole.games >= 5
      ? `Rôle : ${player.mainRole.label} (${player.mainRole.winrate}% WR)`
      : null,
    player.wins != null && player.losses != null
      ? `Saison : ${player.wins}V / ${player.losses}D${player.winrate != null ? ` · ${player.winrate}% WR` : ""}`
      : null,
    player.avgKda != null ? `KDA : ${player.avgKda.toFixed(2)}` : null,
    player.streakLabel && player.streakType
      ? `Série : ${player.streakType === "WIN" ? "🔥" : "💀"} ${player.streakLabel}`
      : null,
    profileUrl,
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildProfileShareTitle(player: PlayerView): string {
  return `${player.gameName}#${player.tagLine} — SoloQ Challenge`;
}

export { playerShareImageUrl };
