import type { RawMatchForPlayer } from "@/lib/riot-matches";

const DDRAGON_VERSION = "15.1.1";

export type MatchView = {
  matchId: string;
  playedAt: string;
  playedAtLabel: string;
  durationLabel: string;
  win: boolean;
  championName: string;
  championIconUrl: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  cs: number;
};

function formatRelativeTime(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 3600) return `il y a ${Math.max(1, Math.floor(sec / 60))} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)} h`;
  return `il y a ${Math.floor(sec / 86400)} j`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return "Perfect";
  const ratio = ((kills + assists) / deaths).toFixed(2);
  return ratio;
}

export function rawMatchesToViews(raw: RawMatchForPlayer[]): MatchView[] {
  return raw.map((m) => {
    const playedAt = new Date(m.gameCreation);
    return {
      matchId: m.matchId,
      playedAt: playedAt.toISOString(),
      playedAtLabel: formatRelativeTime(playedAt),
      durationLabel: formatDuration(m.gameDuration),
      win: m.win,
      championName: m.championName,
      championIconUrl: `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${m.championName}.png`,
      kills: m.kills,
      deaths: m.deaths,
      assists: m.assists,
      kda: formatKda(m.kills, m.deaths, m.assists),
      cs: m.cs,
    };
  });
}
