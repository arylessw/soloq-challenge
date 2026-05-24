import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarMime: true, avatarData: true },
  });

  if (!user?.avatarMime || !user.avatarData) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(user.avatarData, {
    headers: {
      "Content-Type": user.avatarMime,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
