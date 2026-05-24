import { PageHero } from "@/components/PageHero";
import { RegisterForm } from "@/components/RegisterForm";

export default function InscriptionPage() {
  return (
    <div>
      <PageHero
        eyebrow="Rejoindre le défi"
        title="S'inscrire"
        description="Ton Riot ID EUW — récupère ton rang SoloQ actuel depuis Riot pour le défi."
      />
      <RegisterForm />
    </div>
  );
}
