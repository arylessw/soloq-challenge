import { NextResponse } from "next/server";
import {
  getCurrentUser,
  userAvatarUrl,
  validateDisplayName,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const linked = await prisma.player.findMany({
    where: { userId: user.id },
    select: { id: true, gameName: true, tagLine: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ user, linkedPlayers: linked });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json();
  const displayName = String(body.displayName ?? "").trim();
  const nameErr = validateDisplayName(displayName);
  if (nameErr) {
    return NextResponse.json({ error: nameErr }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { displayName },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarMime: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      avatarUrl: userAvatarUrl(
        updated.id,
        !!updated.avatarMime,
        updated.updatedAt
      ),
    },
  });
}
