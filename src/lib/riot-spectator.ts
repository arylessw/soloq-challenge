import { riotFetch } from "@/lib/riot";

const PLATFORM = "https://euw1.api.riotgames.com";

type ActiveGameDto = {
  gameId: number;
  gameQueueConfigId: number;
};

/** true si une partie est en cours (ranked, normal, etc.) */
export async function fetchInGame(puuid: string): Promise<boolean> {
  try {
    await riotFetch<ActiveGameDto>(
      `${PLATFORM}/lol/spectator/v5/active-games/by-summoner/puuid/${puuid}`
    );
    return true;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("introuvable") || e.message.includes("404")) {
        return false;
      }
      if (e.message.includes("Limite API")) throw e;
    }
    return false;
  }
}
