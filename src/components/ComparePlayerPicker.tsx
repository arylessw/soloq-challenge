"use client";

import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

type Props = {
  players: Option[];
  p1: string | null;
  p2: string | null;
};

export function ComparePlayerPicker({ players, p1, p2 }: Props) {
  const router = useRouter();

  function go(a: string | null, b: string | null) {
    const params = new URLSearchParams();
    if (a) params.set("p1", a);
    if (b) params.set("p2", b);
    const qs = params.toString();
    router.push(`/games/compare${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="card mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
      <Field
        label="Joueur 1"
        value={p1}
        exclude={p2}
        players={players}
        onChange={(v) => go(v, p2)}
      />
      <button
        type="button"
        onClick={() => go(p2, p1)}
        disabled={!p1 || !p2}
        className="mx-auto shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-gold-light transition hover:border-gold/30 hover:bg-gold/10 disabled:opacity-40 sm:mb-0"
        aria-label="Inverser les joueurs"
        title="Inverser"
      >
        ↔
      </button>
      <Field
        label="Joueur 2"
        value={p2}
        exclude={p1}
        players={players}
        onChange={(v) => go(p1, v)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  exclude,
  players,
  onChange,
}: {
  label: string;
  value: string | null;
  exclude: string | null;
  players: Option[];
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex-1">
      <label className="label">{label}</label>
      <select
        className="input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Choisir…</option>
        {players.map((p) => (
          <option key={p.id} value={p.id} disabled={p.id === exclude}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
