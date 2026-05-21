export default function ReglesPage() {
  return (
    <article className="card max-w-2xl mx-auto prose prose-invert">
      <h1 className="font-display text-3xl text-gold mb-6">Règles du défi</h1>

      <section className="space-y-4 text-muted">
        <p>
          Ce site suit un <strong className="text-white">SoloQ Challenge</strong> entre
          amis sur <strong className="text-white">EUW</strong>. Adaptez les règles
          ci-dessous entre vous — cette page est un modèle à personnaliser.
        </p>

        <h2 className="text-lg text-gold-light font-medium pt-4">
          Inscription
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Chaque joueur s&apos;inscrit avec son Riot ID (Pseudo#Tag).</li>
          <li>
            Le <strong className="text-white">rang de départ</strong> est celui que tu
            déclares au moment de l&apos;inscription (tier, division, LP).
          </li>
          <li>
            Le classement se met à jour automatiquement toutes les 3 minutes
            (page ouverte), via l&apos;API Riot.
          </li>
        </ul>

        <h2 className="text-lg text-gold-light font-medium pt-4">
          Classement
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tri par progression depuis le rang de départ.</li>
          <li>Affichage du W/L et winrate en solo/duo sur la saison en cours.</li>
        </ul>

        <h2 className="text-lg text-gold-light font-medium pt-4">
          À définir entre vous
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Date de début / fin du défi</li>
          <li>Objectif (ex. Diamant, ou le plus de divisions gagnées)</li>
          <li>Champions autorisés, duo interdit, etc.</li>
          <li>Sanctions en cas de smurf ou compte secondaire</li>
        </ul>

        <p className="pt-6 text-sm border-t border-gold/20">
          Modifie ce fichier :{" "}
          <code className="text-gold-light">src/app/regles/page.tsx</code>
        </p>
      </section>
    </article>
  );
}
