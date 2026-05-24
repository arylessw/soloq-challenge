"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Classement" },
  { href: "/games", label: "Games" },
  { href: "/inscription", label: "S'inscrire" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav-bar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/30 font-display text-sm text-gold transition group-hover:border-gold/60 group-hover:shadow-[0_0_20px_-6px_rgba(212,175,55,0.5)]"
            aria-hidden
          >
            SQ
          </span>
          <span>
            <span className="font-display text-lg tracking-wide text-gold-light block leading-tight">
              SoloQ Challenge
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
              EUW
            </span>
          </span>
        </Link>
        <ul className="flex gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`nav-link block px-3 py-2 rounded-lg ${
                    active ? "nav-link-active bg-gold/5" : "hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
