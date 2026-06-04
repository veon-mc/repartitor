<script>
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import { useRoleStore } from '@/stores/RoleStore'

export default {
  name: 'HomeView',

  computed: {
    ...mapStores(useAuthStore, useRoleStore),
  },
}
</script>

<template>
  <section class="space-y-8">
    <!-- En-tête de bienvenue -->
    <div class="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-lg p-8 shadow">
      <h1 class="text-4xl font-bold mb-3">Bienvenue sur Repartitor</h1>
      <p class="text-slate-200 text-lg">
        L'outil de gestion des textes pour le service de traduction.
      </p>
      <p class="text-slate-300 mt-4 max-w-2xl">
        Repartitor permet au répartiteur d'attribuer les textes aux traducteurs et
        éditeurs, et à chacun de suivre l'avancement de son travail dans le respect
        des délais.
      </p>
    </div>

    <!-- Accès rapide pour utilisateurs connectés -->
    <div v-if="authStore.isAuthenticated" class="bg-amber-50 border border-amber-200 rounded p-5">
      <h2 class="text-lg font-semibold text-slate-800 mb-3">
        Bonjour {{ authStore.displayName }}
      </h2>
      <p class="text-slate-700 mb-3">
        Tu es actuellement
        <strong>{{ roleStore.roleLabel.toLowerCase() }}</strong>
        <span v-if="roleStore.person">
          ({{ roleStore.person.firstname }} {{ roleStore.person.lastname }} —
          <span class="font-mono">{{ roleStore.person.id }}</span>)
        </span>.
      </p>
      <div class="flex flex-wrap gap-2">
        <RouterLink
          :to="{ name: 'roles' }"
          class="bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          Changer de rôle
        </RouterLink>
        <RouterLink
          :to="{ name: 'texts' }"
          class="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          Gérer les textes
        </RouterLink>
        <RouterLink
          :to="{ name: 'stats' }"
          class="bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
        >
          Voir les statistiques
        </RouterLink>
      </div>
    </div>

    <!-- Message pour utilisateurs non connectés -->
    <div v-else class="bg-slate-100 border border-slate-200 rounded p-5">
      <p class="text-slate-700">
        Pour accéder à l'application, connecte-toi via le bouton
        <strong>« Connexion avec Google »</strong> en haut à droite.
      </p>
    </div>

    <!-- Présentation rapide des rôles -->
    <div>
      <h2 class="text-2xl font-bold text-slate-800 mb-4">Les rôles</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded p-5">
          <h3 class="font-semibold text-slate-800 mb-2">Répartiteur</h3>
          <p class="text-sm text-slate-600">
            Voit tous les textes du service, les attribue aux traducteurs et éditeurs,
            et consulte les statistiques de productivité globales et individuelles.
          </p>
        </div>
        <div class="bg-white border border-slate-200 rounded p-5">
          <h3 class="font-semibold text-slate-800 mb-2">Traducteur</h3>
          <p class="text-sm text-slate-600">
            Voit uniquement les textes qui lui sont attribués, et marque comme terminée
            chaque traduction au fur et à mesure.
          </p>
        </div>
        <div class="bg-white border border-slate-200 rounded p-5">
          <h3 class="font-semibold text-slate-800 mb-2">Éditeur</h3>
          <p class="text-sm text-slate-600">
            Traite les textes une fois leur traduction terminée pour la mise en page
            finale, et valide la fin de chaque édition.
          </p>
        </div>
      </div>
    </div>

    <!-- Notes du développeur -->
    <div class="bg-white border border-slate-200 rounded p-5 space-y-4">
      <h2 class="text-2xl font-bold text-slate-800">Notes du développeur</h2>

      <!-- Technologies -->
      <div>
        <h3 class="font-semibold text-slate-700 mb-2">🛠️ Technologies utilisées</h3>
        <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li><strong>Vue 3</strong> (Options API) — framework principal</li>
          <li><strong>Vue Router</strong> — routing avec nested routes et gardes</li>
          <li><strong>Pinia</strong> — gestion d'état (authentification, rôle courant)</li>
          <li><strong>Supabase</strong> — backend (PostgreSQL + Auth OAuth + RLS)</li>
          <li><strong>Tailwind CSS v4</strong> — styling avec @tailwindcss/vite</li>
          <li><strong>Vite</strong> — bundler de développement</li>
        </ul>
      </div>

      <!-- Fonctionnalités avancées -->
      <div>
        <h3 class="font-semibold text-slate-700 mb-2">Fonctionnalités au-delà de l'énoncé</h3>
        <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>
            Persistance du rôle courant dans <code class="bg-slate-100 px-1 rounded">localStorage</code>
            pour survivre aux rechargements.
          </li>
          <li>
            Raccourcis temporels dans le sélecteur d'intervalle des stats
            (7j / 30j / année en cours).
          </li>
          <li>
            Contrôle d'accès strict sur les stats individuelles
            (un traducteur ne peut pas voir les stats d'un autre, même via URL directe).
          </li>
          <li>
            Indicateur de productivité (% d'atteinte de l'objectif) pour les traducteurs
            avec couleur dynamique.
          </li>
        </ul>
      </div>

      <!-- Bugs connus / limitations -->
      <div>
        <h3 class="font-semibold text-slate-700 mb-2">Limitations connues</h3>
        <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>
            Une fois attribué, un texte ne peut plus être ré-attribué (section
            9.3 de l'énoncé, qui décrit cela comme une amélioration possible mais
            non requise).
          </li>
          <li>
            La deadline d'une édition est implicitement celle du texte ; il n'y a
            pas de deadline propre à l'édition dans le schéma de base.
          </li>
        </ul>
      </div>

      <!-- Auteur -->
      <div class="pt-3 border-t border-slate-100">
        <h3 class="font-semibold text-slate-700 mb-1">Auteur</h3>
        <p class="text-sm text-slate-600">
          Lepomme Michael — matricule 64889<br />
          Projet 4WEB3 — Développement WEB 3 — HE2B ESI — 2025/2026
        </p>
      </div>
    </div>
  </section>
</template>
