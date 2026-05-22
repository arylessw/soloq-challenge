import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rawMatchesToViews } from "@/lib/matches";
import { fetchRecentRankedMatches } from "@/lib/riot-matches";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }

  if (!player.puuid) {
    return NextResponse.json({
      matches: [],
      warning:
        "Profil pas encore synchronisé — actualise le classement puis réessaie.",
    });
  }

  try {
    const sinceEpochSec = Math.floor(player.createdAt.getTime() / 1000);
    const raw = await fetchRecentRankedMatches(player.puuid, {
      count: 15,
      sinceEpochSec,
    });

    return NextResponse.json({
      matches: rawMatchesToViews(raw),
      riotId: `${player.gameName}#${player.tagLine}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    console.error("[GET /api/players/[id]/matches]", msg);
    return NextResponse.json({ error: msg, matches: [] }, { status: 400 });
  }
}
