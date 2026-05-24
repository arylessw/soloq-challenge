"use client";

import { useState } from "react";
import {
  playerProfileUrl,
  playerShareImageUrl,
} from "@/lib/site-url";

type Props = {
  playerId: string;
  gameName: string;
};

export function ShareProfileButton({ playerId, gameName }: Props) {
  const [copied, setCopied] = useState<"link" | "image" | null>(null);

  async function copy(text: string, kind: "link" | "image") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copie ce lien :", text);
    }
  }

  const profileUrl = playerProfileUrl(playerId);
  const imageUrl = playerShareImageUrl(playerId);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copy(profileUrl, "link")}
        className="leaderboard-tab text-xs"
      >
        {copied === "link" ? "Lien copié ✓" : "Copier lien profil"}
      </button>
      <button
        type="button"
        onClick={() => copy(imageUrl, "image")}
        className="leaderboard-tab text-xs"
      >
        {copied === "image" ? "Image copiée ✓" : "Copier lien carte Discord"}
      </button>
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="leaderboard-tab text-xs inline-flex items-center"
      >
        Voir la carte {gameName} →
      </a>
    </div>
  );
}
