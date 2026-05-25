import { DuelsBoard } from "@/components/DuelsBoard";
import { PageHero } from "@/components/PageHero";

export default function DuelsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Défi entre amis"
        title="Duels 1v1"
        description="Affronte un ami sur une semaine (ou plus) — qui grind le plus remporte le duel."
      />
      <DuelsBoard />
    </div>
  );
}
