import { NextResponse } from "next/server";
import {
  TEAM_LABELS,
  TEAMS,
  canJoinTeam,
  getTeamCounts,
  teamBlockReason,
} from "@/lib/teams";

export async function GET() {
  const counts = await getTeamCounts();

  const teams = TEAMS.map((id) => ({
    id,
    label: TEAM_LABELS[id],
    count: counts[id],
    canJoin: canJoinTeam(id, counts),
    blockReason: teamBlockReason(id, counts),
  }));

  return NextResponse.json({ counts, teams });
}
