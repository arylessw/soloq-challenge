import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Props) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }
  if (player.userId !== userId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.player.update({
    where: { id },
    data: { userId: null },
  });

  return NextResponse.json({ ok: true });
}
