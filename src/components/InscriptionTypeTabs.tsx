"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/compte/inscription", label: "Compte site" },
  { href: "/inscription", label: "Défi LoL (Riot ID)" },
];

export function InscriptionTypeTabs() {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-wrap justify-center gap-2 mb-8 max-w-lg mx-auto"
      role="tablist"
      aria-label="Type d'inscription"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`leaderboard-tab text-sm flex-1 text-center min-w-[140px] ${
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
