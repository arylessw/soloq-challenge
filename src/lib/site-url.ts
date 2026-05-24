/** URL publique du site (partages, Open Graph, liens profil). */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return "http://localhost:3000";
}

export function playerProfileUrl(playerId: string): string {
  return `${getSiteUrl()}/games/${playerId}`;
}

export function playerShareImageUrl(playerId: string): string {
  return `${getSiteUrl()}/games/${playerId}/opengraph-image`;
}
