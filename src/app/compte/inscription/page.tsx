import { InscriptionTypeTabs } from "@/components/InscriptionTypeTabs";
import { RegisterAccountForm } from "@/components/RegisterAccountForm";
import { PageHero } from "@/components/PageHero";

export default function CompteInscriptionPage() {
  return (
    <div>
      <PageHero
        eyebrow="Compte site"
        title="Créer un compte"
        description="E-mail, mot de passe et pseudo — puis relie un ou plusieurs Riot ID."
      />
      <InscriptionTypeTabs />
      <RegisterAccountForm />
    </div>
  );
}
