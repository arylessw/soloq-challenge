"use client";

import { usePathname } from "next/navigation";
import { CompteAuthTabs } from "@/components/CompteAuthTabs";

export function CompteLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAuthTabs =
    pathname === "/compte/inscription" || pathname === "/compte/connexion";

  return (
    <div>
      {showAuthTabs && <CompteAuthTabs />}
      {children}
    </div>
  );
}
