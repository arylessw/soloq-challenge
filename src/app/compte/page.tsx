import { AccountDashboard } from "@/components/AccountDashboard";
import { PageHero } from "@/components/PageHero";

export default function ComptePage() {
  return (
    <div>
      <PageHero
        eyebrow="Espace personnel"
        title="Mon compte"
        description="Photo de profil, pseudo, mots de passe et comptes LoL reliés."
      />
      <AccountDashboard />
    </div>
  );
}
