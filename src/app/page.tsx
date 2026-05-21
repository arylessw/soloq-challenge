import { Leaderboard } from "@/components/Leaderboard";

export default function HomePage() {
  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="font-display text-4xl text-gold mb-2">
          Classement SoloQ
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          Classement par tier (pas de division), puis progression dans le même
          tier. EUW uniquement.
        </p>
      </header>
      <Leaderboard />
    </div>
  );
}
