"use client";

import { useEffect, useState } from "react";

export function RiotApiBanner() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/riot-status", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) setStatus(data.ok ? "ok" : "error");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    check();
    const interval = setInterval(check, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (status !== "error") return null;

  return (
    <div
      role="alert"
      className="border-b border-red-500/40 bg-red-950/80 px-4 py-2.5 text-center text-sm text-red-200"
    >
      Clé API Riot invalide ou expirée — les stats ne se mettent pas à jour. Regénère une
      clé sur{" "}
      <a
        href="https://developer.riotgames.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-red-100 hover:text-white"
      >
        developer.riotgames.com
      </a>{" "}
      puis mets à jour <code className="text-red-100">RIOT_API_KEY</code> sur Vercel.
    </div>
  );
}
