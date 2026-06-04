# Repartitor

Outil de gestion des textes pour un service de traduction.

Projet 4WEB3 — Développement WEB 3 — HE2B ESI — 2025/2026

## Stack

- Vue 3 (Options API)
- Vue Router
- Pinia
- Supabase (Auth Google + PostgreSQL)
- Tailwind CSS 

## Installation

```bash
npm install
```

## Configuration

Crée un fichier `.env` à la racine du projet à partir du modèle :

```bash
cp .env.example .env
```

Puis remplis-le avec tes propres identifiants Supabase :

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxxxxxxxxxxx"
```

## Lancement

```bash
npm run dev
```

Le site est accessible sur [http://localhost:5173](http://localhost:5173).

## Authentification

L'authentification se fait via Google OAuth (provider HE2B). Il faut être
connecté avec un compte de l'organisation HE2B pour accéder aux pages
protégées.

## Structure du projet

src/
├── assets/                 # styles globaux (Tailwind)
├── components/             # composants réutilisables
│   ├── AppHeader.vue       # en-tête avec menu et connexion
│   ├── AppFooter.vue
│   ├── PersonTable.vue     # tableau de personnes (traducteurs / éditeurs)
│   ├── MyTextsTable.vue    # tableau "mes textes" (traducteur / éditeur)
│   ├── TextStatusBadge.vue # badge d'état d'une traduction/édition
│   ├── DateRangePicker.vue # sélecteur d'intervalle pour les stats
│   └── StatCard.vue        # carte affichant une statistique
├── lib/
│   └── supabase.js         # initialisation du client Supabase
├── router/
│   └── index.js            # routes + gardes (auth + rôles)
├── services/
│   ├── translatorService.js
│   ├── editorService.js
│   ├── textService.js
│   └── statsService.js
├── stores/                 # Pinia
│   ├── AuthStore.js
│   └── RoleStore.js
├── views/
│   ├── HomeView.vue
│   ├── RolesView.vue
│   ├── TextsView.vue       # parent (RouterView des sous-routes)
│   ├── texts/
│   │   ├── TextsRepartitionView.vue
│   │   ├── TextsTraductionView.vue
│   │   ├── TextsEditionView.vue
│   │   └── TextAttributionView.vue
│   └── stats/
│       ├── StatsGlobalView.vue
│       ├── StatsTranslatorView.vue
│       └── StatsEditorView.vue
├── App.vue
└── main.js
ressource/                  # scripts SQL pour la base

## 📝 Notes

Les fonctionnalités avancées implémentées au-delà du strict énoncé sont
listées dans la page d'accueil de l'application (section "Notes du développeur").