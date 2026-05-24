"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LinkRiotAccountForm } from "@/components/LinkRiotAccountForm";
import { UserAvatar } from "@/components/UserAvatar";

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

type LinkedPlayer = {
  id: string;
  gameName: string;
  tagLine: string;
};

export function AccountDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [linked, setLinked] = useState<LinkedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (!data.user) {
        router.replace("/compte/connexion");
        return;
      }
      setUser(data.user);
      setDisplayName(data.user.displayName);
      setLinked(data.linkedPlayers ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDisplayName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setUser(data.user);
      setMessage("Pseudo mis à jour");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPass(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Mot de passe modifié");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingPass(false);
    }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/account/avatar", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload échoué");
      setUser((u) => (u ? { ...u, avatarUrl: data.avatarUrl } : u));
      setMessage("Photo de profil mise à jour");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function removeAvatar() {
    setUploadingAvatar(true);
    setError(null);
    try {
      const res = await fetch("/api/account/avatar", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      setUser((u) => (u ? { ...u, avatarUrl: null } : u));
      setMessage("Photo supprimée");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function unlinkPlayer(id: string) {
    if (!confirm("Retirer ce compte LoL de ton profil ? (Il reste dans le défi.)")) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/account/players/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setLinked((list) => list.filter((p) => p.id !== id));
      setMessage("Compte LoL retiré du profil");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <section className="card-glow relative z-[1]">
        <div className="flex flex-wrap items-start gap-5">
          <UserAvatar
            displayName={user.displayName}
            avatarUrl={user.avatarUrl}
            size={72}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-2xl text-gold-light">{user.displayName}</h2>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <label className="leaderboard-tab text-xs cursor-pointer">
                {uploadingAvatar ? "Envoi…" : "Changer la photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={onAvatarChange}
                  disabled={uploadingAvatar}
                />
              </label>
              {user.avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={uploadingAvatar}
                  className="leaderboard-tab text-xs"
                >
                  Supprimer la photo
                </button>
              )}
              <button
                type="button"
                onClick={logout}
                className="leaderboard-tab text-xs text-red-300/90"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card-glow relative z-[1] space-y-4">
        <h2 className="font-display text-xl text-gold-light">Pseudo affiché</h2>
        <form onSubmit={saveDisplayName} className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={2}
            maxLength={24}
            required
          />
          <button type="submit" disabled={savingName} className="btn-primary sm:shrink-0">
            {savingName ? "…" : "Enregistrer"}
          </button>
        </form>
      </section>

      <section className="card-glow relative z-[1] space-y-4">
        <h2 className="font-display text-xl text-gold-light">Mot de passe</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            className="input"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Nouveau mot de passe (8+ caractères)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button type="submit" disabled={savingPass} className="btn-primary w-full sm:w-auto">
            {savingPass ? "…" : "Changer le mot de passe"}
          </button>
        </form>
      </section>

      <section className="card-glow relative z-[1]">
        <h2 className="font-display text-xl text-gold-light mb-4">Comptes LoL reliés</h2>
        {linked.length === 0 ? (
          <p className="text-sm text-muted mb-4">
            Aucun compte LoL relié — ajoute-en un pour apparaître avec ta photo dans les
            classements.
          </p>
        ) : (
          <ul className="space-y-2 mb-4">
            {linked.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] px-4 py-3"
              >
                <div>
                  <Link
                    href={`/games/${p.id}`}
                    className="font-medium hover:text-gold-light transition"
                  >
                    {p.gameName}
                  </Link>
                  <span className="text-muted text-sm"> #{p.tagLine}</span>
                </div>
                <button
                  type="button"
                  onClick={() => unlinkPlayer(p.id)}
                  className="text-xs text-muted hover:text-red-300 transition"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
        <LinkRiotAccountForm onLinked={load} />
      </section>
    </div>
  );
}
