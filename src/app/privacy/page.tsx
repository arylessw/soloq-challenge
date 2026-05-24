import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Politique de confidentialité — SoloQ Challenge",
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHero
        title="Politique de confidentialité"
        description="Comment nous traitons les données du défi SoloQ."
      />
      <article className="card-glow relative z-[1] prose-legal space-y-6 text-sm text-white/85 leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Données collectées
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-muted">
            <li>Riot ID (pseudo et tagline)</li>
            <li>Rang, LP, victoires/défaites et historique de matchs ranked solo</li>
            <li>Statistiques dérivées (KDA, streak, champions joués)</li>
            <li>Horodatages de synchronisation</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Données non collectées
          </h2>
          <p>
            Nous ne collectons pas de mot de passe Riot, d&apos;adresse e-mail,
            de données de paiement, ni d&apos;informations via Riot Sign-On
            (RSO).
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Utilisation
          </h2>
          <p>
            Les données servent uniquement à afficher les classements et
            profils du défi entre amis. Elles ne sont ni vendues ni partagées
            à des tiers à des fins commerciales.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Stockage
          </h2>
          <p>
            Les données sont stockées dans une base PostgreSQL hébergée (Neon).
            La clé API Riot est stockée côté serveur uniquement et n&apos;est
            jamais exposée au navigateur.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Suppression
          </h2>
          <p>
            Un joueur peut demander la suppression de son profil à
            l&apos;administrateur du défi. La suppression efface les données
            associées en base.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            Cookies
          </h2>
          <p>
            Le site n&apos;utilise pas de cookies publicitaires. Seul le
            panneau admin stocke un secret en sessionStorage dans le
            navigateur de l&apos;administrateur.
          </p>
        </section>
        <p className="text-muted text-xs pt-4 border-t border-white/10">
          Dernière mise à jour : mai 2025 ·{" "}
          <Link href="/terms" className="text-gold-light hover:underline">
            Conditions d&apos;utilisation
          </Link>
        </p>
      </article>
    </div>
  );
}
