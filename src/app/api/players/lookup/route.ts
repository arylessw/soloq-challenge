import { NextResponse } from "next/server";
import { fetchSoloQueue } from "@/lib/riot";
import { divisionRequired } from "@/lib/ranks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get("gameName")?.trim() ?? "";
  const tagLine = searchParams.get("tagLine")?.trim() ?? "";

  if (!gameName || !tagLine) {
    return NextResponse.json(
      { error: "Pseudo et tag requis" },
      { status: 400 }
    );
  }

  try {
    const stats = await fetchSoloQueue(gameName, tagLine);
    return NextResponse.json({
      tier: stats.tier,
      division: stats.division,
      lp: stats.lp,
      wins: stats.wins,
      losses: stats.losses,
      needsDivision: divisionRequired(stats.tier),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur Riot API";
    if (msg === "UNRANKED") {
      return NextResponse.json(
        { error: "Joueur non classé en SoloQ — choisis ton rang manuellement" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
