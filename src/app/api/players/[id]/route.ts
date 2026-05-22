import { NextResponse } from "next/server";
import { getPlayerById } from "@/lib/players";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const player = await getPlayerById(id);

  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }

  return NextResponse.json(player);
}
