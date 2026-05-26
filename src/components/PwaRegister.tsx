"use client";

import { useEffect, useState } from "react";

const PWA_DISMISS_KEY = "soloq-pwa-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(PWA_DISMISS_KEY) === "1";
  });

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});

    const onBeforeInstall = (e: Event) => {
      if (sessionStorage.getItem(PWA_DISMISS_KEY) === "1") return;
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismissInstall() {
    sessionStorage.setItem(PWA_DISMISS_KEY, "1");
    setInstallEvent(null);
    setDismissed(true);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    dismissInstall();
  }

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-md sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="card-glow flex flex-col gap-3 p-4 shadow-2xl relative z-[1]">
        <p className="text-sm text-white/90">
          <span className="font-medium text-gold-light">Installer l&apos;app</span>
          {" "}— accès rapide au classement depuis l&apos;écran d&apos;accueil.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={install} className="btn-primary flex-1 text-sm">
            Ajouter
          </button>
          <button
            type="button"
            onClick={dismissInstall}
            className="leaderboard-tab text-sm px-4"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
