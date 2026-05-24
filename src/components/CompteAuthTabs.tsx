"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/compte/inscription", label: "Créer un compte" },
  { href: "/compte/connexion", label: "Connexion" },
];

export function CompteAuthTabs() {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-wrap justify-center gap-2 mb-8"
      role="tablist"
      aria-label="Compte site"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`leaderboard-tab text-sm ${
              active ? "leaderboard-tab-active" : ""
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
