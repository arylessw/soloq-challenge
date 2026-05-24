import { NextResponse } from "next/server";
import {
  getCurrentUser,
  normalizeEmail,
  validateDisplayName,
  validateEmail,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    if (await getCurrentUser()) {
      return NextResponse.json(
        { error: "Tu es déjà connecté" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? "").trim();

    const emailErr = validateEmail(email);
    if (emailErr) {
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }

    const nameErr = validateDisplayName(displayName);
    if (nameErr) {
      return NextResponse.json({ error: nameErr }, { status: 400 });
    }

    const passErr = validatePassword(password);
    if (passErr) {
      return NextResponse.json({ error: passErr }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet e-mail" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
      select: { id: true, email: true, displayName: true, avatarMime: true },
    });

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: null,
      },
    });
  } catch (e) {
    console.error("[POST /api/auth/register]", e);
    return NextResponse.json(
      { error: "Inscription impossible" },
      { status: 500 }
    );
  }
}
