const REGIONAL = "https://europe.api.riotgames.com";
const PLATFORM = "https://euw1.api.riotgames.com";

function getApiKey(): string {
  const key = process.env.RIOT_API_KEY?.replace(/\s/g, "").trim();
  if (!key || key.includes("xxxxxxxx")) {
    throw new Error(
      "Clé API Riot invalide ou manquante. Ajoute une vraie clé dans .env (developer.riotgames.com), puis redémarre npm run dev."
    );
  }
  return key;
}

function headers(): HeadersInit {
  return { "X-Riot-Token": getApiKey() };
}

export async function riotFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (res.status === 401) {
    throw new Error(
      "Clé API Riot refusée (expirée ou incorrecte). Regénère une clé sur developer.riotgames.com — les clés de dev expirent après 24 h."
    );
  }
  if (res.status === 403) {
    throw new Error(
      "Accès refusé par l'API Riot (403). Vérifie ta clé ou réessaie dans quelques minutes."
    );
  }
  if (res.status === 404) throw new Error("Joueur introuvable sur EUW");
  if (res.status === 429) throw new Error("Limite API Riot atteinte — réessaie dans une minute");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur Riot API (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

type AccountDto = { puuid: string; gameName: string; tagLine: string };

type LeagueEntryDto = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type SoloQueueStats = {
  tier: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
  puuid: string;
  summonerId: string;
};

export async function checkRiotApiKey(): Promise<boolean> {
  try {
    const res = await fetch(
      `${REGIONAL}/riot/account/v1/accounts/by-riot-id/Faker/KT`,
      { headers: headers(), cache: "no-store" }
    );
    return res.status !== 401 && res.status !== 403;
  } catch {
    return false;
  }
}

export async function fetchAccount(
  gameName: string,
  tagLine: string
): Promise<AccountDto> {
  const encodedName = encodeURIComponent(gameName.trim());
  const encodedTag = encodeURIComponent(tagLine.trim());

  try {
    return await riotFetch<AccountDto>(
      `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`
    );
  } catch (e) {
    if (e instanceof Error && e.message.includes("refusée")) throw e;
    throw new Error(
      `Compte "${gameName}#${tagLine}" introuvable — copie le Riot ID exact depuis le client LoL (ex. MonPseudo#abc).`
    );
  }
}

/** Riot ID actuel d'un compte (détecte les renommages) — le puuid est immuable. */
export async function fetchAccountByPuuid(puuid: string): Promise<AccountDto> {
  return riotFetch<AccountDto>(
    `${REGIONAL}/riot/account/v1/accounts/by-puuid/${encodeURIComponent(puuid)}`
  );
}

function soloFromEntries(entries: LeagueEntryDto[], puuid: string): SoloQueueStats {
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!solo) {
    throw new Error("UNRANKED");
  }

  const highElo = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(solo.tier);

  return {
    tier: solo.tier,
    division: highElo ? "I" : solo.rank,
    lp: solo.leaguePoints,
    wins: solo.wins,
    losses: solo.losses,
    puuid,
    summonerId: puuid,
  };
}

/**
 * Stats SoloQ par puuid stocké — la voie robuste pour la sync : ne dépend pas
 * du Riot ID (pseudo#tag), qui casse à chaque renommage du joueur.
 */
export async function fetchSoloQueueByPuuid(
  puuid: string
): Promise<SoloQueueStats> {
  const entries = await riotFetch<LeagueEntryDto[]>(
    `${PLATFORM}/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`
  );
  return soloFromEntries(entries, puuid);
}

export async function fetchSoloQueue(
  gameName: string,
  tagLine: string
): Promise<SoloQueueStats> {
  const account = await fetchAccount(gameName, tagLine);

  const entries = await riotFetch<LeagueEntryDto[]>(
    `${PLATFORM}/lol/league/v4/entries/by-puuid/${account.puuid}`
  );
  return soloFromEntries(entries, account.puuid);
}
