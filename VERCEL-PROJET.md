# Corriger le déploiement : `l-rust-omega` → `soloq-challenge`

Ton code GitHub est **`arylessw/soloq-challenge`**.  
Si chaque push met à jour [l-rust-omega.vercel.app](https://l-rust-omega.vercel.app) au lieu de [soloq-challenge.vercel.app](https://soloq-challenge.vercel.app), c’est que **le mauvais projet Vercel** est connecté au repo.

## Étape 1 — Débrancher le mauvais projet

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard).
2. Ouvre le projet **`l-rust-omega`** (ou le nom qui donne l’URL `l-rust-omega.vercel.app`).
3. **Settings** → **Git**.
4. Clique **Disconnect** (déconnecter le dépôt GitHub).

→ Les prochains push ne mettront plus à jour ce site.

## Étape 2 — Brancher le bon projet

### Si tu as déjà un projet `soloq-challenge` sur Vercel

1. Ouvre le projet **`soloq-challenge`** (domaine `soloq-challenge.vercel.app`).
2. **Settings** → **Git** → **Connect Git Repository**.
3. Choisis **`arylessw/soloq-challenge`**, branche **`main`**.
4. **Settings** → **Environment Variables** — copie tout depuis `l-rust-omega` si besoin :
   - `DATABASE_URL`
   - `RIOT_API_KEY`
   - `SESSION_SECRET`
   - `ADMIN_SECRET`
   - `NEXT_PUBLIC_SITE_URL` = `https://soloq-challenge.vercel.app`
5. **Deployments** → **Redeploy** (ou refais un push avec `push-deploy.cmd`).

### Si tu n’as pas de projet `soloq-challenge`

1. **Add New** → **Project**.
2. Import **`arylessw/soloq-challenge`**.
3. Nom du projet : **`soloq-challenge`** (pour avoir l’URL `soloq-challenge.vercel.app`).
4. Ajoute les variables d’environnement (liste ci-dessus).
5. **Deploy**.

## Étape 3 — Vérifier

- [https://soloq-challenge.vercel.app/compte/inscription](https://soloq-challenge.vercel.app/compte/inscription) doit s’afficher (pas 404).
- [https://l-rust-omega.vercel.app](https://l-rust-omega.vercel.app) ne doit **plus** changer après un push (sauf si tu le reconnectes par erreur).

## Optionnel — Supprimer l’ancien projet

Quand tout fonctionne sur `soloq-challenge` :

- Projet **`l-rust-omega`** → **Settings** → tout en bas **Delete Project**.

## Rappel

Le fichier `push-deploy.cmd` envoie uniquement vers **GitHub**.  
C’est **Vercel** qui choisit quel site se met à jour selon la liaison Git du projet.
