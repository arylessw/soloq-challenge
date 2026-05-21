import { NextResponse } from "next/server";
import {
  TEAM_LABELS,
  TEAMS,
  canJoinTeam,
  getTeamCounts,
  getTeamStartPowers,
  teamBlockReason,
} from "@/lib/teams";
import { divisionRequired, isValidDivision, isValidTier, rankToScore } from "@/lib/ranks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startTier = String(searchParams.get("startTier") ?? "").toUpperCase();
  const startDivision = String(searchParams.get("startDivision") ?? "IV").toUpperCase();
  const startLp = Math.max(0, Math.min(100, Number(searchParams.get("startLp")) || 0));

  let newStartScore = 0;
  if (isValidTier(startTier)) {
    const div = divisionRequired(startTier)
      ? isValidDivision(startDivision)
        ? startDivision
        : "IV"
      : "I";
    newStartScore = rankToScore(startTier, div, startLp);
  }

  const counts = await getTeamCounts();
  const powers = await getTeamStartPowers();

  const teams = TEAMS.map((id) => ({
    id,
    label: TEAM_LABELS[id],
    count: counts[id],
    startPower: powers[id],
    canJoin: canJoinTeam(id, counts, powers, newStartScore),
    blockReason: teamBlockReason(id, counts, powers, newStartScore),
  }));

  return NextResponse.json({ counts, powers, newStartScore, teams });
}
