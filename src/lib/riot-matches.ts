import { riotFetch } from "@/lib/riot";

const REGIONAL = "https://europe.api.riotgames.com";
const RANKED_SOLO_QUEUE = 420;
const MATCH_FETCH_DELAY_MS = 250;
const DEFAULT_MATCH_COUNT = 15;

type MatchDto = {
  metadata: { matchId: string };
  info: {
    gameCreation: number;
    gameDuration: number;
    queueId: number;
    participants: MatchParticipantDto[];
  };
};

type MatchParticipantDto = {
  puuid: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
};

export type RawMatchForPlayer = {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  win: boolean;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
};

export async function fetchRankedSoloMatchIds(
  puuid: string,
  opts?: { count?: number; startTime?: number }
): Promise<string[]> {
  const count = Math.min(opts?.count ?? DEFAULT_MATCH_COUNT, 20);
  const params = new URLSearchParams({
    start: "0",
    count: String(count),
    queue: String(RANKED_SOLO_QUEUE),
  });
  if (opts?.startTime) {
    params.set("startTime", String(opts.startTime));
  }

  const ids = await riotFetch<string[]>(
    `${REGIONAL}/lol/match/v5/matches/by-puuid/${puuid}/ids?${params}`
  );
  return ids ?? [];
}

export async function fetchMatch(matchId: string): Promise<MatchDto> {
  return riotFetch<MatchDto>(
    `${REGIONAL}/lol/match/v5/matches/${matchId}`
  );
}

function participantForPuuid(
  match: MatchDto,
  puuid: string
): MatchParticipantDto | undefined {
  return match.info.participants.find((p) => p.puuid === puuid);
}

export async function fetchRecentRankedMatches(
  puuid: string,
  opts?: { count?: number; sinceEpochSec?: number }
): Promise<RawMatchForPlayer[]> {
  const ids = await fetchRankedSoloMatchIds(puuid, {
    count: opts?.count ?? DEFAULT_MATCH_COUNT,
    startTime: opts?.sinceEpochSec,
  });

  const matches: RawMatchForPlayer[] = [];

  for (const matchId of ids) {
    if (matches.length > 0) {
      await new Promise((r) => setTimeout(r, MATCH_FETCH_DELAY_MS));
    }

    try {
      const match = await fetchMatch(matchId);
      const participant = participantForPuuid(match, puuid);
      if (!participant) continue;

      matches.push({
        matchId: match.metadata.matchId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        queueId: match.info.queueId,
        win: participant.win,
        championId: participant.championId,
        championName: participant.championName,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs:
          participant.totalMinionsKilled + participant.neutralMinionsKilled,
      });
    } catch {
      continue;
    }
  }

  return matches;
}
