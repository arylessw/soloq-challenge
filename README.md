# SoloQ Challenge — EUW

Site de classement pour un défi solo queue entre amis. Chaque joueur enregistre son **rang de départ** ; la progression est calculée automatiquement via l'API Riot.

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- Clé API Riot : [developer.riotgames.com](https://developer.riotgames.com/)
- Base PostgreSQL (recommandé : [Neon](https://neon.tech) gratuit)

## Installation locale

```bash
npm install
cp .env.example .env
# Remplis RIOT_API_KEY et DATABASE_URL (Neon)
npx prisma migrate deploy
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Déploiement en ligne (Vercel + Neon)

Guide détaillé : **[DEPLOY.md](./DEPLOY.md)**

## Fonctionnalités

| Route | Description |
|-------|-------------|
| `/` | Classements (LP, rang, WR, KDA, main champ, rôle) + titres auto |
| `/duels` | Duels 1v1 entre joueurs (LP ou victoires sur X jours) |
| `/inscription` | Inscription joueur au défi (Riot ID) |
| `/compte/inscription` | Créer un compte site (e-mail, mot de passe) |
| `/compte/connexion` | Se connecter |
| `/compte` | Profil, photo, comptes LoL reliés |
| `/games` | Historique de parties par joueur |

Installable en **PWA** (Ajouter à l’écran d’accueil sur mobile). Présence **en partie** / **absent depuis X** mise à jour à chaque sync.

## Scripts

```bash
npm run dev          # développement
npm run build        # build production
npm run db:migrate   # appliquer les migrations
npm run db:studio    # interface Prisma
```

## API Riot

- Région compte : `europe` · Plateforme : `euw1`
- Clés de dev : 24 h — clé de production conseillée pour un site public.
