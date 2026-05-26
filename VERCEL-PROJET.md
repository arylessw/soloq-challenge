# Projet Vercel — `soloq-challenge-kappa`

**URL de production :** [https://soloq-challenge-kappa.vercel.app](https://soloq-challenge-kappa.vercel.app)

**Repo GitHub :** `arylessw/soloq-challenge`

## Variables d’environnement (Vercel)

| Variable | Exemple |
|----------|---------|
| `DATABASE_URL` | Connection string Neon |
| `RIOT_API_KEY` | Clé Riot |
| `ADMIN_SECRET` | Mot de passe `/admin` |
| `SESSION_SECRET` | Cookies compte |
| `NEXT_PUBLIC_SITE_URL` | `https://soloq-challenge-kappa.vercel.app` |

Sans slash final. Utilisée pour Open Graph et partages au build ; en navigation le site utilise aussi l’URL courante du navigateur.

## Déploiement

1. Le projet Vercel **`soloq-challenge-kappa`** doit être lié au repo **`arylessw/soloq-challenge`** (branche `main`).
2. Chaque `git push` sur `main` redéploie ce site (via `push-deploy.cmd` ou GitHub).
3. Vérifie : [https://soloq-challenge-kappa.vercel.app/compte/inscription](https://soloq-challenge-kappa.vercel.app/compte/inscription)

## Autre projet Vercel sur le même repo ?

Si un **second** projet Vercel (ex. `l-rust-omega` ou `soloq-challenge`) est aussi connecté au même repo, déconnecte-le dans **Settings → Git → Disconnect** pour éviter les déploiements sur la mauvaise URL.
