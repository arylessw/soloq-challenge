"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaRegister() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setDismissed(true);
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
            onClick={() => setDismissed(true)}
            className="leaderboard-tab text-sm px-4"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
