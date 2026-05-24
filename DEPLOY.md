# Déployer sur Vercel + Neon (gratuit)

Guide pas à pas pour mettre le SoloQ Challenge en ligne.

## 1. Base de données Neon

1. Crée un compte sur [neon.tech](https://neon.tech) (gratuit).
2. **New Project** → nomme-le (ex. `soloq-challenge`).
3. Sur le dashboard, onglet **Connection details** :
   - Copie une **Connection string** (Pooled ou Direct) → ce sera `DATABASE_URL`

## 2. GitHub (si pas déjà fait)

1. Crée un repo sur [github.com](https://github.com).
2. Dans le dossier du projet :

```bash
git init
git add .
git commit -m "SoloQ Challenge EUW"
git branch -M main
git remote add origin https://github.com/TON_USER/TON_REPO.git
git push -u origin main
```

## 3. Vercel

1. Compte sur [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Importe ton repo GitHub.
3. **Environment Variables** (avant Deploy) :

| Nom | Valeur |
|-----|--------|
| `RIOT_API_KEY` | Ta clé depuis [developer.riotgames.com](https://developer.riotgames.com/) |
| `DATABASE_URL` | Connection string Neon (PostgreSQL) |
| `ADMIN_SECRET` | Mot de passe secret pour `/admin` (supprimer un joueur). Génère une chaîne longue aléatoire — **ne la partage pas**. |

Pages légales (utile pour la clé Riot prod) :
- `/terms` — conditions d'utilisation
- `/privacy` — politique de confidentialité

4. **Deploy** — le build lance `prisma migrate deploy` puis Next.js.

5. Ton site sera sur `https://ton-projet.vercel.app`.

## Admin (toi seul)

- URL : `https://ton-projet.vercel.app/admin` (non linkée dans le menu).
- Entre le même `ADMIN_SECRET` que sur Vercel.
- Le secret est stocké en session dans ton navigateur (sessionStorage) le temps de la session.

## 4. Clé API Riot en production

- La clé **Development** expire après **24 h** → pas idéal pour un site public.
- Sur le portail Riot : demande une **Production API Key** (formulaire produit / usage perso entre amis).
- En attendant, regénère la clé dev et mets-la à jour dans Vercel → **Settings** → **Environment Variables**.

## 5. Développement local avec Neon

Dans ton `.env` local, mets les mêmes 2 variables (Neon + Riot) :

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Tu peux utiliser la même base Neon qu’en prod (pour tester) ou un second projet Neon « dev ».

## 6. Mises à jour

À chaque `git push` sur `main`, Vercel redéploie automatiquement.

## Dépannage

| Problème | Solution |
|----------|----------|
| Build échoue sur Prisma | Vérifie `DATABASE_URL` sur Vercel (commence par `postgresql://`) |
| 401 Riot en prod | Clé expirée → regénère / demande clé production |
| Base vide après deploy | Normal — réinscris les joueurs sur `/inscription` |

## Limites gratuites

- **Vercel** : largement suffisant pour un petit site entre amis.
- **Neon** : quota gratuit généreux pour ce usage.
- **Riot API** : respecte les rate limits (auto-refresh 3 min = OK pour quelques joueurs).
