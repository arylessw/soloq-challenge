import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { championIconUrl } from "@/lib/champion-stats";
import { roleIconUrl } from "@/lib/role-stats";
import { getLpHistory, type LpHistoryPoint } from "@/lib/lp-snapshots";
import { getPlayerById } from "@/lib/players";
import { getSiteUrl } from "@/lib/site-url";

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

  const topChampion = player.mainChampion ?? player.championStats[0] ?? null;
  const topRole = player.mainRole ?? player.roleStats[0] ?? null;
  const showLpSparkline = !topChampion && !topRole && lpHistory.length >= 2;
  const siteUrl = getSiteUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px 40px",
          background:
            "linear-gradient(160deg, #060a12 0%, #121a2e 42%, #0a0e17 100%)",
          border: "2px solid rgba(212,175,55,0.25)",
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
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.05,
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
                Main champion
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
              {topRole ? (
                <div style={{ display: "flex", fontSize: 13, color: "#8b9cb8" }}>
                  {`Rôle ${topRole.label} · ${topRole.winrate}% WR`}
                </div>
              ) : null}
            </div>
          ) : topRole ? (
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
                Main rôle
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={roleIconUrl(topRole.role)} width={80} height={80} alt="" />
              <div style={{ display: "flex", fontSize: 16, color: "#f0e6b8", fontWeight: 600 }}>
                {topRole.label}
              </div>
              <div style={{ display: "flex", fontSize: 14, color: "#8b9cb8" }}>
                {`${topRole.games} parties · ${topRole.winrate}% WR`}
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
            <div style={{ fontSize: 64, fontWeight: 800, color: lpColor, lineHeight: 1 }}>
              {player.progressLabel ?? "—"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.1)",
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
          {player.presence.status === "in_game" ? (
            <div style={{ fontSize: 20, color: "#34d399" }}>En partie</div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 44,
                height: 44,
                borderRadius: 10,
                border: "2px solid #d4af37",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: "#d4af37",
                background: "rgba(212,175,55,0.12)",
              }}
            >
              SQ
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#f0e6b8" }}>
                SoloQ Challenge
              </span>
              <span style={{ fontSize: 13, color: "#8b9cb8" }}>EUW · Défi entre amis</span>
            </div>
          </div>
          <span style={{ fontSize: 15, color: "#8b9cb8" }}>{siteUrl}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
