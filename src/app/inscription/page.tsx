import { RegisterForm } from "@/components/RegisterForm";

export default function InscriptionPage() {
  return (
    <div>
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl text-gold mb-2">S&apos;inscrire</h1>
        <p className="text-muted text-sm">
          Choisis ton équipe (équilibrage automatique) et ton rang de départ.
        </p>
      </header>
      <RegisterForm />
    </div>
  );
}
