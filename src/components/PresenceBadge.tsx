import type { PresenceInfo } from "@/lib/presence";

export function PresenceBadge({ presence }: { presence: PresenceInfo }) {
  const styles =
    presence.status === "in_game"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
      : presence.status === "active"
        ? "bg-sky-500/10 text-sky-300/90 border-sky-500/25"
        : "bg-white/5 text-muted border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles}`}
    >
      {presence.status === "in_game" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {presence.label}
    </span>
  );
}
