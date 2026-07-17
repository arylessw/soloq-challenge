import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { fetchAccount } from "@/lib/riot";
import { syncPlayerById } from "@/lib/sync-player";

type Params = { params: Promise<{ id: string }> };

/**
 * Corrige le Riot ID d'un joueur (renommage, compte introuvable).
 * Valide le nouvel ID auprès de Riot et re-résout le puuid, puis relance
 * une sync immédiate pour que le rang reparte sans attendre.
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const gameName = String(body.gameName ?? "").trim();
    const tagLine = String(body.tagLine ?? "").trim().replace(/^#/, "");

    if (!gameName || !tagLine) {
      return NextResponse.json(
        { error: "Riot ID attendu au format pseudo#tag" },
        { status: 400 }
      );
    }

    const account = await fetchAccount(gameName, tagLine);

    await prisma.player.update({
      where: { id },
      data: {
        gameName: account.gameName,
        tagLine: account.tagLine,
        puuid: account.puuid,
        summonerId: account.puuid,
      },
    });

    const sync = await syncPlayerById(id);

    return NextResponse.json({
      ok: true,
      riotId: `${account.gameName}#${account.tagLine}`,
      synced: sync.ok,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ce Riot ID est déjà suivi par un autre joueur du défi" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }
}
