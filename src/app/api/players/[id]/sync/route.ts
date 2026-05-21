import { NextResponse } from "next/server";
import { syncPlayerById } from "@/lib/sync-player";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = await syncPlayerById(id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Erreur de sync" },
      { status: result.error === "Joueur introuvable" ? 404 : 400 }
    );
  }

  return NextResponse.json({ message: "Synchronisé" });
}
