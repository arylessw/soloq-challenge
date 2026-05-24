import { NextResponse } from "next/server";
import {
  createOrUpdatePlayer,
  PlayerLinkError,
} from "@/lib/create-player";
import { listPlayers } from "@/lib/players";
import { getSessionUserId } from "@/lib/session";
import {
  divisionRequired,
  isValidDivision,
  isValidTier,
} from "@/lib/ranks";

export async function GET() {
  try {
    const players = await listPlayers();
    return NextResponse.json(players);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Impossible de charger les joueurs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gameName = String(body.gameName ?? "").trim();
    const tagLine = String(body.tagLine ?? "").trim();
    const startTier = String(body.startTier ?? "").trim().toUpperCase();
    const startDivision = String(body.startDivision ?? "IV")
      .trim()
      .toUpperCase();
    const startLp = Math.max(0, Math.min(100, Number(body.startLp) || 0));

    if (!gameName || !tagLine) {
      return NextResponse.json(
        { error: "Pseudo et tag requis (ex: MonPseudo#EUW)" },
        { status: 400 }
      );
    }

    if (!isValidTier(startTier)) {
      return NextResponse.json({ error: "Rang de départ invalide" }, { status: 400 });
    }

    if (divisionRequired(startTier) && !isValidDivision(startDivision)) {
      return NextResponse.json({ error: "Division invalide" }, { status: 400 });
    }

    const division = divisionRequired(startTier) ? startDivision : "I";
    const linkUserId = await getSessionUserId();

    const result = await createOrUpdatePlayer(
      {
        gameName,
        tagLine,
        startTier,
        startDivision: division,
        startLp,
      },
      linkUserId ?? undefined
    );

    return NextResponse.json({
      id: result.id,
      message: linkUserId
        ? "Joueur inscrit et relié à ton compte"
        : "Joueur inscrit",
    });
  } catch (e) {
    if (e instanceof PlayerLinkError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
