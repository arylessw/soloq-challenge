"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIVISIONS, TIERS, TIER_LABELS, divisionRequired } from "@/lib/ranks";
import type { Tier } from "@/lib/ranks";

export function RegisterForm() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [startTier, setStartTier] = useState<Tier>("SILVER");
  const [startDivision, setStartDivision] = useState("IV");
  const [startLp, setStartLp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsDivision = divisionRequired(startTier);

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

  return (
    <form onSubmit={onSubmit} className="card max-w-lg mx-auto space-y-5">
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

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Vérification Riot API…" : "S'inscrire"}
      </button>
    </form>
  );
}
