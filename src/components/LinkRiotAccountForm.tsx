"use client";

import { useState } from "react";
import { RankWithEmblem } from "@/components/RankEmblem";
import { DIVISIONS, TIERS, TIER_LABELS, divisionRequired } from "@/lib/ranks";
import type { Tier } from "@/lib/ranks";

type Props = {
  onLinked?: () => void;
};

export function LinkRiotAccountForm({ onLinked }: Props) {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [startTier, setStartTier] = useState<Tier>("SILVER");
  const [startDivision, setStartDivision] = useState("IV");
  const [startLp, setStartLp] = useState(0);
  const [rankLoaded, setRankLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingRank, setFetchingRank] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setError("Entre ton pseudo et ton tag");
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
    setSuccess(null);
    const { name, tag } = parseRiotId();

    try {
      const res = await fetch("/api/account/players", {
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
      if (!res.ok) throw new Error(data.error ?? "Échec");
      setSuccess(`${name}#${tag} relié au profil`);
      setGameName("");
      setTagLine("");
      setRankLoaded(false);
      onLinked?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border-t border-gold/15 pt-5">
      <h3 className="font-display text-lg text-gold-light">Ajouter un compte LoL</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="link-gameName">
            Pseudo
          </label>
          <input
            id="link-gameName"
            className="input"
            value={gameName}
            onChange={(e) => {
              setGameName(e.target.value);
              setRankLoaded(false);
            }}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="link-tagLine">
            Tag
          </label>
          <input
            id="link-tagLine"
            className="input"
            value={tagLine}
            onChange={(e) => {
              setTagLine(e.target.value);
              setRankLoaded(false);
            }}
            required
          />
        </div>
      </div>
      <button
        type="button"
        onClick={fetchRankFromRiot}
        disabled={fetchingRank}
        className="leaderboard-tab w-full text-sm disabled:opacity-50"
      >
        {fetchingRank ? "Récupération…" : "Récupérer le rang depuis Riot"}
      </button>
      {rankLoaded && (
        <div className="rounded-lg border border-gold/20 bg-bg/50 px-4 py-3">
          <RankWithEmblem
            tier={startTier}
            label={`${TIER_LABELS[startTier]}${needsDivision ? ` ${startDivision}` : ""} — ${startLp} LP`}
          />
        </div>
      )}
      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-400">{success}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
        {loading ? "Ajout…" : "Relier ce compte LoL"}
      </button>
    </form>
  );
}
