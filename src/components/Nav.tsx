import Link from "next/link";

const links = [
  { href: "/", label: "Classement" },
  { href: "/inscription", label: "S'inscrire" },
];

export function Nav() {
  return (
    <nav className="border-b border-gold/20 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl tracking-wide text-gold">
          SoloQ Challenge
          <span className="ml-2 text-xs font-sans font-normal text-muted">EUW</span>
        </Link>
        <ul className="flex gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-muted transition hover:text-gold-light"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
