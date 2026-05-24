import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SoloQ Challenge — EUW",
    short_name: "SoloQ",
    description:
      "Classement du défi SoloQ entre amis — progression LP, rang, winrate et KDA.",
    start_url: "/",
    display: "standalone",
    background_color: "#060a12",
    theme_color: "#060a12",
    orientation: "portrait-primary",
    lang: "fr",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
