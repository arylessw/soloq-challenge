import type { Metadata } from "next";

const siteUrl =
  process.env.VERCEL_URL != null
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? "https://soloq-challenge-kappa.vercel.app";

export const siteMetadata: Metadata = {
  title: "SoloQ Challenge — EUW",
  description:
    "Classement du défi SoloQ entre amis — progression LP, rang, winrate et KDA.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "SoloQ Challenge — EUW",
    description:
      "Classement du défi SoloQ entre amis — progression LP, rang, winrate et KDA.",
    siteName: "SoloQ Challenge",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoloQ Challenge — EUW",
    description: "Classement du défi SoloQ entre amis sur EUW.",
  },
};
