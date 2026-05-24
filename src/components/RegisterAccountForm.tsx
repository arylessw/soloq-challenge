"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterAccountForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Inscription échouée");
      router.push("/compte");
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
        <label className="label" htmlFor="displayName">
          Pseudo affiché
        </label>
        <input
          id="displayName"
          className="input"
          placeholder="Ton pseudo sur le site"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          minLength={2}
          maxLength={24}
          required
        />
        <p className="mt-1 text-xs text-muted">
          Visible dans les classements à la place du Riot ID si tu relies un compte LoL.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="passwordConfirm">
          Confirmer le mot de passe
        </label>
        <input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          className="input"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          minLength={8}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/compte/connexion" className="text-gold-light hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
