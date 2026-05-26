import { NextResponse } from "next/server";
import { normalizeEmail, userAvatarUrl, validateEmail } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const password = String(body.password ?? "");

    const emailErr = validateEmail(email);
    if (emailErr) {
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "E-mail ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: userAvatarUrl(user.id, !!user.avatarMime, user.updatedAt),
      },
    });
  } catch (e) {
    console.error("[POST /api/auth/login]", e);
    return NextResponse.json(
      { error: "Connexion impossible" },
      { status: 500 }
    );
  }
}
