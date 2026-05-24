import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — SoloQ Challenge",
};

export default function TermsPage() {
  return (
    <div>
      <PageHero
        title="Conditions d'utilisation"
        description="SoloQ Challenge — outil non officiel pour un défi entre amis."
      />
      <article className="card-glow relative z-[1] prose-legal space-y-6 text-sm text-white/85 leading-relaxed">
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            1. Nature du service
          </h2>
          <p>
            SoloQ Challenge est un site web gratuit et non commercial permettant
            à un petit groupe de joueurs de suivre leur progression en ranked
            solo/duo sur League of Legends (EUW). Ce service n&apos;est pas
            affilié, approuvé ou sponsorisé par Riot Games, Inc.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            2. Données Riot
          </h2>
          <p>
            Les statistiques affichées proviennent de l&apos;API publique Riot
            Games. SoloQ Challenge n&apos;est pas endossé par Riot Games. Les
            données peuvent être inexactes ou indisponibles en cas de
            maintenance ou de limite d&apos;API.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            3. Inscription
          </h2>
          <p>
            L&apos;inscription se fait volontairement avec un Riot ID (pseudo +
            tag). Nous ne demandons jamais votre mot de passe Riot. Vous pouvez
            demander la suppression de vos données via l&apos;administrateur du
            défi.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            4. Utilisation acceptable
          </h2>
          <p>
            Le site est destiné à un usage personnel entre amis. Toute
            utilisation abusive (scraping intensif, tentative d&apos;accès non
            autorisé, revente de données) est interdite.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg text-gold-light mb-2">
            5. Limitation de responsabilité
          </h2>
          <p>
            Le service est fourni « en l&apos;état », sans garantie. Les
            administrateurs ne sont pas responsables des interruptions,
            erreurs de données ou décisions prises sur la base des
            classements affichés.
          </p>
        </section>
        <p className="text-muted text-xs pt-4 border-t border-white/10">
          Dernière mise à jour : mai 2025 ·{" "}
          <Link href="/privacy" className="text-gold-light hover:underline">
            Politique de confidentialité
          </Link>
        </p>
      </article>
    </div>
  );
}
