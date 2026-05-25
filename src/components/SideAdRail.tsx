"use client";

import { useEffect, useRef } from "react";
import type { AdRailPosition } from "@/lib/ads-config";
import {
  adsEnabled,
  getAdSenseClient,
  getAdSenseSlot,
  hasAdSense,
} from "@/lib/ads-config";

type Props = {
  position: AdRailPosition;
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

function PlaceholderPanel({ position }: { position: AdRailPosition }) {
  return (
    <div
      className="ad-panel-inner"
      role="complementary"
      aria-label={`Espace publicitaire ${position === "left" ? "gauche" : "droite"}`}
    >
      <span className="ad-panel-label">Publicité</span>
      <div className="ad-panel-slot" />
      <p className="ad-panel-hint">
        Panneau latéral 160×600
        <br />
        <span className="text-muted/70">AdSense via .env</span>
      </p>
    </div>
  );
}

function AdSensePanel({ position }: { position: AdRailPosition }) {
  const pushed = useRef(false);
  const client = getAdSenseClient();
  const slot = getAdSenseSlot(position);

  useEffect(() => {
    if (pushed.current || !client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ignore
    }
  }, [client, slot]);

  if (!client || !slot) return <PlaceholderPanel position={position} />;

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block", minHeight: 600, width: 160 }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format="vertical"
      data-full-width-responsive="false"
    />
  );
}

export function SideAdRail({ position }: Props) {
  if (!adsEnabled()) return null;

  const slot = getAdSenseSlot(position);
  const showReal = hasAdSense() && !!slot;

  return (
    <aside className={`ad-rail ad-rail-${position}`}>
      {showReal ? (
        <AdSensePanel position={position} />
      ) : (
        <PlaceholderPanel position={position} />
      )}
    </aside>
  );
}
