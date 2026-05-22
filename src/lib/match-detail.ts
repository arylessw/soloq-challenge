import type { MatchDto, MatchParticipantDto } from "@/lib/riot-matches";

const DDRAGON_VERSION = "15.1.1";

export type ParticipantView = {
  puuid: string;
  riotId: string;
  championName: string;
  championIconUrl: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  damage: number;
  damageLabel: string;
  gold: number;
  goldLabel: string;
  cs: number;
  isViewer: boolean;
};

export type MatchDetailView = {
  matchId: string;
  playedAtLabel: string;
  durationLabel: string;
  win: boolean;
  queueLabel: string;
  allies: ParticipantView[];
  enemies: ParticipantView[];
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
  return ((kills + assists) / deaths).toFixed(2);
}

function formatStat(n: number): string {
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("fr-FR");
}

function championIcon(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${championName}.png`;
}

function toParticipantView(
  p: MatchParticipantDto,
  viewerPuuid: string
): ParticipantView {
  const damage = p.totalDamageDealtToChampions;
  const gold = p.goldEarned;
  return {
    puuid: p.puuid,
    riotId: `${p.riotIdGameName}#${p.riotIdTagline}`,
    championName: p.championName,
    championIconUrl: championIcon(p.championName),
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    kda: formatKda(p.kills, p.deaths, p.assists),
    damage,
    damageLabel: formatStat(damage),
    gold,
    goldLabel: formatStat(gold),
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    isViewer: p.puuid === viewerPuuid,
  };
}

function sortParticipants(a: ParticipantView, b: ParticipantView): number {
  if (a.isViewer) return -1;
  if (b.isViewer) return 1;
  return b.damage - a.damage;
}

export function matchToDetailView(
  match: MatchDto,
  viewerPuuid: string
): MatchDetailView | null {
  const viewer = match.info.participants.find((p) => p.puuid === viewerPuuid);
  if (!viewer) return null;

  const teamId = viewer.teamId;
  const allies = match.info.participants
    .filter((p) => p.teamId === teamId)
    .map((p) => toParticipantView(p, viewerPuuid))
    .sort(sortParticipants);

  const enemies = match.info.participants
    .filter((p) => p.teamId !== teamId)
    .map((p) => toParticipantView(p, viewerPuuid))
    .sort(sortParticipants);

  const playedAt = new Date(match.info.gameCreation);

  return {
    matchId: match.metadata.matchId,
    playedAtLabel: formatRelativeTime(playedAt),
    durationLabel: formatDuration(match.info.gameDuration),
    win: viewer.win,
    queueLabel: "Ranked Solo/Duo",
    allies,
    enemies,
  };
}
