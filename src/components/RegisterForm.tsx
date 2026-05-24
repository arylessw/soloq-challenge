"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RankWithEmblem } from "@/components/RankEmblem";
import { DIVISIONS, TIERS, TIER_LABELS, divisionRequired } from "@/lib/ranks";
import type { Tier } from "@/lib/ranks";

export function RegisterForm() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [startTier, setStartTier] = useState<Tier>("SILVER");
  const [startDivision, setStartDivision] = useState("IV");
  const [startLp, setStartLp] = useState(0);
  const [rankLoaded, setRankLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingRank, setFetchingRank] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsDivision = divisionRequired(startTier);

  function parseRiotId() {
    let name = gameName.trim();
    let tag = tagLine.trim();
    if (name.includes("#")) {
      const [n, t] = name.split("#", 2);
      name = n.trim();
      tag = (t || tag).trim();
    }
    return { name, tag };
  }

  async function fetchRankFromRiot() {
    const { name, tag } = parseRiotId();
    if (!name || !tag) {
      setError("Entre ton pseudo et ton tag avant de récupérer le rang");
      return;
    }

    setFetchingRank(true);
    setError(null);

    try {
      const params = new URLSearchParams({ gameName: name, tagLine: tag });
      const res = await fetch(`/api/players/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Impossible de récupérer le rang");

      setStartTier(data.tier as Tier);
      setStartDivision(data.division);
      setStartLp(data.lp);
      setRankLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setRankLoaded(false);
    } finally {
      setFetchingRank(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { name, tag } = parseRiotId();

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
    <form onSubmit={onSubmit} className="card-glow max-w-lg mx-auto space-y-5 relative z-[1]">
      <div>
        <label className="label" htmlFor="gameName">
          Pseudo (Riot ID)
        </label>
        <input
          id="gameName"
          className="input"
          placeholder="MonPseudo"
          value={gameName}
          onChange={(e) => {
            setGameName(e.target.value);
            setRankLoaded(false);
          }}
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
          onChange={(e) => {
            setTagLine(e.target.value);
            setRankLoaded(false);
          }}
          required
        />
        <p className="mt-1 text-xs text-muted">
          Copie ton Riot ID depuis le client LoL (Profil → icône copier).
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={fetchRankFromRiot}
          disabled={fetchingRank}
          className="btn-primary w-full disabled:opacity-50"
        >
          {fetchingRank
            ? "Récupération du rang SoloQ…"
            : "Récupérer mon rang actuel depuis Riot"}
        </button>
        <p className="mt-2 text-xs text-muted text-center">
          Ton rang de départ sera celui affiché au moment de l&apos;inscription.
        </p>
      </div>

      <fieldset className="border-t border-gold/20 pt-5">
        <legend className="text-gold font-medium mb-3">
          Rang de départ
          {rankLoaded && (
            <span className="ml-2 text-xs font-sans font-normal text-emerald-400">
              ✓ depuis Riot
            </span>
          )}
        </legend>

        {rankLoaded && (
          <div className="mb-4 rounded-lg border border-gold/20 bg-bg/50 px-4 py-3">
            <RankWithEmblem
              tier={startTier}
              label={`${TIER_LABELS[startTier]}${needsDivision ? ` ${startDivision}` : ""} — ${startLp} LP`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="startTier">
              Tier
            </label>
            <select
              id="startTier"
              className="input"
              value={startTier}
              onChange={(e) => {
                setStartTier(e.target.value as Tier);
                setRankLoaded(false);
              }}
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
                onChange={(e) => {
                  setStartDivision(e.target.value);
                  setRankLoaded(false);
                }}
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
            onChange={(e) => {
              setStartLp(Number(e.target.value));
              setRankLoaded(false);
            }}
          />
        </div>
      </fieldset>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Inscription…" : "S'inscrire"}
      </button>
    </form>
  );
}
