import type { Metadata } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export const siteMetadata: Metadata = {
  title: "SoloQ Challenge — EUW",
  description:
    "Classement du défi SoloQ entre amis — progression LP, rang, winrate et KDA.",
  metadataBase: new URL(PRODUCTION_SITE_URL),
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
  appleWebApp: {
    capable: true,
    title: "SoloQ",
    statusBarStyle: "black-translucent",
  },
  applicationName: "SoloQ Challenge",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};
