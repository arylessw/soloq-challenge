import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { championIconUrl } from "@/lib/champion-stats";
import { getLpHistory, type LpHistoryPoint } from "@/lib/lp-snapshots";
import { getPlayerById } from "@/lib/players";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Profil SoloQ Challenge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

function OgLpSparkline({
  points,
  positive,
}: {
  points: LpHistoryPoint[];
  positive: boolean;
}) {
  const w = 240;
  const h = 96;
  const pad = 10;
  const lpValues = points.map((p) => p.lpNet);
  const minLp = Math.min(0, ...lpValues);
  const maxLp = Math.max(0, ...lpValues);
  const range = Math.max(maxLp - minLp, 20);
  const yMin = minLp - range * 0.1;
  const yMax = maxLp + range * 0.1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const toX = (i: number) => pad + (i / (points.length - 1)) * innerW;
  const toY = (lp: number) =>
    pad + innerH - ((lp - yMin) / (yMax - yMin)) * innerH;
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.lpNet)}`)
    .join(" ");
  const zeroY = toY(0);
  const color = positive ? "#34d399" : "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
      <div
        style={{
          display: "flex",
          fontSize: 11,
          color: "#8b9cb8",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Progression LP
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <line
          x1={pad}
          y1={zeroY}
          x2={w - pad}
          y2={zeroY}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default async function PlayerOgImage({ params }: Props) {
  const { id } = await params;
  const [player, lpHistory] = await Promise.all([
    getPlayerById(id),
    getLpHistory(id),
  ]);
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

  const topChampion = player.championStats[0] ?? null;
  const showLpSparkline = !topChampion && lpHistory.length >= 2;

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
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

          {topChampion ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 11,
                  color: "#8b9cb8",
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                Main · 20 games
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: 18,
                  border: "3px solid #d4af37",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(212,175,55,0.25)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={championIconUrl(topChampion.championName)}
                  width={104}
                  height={104}
                  alt=""
                />
              </div>
              <div style={{ display: "flex", fontSize: 16, color: "#f0e6b8", fontWeight: 600 }}>
                {topChampion.championName}
              </div>
              <div style={{ display: "flex", fontSize: 14, color: "#8b9cb8" }}>
                {`${topChampion.games} parties · ${topChampion.winrate}% WR`}
              </div>
            </div>
          ) : showLpSparkline ? (
            <OgLpSparkline points={lpHistory} positive={(player.lpNet ?? 0) >= 0} />
          ) : null}
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
