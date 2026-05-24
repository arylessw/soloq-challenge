import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/10 mt-16 py-8">
      <div className="page-shell !py-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <p>
          SoloQ Challenge n&apos;est pas affilié à Riot Games.{" "}
          <span className="text-muted/60">
            League of Legends and Riot Games are trademarks of Riot Games, Inc.
          </span>
        </p>
        <nav className="flex gap-4 shrink-0">
          <Link href="/terms" className="hover:text-gold-light transition">
            Conditions
          </Link>
          <Link href="/privacy" className="hover:text-gold-light transition">
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
