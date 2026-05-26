"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlayerView } from "@/lib/players";
import {
  buildProfileShareText,
  buildProfileShareTitle,
} from "@/lib/share";
import {
  PRODUCTION_SITE_URL,
  playerProfileUrl,
  playerShareImagePath,
  playerShareImageUrl,
} from "@/lib/site-url";

type Props = {
  player: PlayerView;
};

type CopiedKind = "link" | "text" | "image" | null;

export function ShareProfileButton({ player }: Props) {
  const [copied, setCopied] = useState<CopiedKind>(null);
  const [downloading, setDownloading] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState<string | null>(null);

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const siteBase = siteOrigin ?? PRODUCTION_SITE_URL;
  const profileUrl = useMemo(
    () => playerProfileUrl(player.id, siteBase),
    [player.id, siteBase]
  );
  const imagePath = playerShareImagePath(player.id);
  const imageUrl = useMemo(
    () => playerShareImageUrl(player.id, siteBase),
    [player.id, siteBase]
  );
  const shareText = useMemo(
    () => buildProfileShareText(player, siteBase),
    [player, siteBase]
  );

  async function copy(text: string, kind: CopiedKind) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copie ce texte :", text);
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copy(shareText, "text");
      return;
    }
    try {
      await navigator.share({
        title: buildProfileShareTitle(player),
        text: shareText,
        url: profileUrl,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      await copy(shareText, "text");
    }
  }

  async function downloadCard() {
    setDownloading(true);
    try {
      const res = await fetch(imagePath);
      if (!res.ok) throw new Error("Image indisponible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${player.gameName}-soloq-challenge.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(imagePath, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="leaderboard-tab text-xs border-gold/30 text-gold-light"
          >
            Partager…
          </button>
        )}
        <button
          type="button"
          onClick={() => copy(shareText, "text")}
          className="leaderboard-tab text-xs"
        >
          {copied === "text" ? "Texte copié ✓" : "Copier pour Discord"}
        </button>
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
          {copied === "image" ? "Image copiée ✓" : "Copier lien carte"}
        </button>
        <button
          type="button"
          onClick={downloadCard}
          disabled={downloading}
          className="leaderboard-tab text-xs disabled:opacity-50"
        >
          {downloading ? "Téléchargement…" : "Télécharger la carte"}
        </button>
        <a
          href={imagePath}
          target="_blank"
          rel="noopener noreferrer"
          className="leaderboard-tab text-xs inline-flex items-center"
        >
          Voir la carte →
        </a>
      </div>
      <p className="text-[11px] text-muted">
        La carte inclut rang, progression, main champion et stats clés — idéale
        pour Discord ou les réseaux.
      </p>
    </div>
  );
}
