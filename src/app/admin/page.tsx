"use client";

import { useCallback, useEffect, useState } from "react";
import type { PlayerView } from "@/lib/players";

const STORAGE_KEY = "soloq-admin-secret";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const load = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/players", {
        headers: { "x-admin-secret": adminSecret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Accès refusé");
      setPlayers(data);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSecret(saved);
      load(saved);
    }
  }, [load]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setSecret(trimmed);
    load(trimmed);
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setInput("");
    setAuthed(false);
    setPlayers([]);
  }

  async function removePlayer(id: string, riotId: string) {
    if (!secret) return;
    if (!confirm(`Supprimer ${riotId} ?`)) return;

    setError(null);
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Suppression échouée");
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl text-gold-light mb-2">Admin</h1>
          <p className="text-sm text-muted">
            Accès réservé — entre ton mot de passe admin (ADMIN_SECRET sur Vercel).
          </p>
        </header>
        <form onSubmit={login} className="card-glow space-y-4 relative z-[1]">
          <div>
            <label className="label" htmlFor="admin-secret">
              Mot de passe admin
            </label>
            <input
              id="admin-secret"
              type="password"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ton ADMIN_SECRET"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gold-light mb-1">Admin</h1>
          <p className="text-sm text-muted">{players.length} joueur(s) inscrit(s)</p>
        </div>
        <button type="button" onClick={logout} className="leaderboard-tab">
          Déconnexion
        </button>
      </header>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="table-shell">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gold/15 text-muted uppercase text-[11px] tracking-wider">
              <th className="py-3 pl-6 pr-4">Joueur</th>
              <th className="py-3 pr-4">Rang</th>
              <th className="py-3 pr-4">LP net</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className="border-b border-white/[0.04]">
                <td className="py-4 pl-6 pr-4 font-medium">{p.riotId}</td>
                <td className="py-4 pr-4 text-muted">{p.currentRank ?? "—"}</td>
                <td className="py-4 pr-4">{p.progressLabel ?? "—"}</td>
                <td className="py-4 pr-4">
                  <button
                    type="button"
                    onClick={() => removePlayer(p.id, p.riotId)}
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
