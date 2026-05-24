"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";

const links = [
  { href: "/", label: "Classement" },
  { href: "/games", label: "Games" },
  { href: "/inscription", label: "Défi LoL" },
];

type AuthUser = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="nav-bar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 gap-3">
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 font-display text-sm text-gold transition group-hover:border-gold/60 group-hover:shadow-[0_0_20px_-6px_rgba(212,175,55,0.5)]"
            aria-hidden
          >
            SQ
          </span>
          <span className="hidden sm:block">
            <span className="font-display text-lg tracking-wide text-gold-light block leading-tight">
              SoloQ Challenge
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
              EUW
            </span>
          </span>
        </Link>
        <ul className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`nav-link block px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    active ? "nav-link-active bg-gold/5" : "hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          {user ? (
            <>
              <li>
                <Link
                  href="/compte"
                  className={`nav-link flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm ${
                    pathname.startsWith("/compte")
                      ? "nav-link-active bg-gold/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  <UserAvatar
                    displayName={user.displayName}
                    avatarUrl={user.avatarUrl}
                    size={26}
                  />
                  <span className="max-w-[80px] sm:max-w-none truncate">
                    {user.displayName}
                  </span>
                </Link>
              </li>
              <li className="hidden sm:block">
                <button
                  type="button"
                  onClick={logout}
                  className="nav-link px-3 py-2 rounded-lg text-xs hover:bg-white/5"
                >
                  Déco
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/compte/inscription"
                  className={`nav-link block px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    pathname === "/compte/inscription"
                      ? "nav-link-active bg-gold/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link
                  href="/compte/connexion"
                  className={`nav-link block px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm ${
                    pathname === "/compte/connexion"
                      ? "nav-link-active bg-gold/5"
                      : "hover:bg-white/5"
                  }`}
                >
                  Connexion
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
