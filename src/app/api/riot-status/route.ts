import { NextResponse } from "next/server";
import { checkRiotApiKey } from "@/lib/riot";

export async function GET() {
  const hasKey = Boolean(process.env.RIOT_API_KEY?.replace(/\s/g, "").trim());
  const ok = hasKey && (await checkRiotApiKey());

  return NextResponse.json({
    hasKey,
    ok,
    hint: ok
      ? "Clé API valide"
      : hasKey
        ? "Clé refusée ou expirée — regénère sur developer.riotgames.com puis redémarre npm run dev"
        : "RIOT_API_KEY manquante dans .env",
  });
}
