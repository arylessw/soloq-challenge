import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_BYTES = 512 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("avatar");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format accepté : JPEG, PNG ou WebP" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image trop lourde (max 512 Ko)" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarMime: file.type, avatarData: buffer },
  });

  return NextResponse.json({
    avatarUrl: `/api/avatars/${user.id}`,
  });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarMime: null, avatarData: null },
  });

  return NextResponse.json({ ok: true });
}
