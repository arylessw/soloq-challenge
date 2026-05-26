/** URL publique de production (projet Vercel `soloq-challenge-kappa`). */
export const PRODUCTION_SITE_URL = "https://soloq-challenge-kappa.vercel.app";

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** URL publique du site (partages, Open Graph, liens profil). */
export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return fromEnv || "http://localhost:3000";
  }

  return PRODUCTION_SITE_URL;
}

export function playerProfileUrl(playerId: string, baseUrl?: string): string {
  const base = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}/games/${playerId}`;
}

export function playerShareImageUrl(playerId: string, baseUrl?: string): string {
  const base = (baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}/games/${playerId}/opengraph-image`;
}

/** Chemin relatif (carte sur le même domaine, sans localhost figé au build). */
export function playerShareImagePath(playerId: string): string {
  return `/games/${playerId}/opengraph-image`;
}
