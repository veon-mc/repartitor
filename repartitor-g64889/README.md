# Repartitor

A web app to manage the workflow of a translation service: distribute texts to translators and editors, track the status of each translation and edit, and monitor team activity through statistics.

<!-- Add a screenshot or GIF of the app here -->
<!-- ![Repartitor screenshot](docs/screenshot.png) -->

## Features

- **Google sign-in** with Supabase Auth
- **Role-based access**: routes are protected by auth and role guards
- **Role management** for translators and editors
- **Text distribution**: assign texts to translators and editors
- **Personal dashboards**: each translator or editor sees their own texts and their status
- **Statistics**: global, per-translator and per-editor stats over a custom date range

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | Vue 3 (Options API), Vue Router    |
| State      | Pinia                              |
| Styling    | Tailwind CSS                       |
| Backend    | Supabase (PostgreSQL + Auth)       |
| Build tool | Vite                               |

## Getting Started

### Prerequisites

- Node.js and npm
- A [Supabase](https://supabase.com) project with the Google auth provider enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Then fill in your Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxxxxxxxxxxx"
```

### 3. Set up the database

Run the SQL scripts from the `ressource/` folder in your Supabase project (SQL Editor).

### 4. Run the app

```bash
npm run dev
```

The app is available at [http://localhost:5173](http://localhost:5173).

> **Note:** sign-in is currently restricted to accounts from the HE2B Google organization.

## Project Structure

```
src/
├── assets/         # Global styles (Tailwind)
├── components/     # Reusable UI components (tables, status badges, stat cards...)
├── lib/            # Supabase client setup
├── router/         # Routes and auth/role guards
├── services/       # Data access layer (texts, translators, editors, stats)
├── stores/         # Pinia stores (auth, roles)
├── views/
│   ├── texts/      # Distribution, translation, editing and assignment views
│   └── stats/      # Global, translator and editor statistics
├── App.vue
└── main.js
ressource/          # SQL scripts for the database
```

## Context

Built as a course project for *Web Development 3* at HE2B ESI (2025–2026).
