import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPlayerById } from "@/lib/players";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Profil SoloQ Challenge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

export default async function PlayerOgImage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const lpColor = (player.lpNet ?? 0) >= 0 ? "#34d399" : "#f87171";
  const streak =
    player.streakLabel && player.streakType
      ? `${player.streakType} ${player.streakLabel}`
      : null;
  const wlLine =
    player.wins != null && player.losses != null
      ? `${player.wins}V / ${player.losses}D${player.winrate != null ? ` · ${player.winrate}% WR` : ""}`
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background:
            "linear-gradient(145deg, #060a12 0%, #121a2e 50%, #0a0e17 100%)",
          color: "#f0e6b8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#d4af37",
              opacity: 0.85,
              marginBottom: 12,
            }}
          >
            EUW · SoloQ Challenge
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            {player.gameName}
          </div>
          <div style={{ fontSize: 24, color: "#8b9cb8" }}>
            {`#${player.tagLine}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, color: "#8b9cb8", marginBottom: 8 }}>
              Rang actuel
            </div>
            <div style={{ fontSize: 32, fontWeight: 600 }}>
              {player.currentRank ?? "—"}
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 18, color: "#8b9cb8", marginBottom: 8 }}>
              Progression défi
            </div>
            <div style={{ fontSize: 48, fontWeight: 700, color: lpColor }}>
              {player.progressLabel ?? "—"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {wlLine ? (
            <div style={{ fontSize: 20, color: "#8b9cb8" }}>{wlLine}</div>
          ) : null}
          {player.avgKda != null ? (
            <div style={{ fontSize: 20, color: "#8b9cb8" }}>
              {`KDA ${player.avgKda.toFixed(2)}`}
            </div>
          ) : null}
          {streak ? (
            <div style={{ fontSize: 20, color: "#f0e6b8" }}>{streak}</div>
          ) : null}
        </div>
      </div>
    ),
    { ...size }
  );
}
