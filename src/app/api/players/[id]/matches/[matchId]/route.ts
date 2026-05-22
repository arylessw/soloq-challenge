import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { matchToDetailView } from "@/lib/match-detail";
import { fetchMatch } from "@/lib/riot-matches";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; matchId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id, matchId } = await params;

  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }

  if (!player.puuid) {
    return NextResponse.json(
      { error: "Joueur pas encore synchronisé" },
      { status: 400 }
    );
  }

  try {
    const match = await fetchMatch(matchId);
    const detail = matchToDetailView(match, player.puuid);

    if (!detail) {
      return NextResponse.json(
        { error: "Joueur absent de cette partie" },
        { status: 404 }
      );
    }

    return NextResponse.json(detail);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    console.error("[GET /api/players/[id]/matches/[matchId]]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
