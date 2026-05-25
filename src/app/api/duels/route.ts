import { NextResponse } from "next/server";
import { createDuel, listDuels } from "@/lib/duels";

export async function GET() {
  try {
    const data = await listDuels();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Impossible de charger les duels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playerAId = String(body.playerAId ?? "");
    const playerBId = String(body.playerBId ?? "");
    const metric = body.metric === "wins" ? "wins" : "lp";
    const days = Number(body.days) || 7;

    if (!playerAId || !playerBId) {
      return NextResponse.json(
        { error: "Deux joueurs requis" },
        { status: 400 }
      );
    }

    const duel = await createDuel({ playerAId, playerBId, metric, days });
    return NextResponse.json(duel);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
