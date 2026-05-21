"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DIVISIONS, TIERS, TIER_LABELS, divisionRequired } from "@/lib/ranks";
import type { Tier } from "@/lib/ranks";
import { TEAM_LABELS, type Team } from "@/lib/teams";

type TeamOption = {
  id: Team;
  label: string;
  count: number;
  canJoin: boolean;
  blockReason: string | null;
};

export function RegisterForm() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [team, setTeam] = useState<Team>("TEAM1");
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [startTier, setStartTier] = useState<Tier>("SILVER");
  const [startDivision, setStartDivision] = useState("IV");
  const [startLp, setStartLp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsDivision = divisionRequired(startTier);

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        const opts = (data.teams ?? []) as TeamOption[];
        setTeamOptions(opts);
        const firstOpen = opts.find((t) => t.canJoin);
        if (firstOpen) setTeam(firstOpen.id);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let name = gameName.trim();
    let tag = tagLine.trim();
    if (name.includes("#")) {
      const [n, t] = name.split("#", 2);
      name = n.trim();
      tag = (t || tag).trim();
    }

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameName: name,
          tagLine: tag,
          team,
          startTier,
          startDivision: needsDivision ? startDivision : "I",
          startLp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inscription échouée");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  const selectedOption = teamOptions.find((t) => t.id === team);

  return (
    <form onSubmit={onSubmit} className="card max-w-lg mx-auto space-y-5">
      <fieldset>
        <legend className="text-gold font-medium mb-3">Équipe</legend>
        <div className="grid grid-cols-2 gap-3">
          {(["TEAM1", "TEAM2"] as Team[]).map((id) => {
            const opt = teamOptions.find((t) => t.id === id);
            const canJoin = opt?.canJoin ?? true;
            const count = opt?.count ?? 0;
            return (
              <label
                key={id}
                className={`relative flex cursor-pointer flex-col rounded-lg border p-4 transition ${
                  team === id
                    ? id === "TEAM1"
                      ? "border-blue-400/60 bg-blue-500/10"
                      : "border-red-400/60 bg-red-500/10"
                    : "border-white/10 hover:border-white/20"
                } ${!canJoin ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="team"
                  value={id}
                  checked={team === id}
                  disabled={!canJoin}
                  onChange={() => setTeam(id)}
                  className="sr-only"
                />
                <span className="font-medium">{TEAM_LABELS[id]}</span>
                <span className="text-xs text-muted mt-1">
                  {count} joueur{count !== 1 ? "s" : ""}
                </span>
                {!canJoin && (
                  <span className="text-xs text-red-300/90 mt-2">Équipe pleine</span>
                )}
              </label>
            );
          })}
        </div>
        {selectedOption?.blockReason && team === selectedOption.id && !selectedOption.canJoin && (
          <p className="mt-2 text-xs text-red-300">{selectedOption.blockReason}</p>
        )}
        <p className="mt-2 text-xs text-muted">
          Si une équipe a 1 joueur de plus, elle est fermée jusqu&apos;à ce que ce soit équilibré.
        </p>
      </fieldset>

      <div>
        <label className="label" htmlFor="gameName">
          Pseudo (Riot ID)
        </label>
        <input
          id="gameName"
          className="input"
          placeholder="MonPseudo"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="tagLine">
          Tag
        </label>
        <input
          id="tagLine"
          className="input"
          placeholder="EUW"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted">
          Copie ton Riot ID depuis le client LoL (Profil → icône copier).
        </p>
      </div>

      <fieldset className="border-t border-gold/20 pt-5">
        <legend className="text-gold font-medium mb-3">
          Rang de départ (au moment de l&apos;inscription)
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="startTier">
              Tier
            </label>
            <select
              id="startTier"
              className="input"
              value={startTier}
              onChange={(e) => setStartTier(e.target.value as Tier)}
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {TIER_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {needsDivision && (
            <div>
              <label className="label" htmlFor="startDivision">
                Division
              </label>
              <select
                id="startDivision"
                className="input"
                value={startDivision}
                onChange={(e) => setStartDivision(e.target.value)}
              >
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="startLp">
            LP au départ (0–100)
          </label>
          <input
            id="startLp"
            type="number"
            min={0}
            max={100}
            className="input"
            value={startLp}
            onChange={(e) => setStartLp(Number(e.target.value))}
          />
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || selectedOption?.canJoin === false}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? "Vérification Riot API…" : "S'inscrire au défi"}
      </button>
    </form>
  );
}
