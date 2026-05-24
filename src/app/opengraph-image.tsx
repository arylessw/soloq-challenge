import { ImageResponse } from "next/og";
import { listPlayers } from "@/lib/players";
import { sortPlayersForBoard } from "@/lib/leaderboards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "SoloQ Challenge — Classement EUW";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const players = await listPlayers();
  const top = sortPlayersForBoard(players, "lp").slice(0, 3);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#d4af37",
              opacity: 0.85,
            }}
          >
            EUW · SoloQ Challenge
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            Classement du défi
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#8b9cb8" }}>
            {`Progression LP · ${players.length} joueur${players.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          {top.length === 0 ? (
            <div style={{ display: "flex", fontSize: 28, color: "#8b9cb8" }}>
              Aucun joueur inscrit
            </div>
          ) : (
            top.map((p, i) => (
              <div
                key={p.id}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 24,
                  borderRadius: 16,
                  border: i === 0 ? "2px solid #d4af37" : "1px solid #ffffff22",
                  background:
                    i === 0 ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "flex", fontSize: 20, color: "#d4af37" }}>
                  {`#${i + 1}`}
                </div>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>
                  {p.gameName}
                </div>
                <div style={{ display: "flex", fontSize: 18, color: "#8b9cb8" }}>
                  {p.currentRank ?? "—"}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: 700,
                    color: (p.lpNet ?? 0) >= 0 ? "#34d399" : "#f87171",
                  }}
                >
                  {p.progressLabel ?? "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
