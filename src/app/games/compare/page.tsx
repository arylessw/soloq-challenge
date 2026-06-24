import type { Metadata } from "next";
import Link from "next/link";
import { CompareChampionsRoles } from "@/components/CompareChampionsRoles";
import { CompareMetricsGrid } from "@/components/CompareMetricsGrid";
import { ComparePlayerPicker } from "@/components/ComparePlayerPicker";
import { CompareVsBanner } from "@/components/CompareVsBanner";
import { DualLpChart } from "@/components/DualLpChart";
import { PageHero } from "@/components/PageHero";
import { accentFor, buildComparison } from "@/lib/compare";
import { getLpHistory } from "@/lib/lp-snapshots";
import { playerListName } from "@/lib/player-display";
import { listPlayers } from "@/lib/players";

export const metadata: Metadata = {
  title: "Comparaison — SoloQ Challenge",
  description: "Compare deux joueurs du défi SoloQ tête-à-tête : rang, progression, winrate, KDA et plus.",
};

type Props = {
  searchParams: Promise<{ p1?: string; p2?: string }>;
};

export default async function ComparePage({ searchParams }: Props) {
  const { p1, p2 } = await searchParams;
  const players = await listPlayers();

  const options = players.map((p) => ({
    id: p.id,
    label: `${playerListName(p)} (${p.riotId})`,
  }));

  const a = p1 ? (players.find((p) => p.id === p1) ?? null) : null;
  const b = p2 ? (players.find((p) => p.id === p2) ?? null) : null;

  const [aHist, bHist] = await Promise.all([
    a ? getLpHistory(a.id) : Promise.resolve([]),
    b ? getLpHistory(b.id) : Promise.resolve([]),
  ]);

  const comparison = a && b ? buildComparison(a, b) : null;

  return (
    <div>
      <Link
        href="/games"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-gold-light transition mb-6"
      >
        <span aria-hidden>←</span> Retour aux profils
      </Link>

      <PageHero
        eyebrow="Face-à-face"
        title="Comparaison"
        description="Confronte deux joueurs du défi, métrique par métrique."
      />

      <ComparePlayerPicker
        players={options}
        p1={p1 ?? null}
        p2={p2 ?? null}
      />

      {a && b && comparison ? (
        <>
          <CompareVsBanner
            a={a}
            b={b}
            aWins={comparison.aWins}
            bWins={comparison.bWins}
          />

          <div className="mb-8 board-stagger-2">
            <DualLpChart
              a={{ points: aHist, accent: accentFor(a), name: playerListName(a) }}
              b={{ points: bHist, accent: accentFor(b), name: playerListName(b) }}
            />
          </div>

          <CompareMetricsGrid
            metrics={comparison.metrics}
            accentA={accentFor(a)}
            accentB={accentFor(b)}
          />

          <CompareChampionsRoles a={a} b={b} />
        </>
      ) : (
        <div className="card-glow relative z-[1] py-12 text-center">
          <p className="relative z-[1] text-muted">
            {players.length < 2
              ? "Il faut au moins deux joueurs inscrits pour comparer."
              : "Choisis deux joueurs ci-dessus pour lancer le face-à-face."}
          </p>
        </div>
      )}
    </div>
  );
}
