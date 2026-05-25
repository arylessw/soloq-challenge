"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminDashboard } from "@/lib/admin-dashboard";
import type { PlayerView } from "@/lib/players";

const STORAGE_KEY = "soloq-admin-secret";

type Tab = "overview" | "players" | "users" | "duels" | "discord";

export function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [syncing, setSyncing] = useState(false);
  const [discordTesting, setDiscordTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ "x-admin-secret": secret }),
    [secret]
  );

  const load = useCallback(
    async (adminSecret: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { "x-admin-secret": adminSecret },
        });
        const json = await res.json();
        if (!res.ok) {
          if (res.status === 503) {
            throw new Error(
              "ADMIN_SECRET non configuré sur Vercel — ajoute la variable puis redeploie."
            );
          }
          if (res.status === 401) {
            sessionStorage.removeItem(STORAGE_KEY);
            throw new Error(
              "Mot de passe incorrect. Vérifie ADMIN_SECRET sur Vercel (sans guillemets)."
            );
          }
          throw new Error(json.error ?? "Accès refusé");
        }
        setData(json);
        setAuthed(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
    setData(null);
  }

  async function removePlayer(id: string, riotId: string) {
    if (!secret) return;
    if (!confirm(`Supprimer ${riotId} ?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/players/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Suppression échouée");
      setData((prev) =>
        prev
          ? {
              ...prev,
              players: prev.players.filter((p) => p.id !== id),
              stats: { ...prev.stats, players: prev.stats.players - 1 },
            }
          : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function runSync() {
    if (!secret) return;
    setSyncing(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: headers(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync échouée");
      setMessage(
        `Sync terminée : ${json.synced}/${json.results?.length ?? "?"} joueur(s) OK`
      );
      await load(secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSyncing(false);
    }
  }

  async function testDiscord() {
    if (!secret) return;
    setDiscordTesting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/discord/test", {
        method: "POST",
        headers: headers(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Test échoué");
      setMessage("Message de test envoyé sur Discord.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDiscordTesting(false);
    }
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="font-display text-3xl text-gold-light mb-2">Admin</h1>
          <p className="text-sm text-muted">
            Tableau de bord — mot de passe admin (ADMIN_SECRET).
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
          {error && <AdminError message={error} />}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Vérification…" : "Accéder"}
          </button>
        </form>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gold-light mb-1">
            Tableau admin
          </h1>
          <p className="text-sm text-muted">
            Joueurs, comptes, duels, sync Riot et Discord
          </p>
        </div>
        <button type="button" onClick={logout} className="leaderboard-tab">
          Déconnexion
        </button>
      </header>

      {error && <AdminError message={error} className="mb-4" />}
      {message && (
        <p className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Joueurs" value={stats?.players ?? 0} />
        <StatCard label="Comptes" value={stats?.users ?? 0} />
        <StatCard label="Duels actifs" value={stats?.duelsActive ?? 0} />
        <StatCard
          label="Discord"
          value={stats?.discordConfigured ? "OK" : "—"}
          hint={stats?.discordConfigured ? "Webhook configuré" : "Non configuré"}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["overview", "Vue d’ensemble"],
            ["players", "Joueurs"],
            ["users", "Comptes"],
            ["duels", "Duels"],
            ["discord", "Discord"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`leaderboard-tab ${tab === id ? "leaderboard-tab-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="card-glow space-y-4 relative z-[1]">
          <p className="text-sm text-muted">
            Synchronise tous les joueurs inscrits (Riot API). Les montées de
            rang et le nouveau leader LP déclenchent un webhook Discord si
            configuré.
          </p>
          <button
            type="button"
            onClick={runSync}
            disabled={syncing}
            className="btn-primary"
          >
            {syncing ? "Synchronisation…" : "Lancer la sync globale"}
          </button>
          <p className="text-xs text-muted">
            Duels terminés : {stats?.duelsFinished ?? 0}
          </p>
        </div>
      )}

      {tab === "players" && data && (
        <PlayersTable
          players={data.players}
          onRemove={removePlayer}
        />
      )}

      {tab === "users" && data && (
        <div className="table-shell">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-muted uppercase text-[11px] tracking-wider">
                <th className="py-3 pl-6 pr-4">Utilisateur</th>
                <th className="py-3 pr-4">Profils LoL</th>
                <th className="py-3 pr-4">Inscrit</th>
              </tr>
            </thead>
            <tbody>
              {data.users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 pl-6 text-muted">
                    Aucun compte site
                  </td>
                </tr>
              ) : (
                data.users.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.04]">
                    <td className="py-4 pl-6 pr-4 font-medium">
                      {u.displayName}
                      <span className="text-muted text-xs block">{u.email}</span>
                    </td>
                    <td className="py-4 pr-4">{u.playerCount}</td>
                    <td className="py-4 pr-4 text-muted text-xs">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "duels" && data && (
        <div className="table-shell">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 text-muted uppercase text-[11px] tracking-wider">
                <th className="py-3 pl-6 pr-4">Duel</th>
                <th className="py-3 pr-4">Statut</th>
                <th className="py-3 pr-4">Fin</th>
              </tr>
            </thead>
            <tbody>
              {data.duels.map((d) => (
                <tr key={d.id} className="border-b border-white/[0.04]">
                  <td className="py-4 pl-6 pr-4">
                    <span className="font-medium">{d.playerA}</span>
                    <span className="text-muted mx-1">vs</span>
                    <span className="font-medium">{d.playerB}</span>
                    <span className="text-xs text-muted block mt-0.5">
                      {d.metric === "wins" ? "Victoires" : "LP"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 capitalize">{d.status}</td>
                  <td className="py-4 pr-4 text-muted text-xs">
                    {new Date(d.endsAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "discord" && (
        <div className="card-glow space-y-4 relative z-[1] max-w-lg">
          <h2 className="font-display text-lg text-gold-light">Webhook Discord</h2>
          <p className="text-sm text-muted">
            Variable d&apos;environnement{" "}
            <code className="text-gold-light/90">DISCORD_WEBHOOK_URL</code> sur
            Vercel. Notifications automatiques :
          </p>
          <ul className="text-sm text-muted list-disc pl-5 space-y-1">
            <li>Montée de rang (après sync)</li>
            <li>Nouveau leader LP</li>
            <li>Duel terminé</li>
          </ul>
          <p className="text-sm">
            Statut :{" "}
            <span
              className={
                stats?.discordConfigured
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            >
              {stats?.discordConfigured ? "Configuré" : "Non configuré"}
            </span>
          </p>
          <button
            type="button"
            onClick={testDiscord}
            disabled={discordTesting || !stats?.discordConfigured}
            className="btn-primary"
          >
            {discordTesting ? "Envoi…" : "Envoyer un message test"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card-glow !p-4 relative z-[1] text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted mb-1">
        {label}
      </p>
      <p className="font-display text-2xl text-gold-light">{value}</p>
      {hint && <p className="text-[10px] text-muted mt-1">{hint}</p>}
    </div>
  );
}

function AdminError({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      className={`rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 ${className}`}
    >
      {message}
    </p>
  );
}

function PlayersTable({
  players,
  onRemove,
}: {
  players: PlayerView[];
  onRemove: (id: string, riotId: string) => void;
}) {
  return (
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
                  onClick={() => onRemove(p.id, p.riotId)}
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
  );
}
