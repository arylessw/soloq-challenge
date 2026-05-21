import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listPlayers } from "@/lib/players";
import { fetchAccount, fetchSoloQueue } from "@/lib/riot";
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

    let stats: {
      tier: string;
      division: string;
      lp: number;
      wins: number;
      losses: number;
      puuid: string;
      summonerId: string;
    };

    try {
      stats = await fetchSoloQueue(gameName, tagLine);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur Riot API";

      if (msg === "UNRANKED") {
        try {
          const account = await fetchAccount(gameName, tagLine);
          stats = {
            tier: startTier,
            division,
            lp: startLp,
            wins: 0,
            losses: 0,
            puuid: account.puuid,
            summonerId: account.puuid,
          };
        } catch (inner) {
          const innerMsg =
            inner instanceof Error ? inner.message : "Erreur Riot API";
          console.error("[POST /api/players]", innerMsg);
          return NextResponse.json({ error: innerMsg }, { status: 400 });
        }
      } else {
        console.error("[POST /api/players]", msg);
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    const player = await prisma.player.upsert({
      where: {
        gameName_tagLine: { gameName, tagLine },
      },
      create: {
        gameName,
        tagLine,
        puuid: stats.puuid,
        summonerId: stats.summonerId,
        startTier,
        startDivision: division,
        startLp,
        currentTier: stats.tier,
        currentDivision: stats.division,
        currentLp: stats.lp,
        wins: stats.wins,
        losses: stats.losses,
        lastSyncedAt: new Date(),
      },
      update: {
        puuid: stats.puuid,
        summonerId: stats.summonerId,
        startTier,
        startDivision: division,
        startLp,
        currentTier: stats.tier,
        currentDivision: stats.division,
        currentLp: stats.lp,
        wins: stats.wins,
        losses: stats.losses,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({ id: player.id, message: "Joueur inscrit" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
