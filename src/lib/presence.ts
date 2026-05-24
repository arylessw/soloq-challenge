import { formatRelativeTimeFromIso } from "@/lib/format-time";

export type PresenceStatus = "in_game" | "active" | "offline";

export type PresenceInfo = {
  status: PresenceStatus;
  label: string;
};

export function getPresence(inGame: boolean, lastGameAt: string | null): PresenceInfo {
  if (inGame) {
    return { status: "in_game", label: "En partie" };
  }

  if (!lastGameAt) {
    return { status: "offline", label: "Aucune partie" };
  }

  const endedMs = new Date(lastGameAt).getTime();
  if (Number.isNaN(endedMs)) {
    return { status: "offline", label: "Hors ligne" };
  }

  const agoSec = Math.floor((Date.now() - endedMs) / 1000);
  const relative = formatRelativeTimeFromIso(lastGameAt);

  if (agoSec < 2 * 60 * 60) {
    return {
      status: "active",
      label: relative ? `Actif ${relative}` : "Actif récemment",
    };
  }

  return {
    status: "offline",
    label: relative ? `Absent ${relative}` : "Hors ligne",
  };
}
