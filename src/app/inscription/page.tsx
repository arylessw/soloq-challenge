import { InscriptionTypeTabs } from "@/components/InscriptionTypeTabs";
import { PageHero } from "@/components/PageHero";
import { RegisterForm } from "@/components/RegisterForm";

export default function InscriptionPage() {
  return (
    <div>
      <PageHero
        eyebrow="Rejoindre le défi"
        title="S'inscrire au défi"
        description="Ajoute ton Riot ID EUW au classement. Pour une photo de profil, crée d'abord un compte site."
      />
      <InscriptionTypeTabs />
      <RegisterForm />
    </div>
  );
}
