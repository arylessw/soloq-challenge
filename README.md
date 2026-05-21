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
| `/` | Classement + auto-refresh toutes les 3 min |
| `/inscription` | Inscription joueur |
| `/regles` | Règles du défi |

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
