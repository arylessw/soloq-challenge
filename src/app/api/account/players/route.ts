import { NextResponse } from "next/server";
import {
  createOrUpdatePlayer,
  PlayerLinkError,
} from "@/lib/create-player";
import { getSessionUserId } from "@/lib/session";
import {
  divisionRequired,
  isValidDivision,
  isValidTier,
} from "@/lib/ranks";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Connecte-toi d'abord" }, { status: 401 });
  }

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
        { error: "Pseudo et tag requis" },
        { status: 400 }
      );
    }
    if (!isValidTier(startTier)) {
      return NextResponse.json({ error: "Rang invalide" }, { status: 400 });
    }
    if (divisionRequired(startTier) && !isValidDivision(startDivision)) {
      return NextResponse.json({ error: "Division invalide" }, { status: 400 });
    }

    const division = divisionRequired(startTier) ? startDivision : "I";
    const result = await createOrUpdatePlayer(
      {
        gameName,
        tagLine,
        startTier,
        startDivision: division,
        startLp,
      },
      userId
    );

    return NextResponse.json({
      id: result.id,
      message: "Compte LoL relié au profil",
    });
  } catch (e) {
    if (e instanceof PlayerLinkError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    const msg = e instanceof Error ? e.message : "Erreur";
    console.error("[POST /api/account/players]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
