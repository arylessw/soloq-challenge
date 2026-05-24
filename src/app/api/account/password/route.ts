import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  validatePassword,
  verifyPassword,
} from "@/lib/password";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  const passErr = validatePassword(newPassword);
  if (passErr) {
    return NextResponse.json({ error: passErr }, { status: 400 });
  }

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(currentPassword, row.passwordHash))) {
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect" },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
