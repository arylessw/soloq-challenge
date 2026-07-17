import { NextResponse } from "next/server";
import { syncAllPlayers } from "@/lib/sync-all";

// Un passage complet (19+ joueurs, appels Riot séquencés) dépasse les 10 s
// par défaut de Vercel — sans ceci, la fonction est tuée en plein milieu.
export const maxDuration = 60;

export async function POST() {
  try {
    const result = await syncAllPlayers();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[POST /api/sync]", e);
    return NextResponse.json({ error: "Sync échouée" }, { status: 500 });
  }
}
