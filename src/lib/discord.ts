import { getSiteUrl } from "@/lib/site-url";

export type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordWebhookPayload = {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: DiscordEmbedField[];
    timestamp?: string;
    url?: string;
  }>;
};

export function getDiscordWebhookUrl(): string | null {
  const url = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!url || !url.startsWith("https://discord.com/api/webhooks/")) {
    return null;
  }
  return url;
}

export function isDiscordConfigured(): boolean {
  return !!getDiscordWebhookUrl();
}

export async function sendDiscord(
  payload: DiscordWebhookPayload
): Promise<{ ok: boolean; error?: string }> {
  const url = getDiscordWebhookUrl();
  if (!url) {
    return { ok: false, error: "DISCORD_WEBHOOK_URL non configuré" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: text || `Discord ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Erreur réseau",
    };
  }
}

const COLORS = {
  gold: 0xd4af37,
  emerald: 0x34d399,
  red: 0xf87171,
  sky: 0x38bdf8,
  violet: 0xa78bfa,
};

export async function sendDiscordTest(): Promise<{ ok: boolean; error?: string }> {
  return sendDiscord({
    embeds: [
      {
        title: "SoloQ Challenge — test webhook",
        description: "Les notifications Discord sont bien connectées.",
        color: COLORS.gold,
        fields: [
          { name: "Site", value: getSiteUrl() },
          {
            name: "Événements",
            value: "Montée de rang · Nouveau 1er LP · Duel terminé",
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function notifyDiscordRankUp(
  riotId: string,
  oldRank: string,
  newRank: string,
  playerId: string
): Promise<void> {
  await sendDiscord({
    embeds: [
      {
        title: "Montée de rang",
        description: `**${riotId}** est passé **${oldRank}** → **${newRank}**`,
        color: COLORS.emerald,
        url: `${getSiteUrl()}/games/${playerId}`,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function notifyDiscordNewLeader(
  riotId: string,
  lpNet: number,
  playerId: string
): Promise<void> {
  await sendDiscord({
    embeds: [
      {
        title: "Nouveau leader LP",
        description: `**${riotId}** prend la tête du classement (${lpNet >= 0 ? "+" : ""}${lpNet} LP)`,
        color: COLORS.gold,
        url: `${getSiteUrl()}/games/${playerId}`,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

export async function notifyDiscordDuelEnd(
  winnerRiotId: string,
  loserRiotId: string,
  metric: string,
  scoreW: number,
  scoreL: number
): Promise<void> {
  await sendDiscord({
    embeds: [
      {
        title: "Duel terminé",
        description: `**${winnerRiotId}** bat **${loserRiotId}**`,
        color: COLORS.violet,
        fields: [
          { name: "Objectif", value: metric === "wins" ? "Victoires" : "LP", inline: true },
          { name: "Score", value: `${scoreW} - ${scoreL}`, inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
