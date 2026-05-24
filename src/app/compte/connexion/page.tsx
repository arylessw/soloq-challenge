import { LoginForm } from "@/components/LoginForm";
import { PageHero } from "@/components/PageHero";

export default function ConnexionPage() {
  return (
    <div>
      <PageHero
        eyebrow="Compte site"
        title="Connexion"
        description="Accède à ton profil et relie tes comptes LoL."
      />
      <LoginForm />
    </div>
  );
}
