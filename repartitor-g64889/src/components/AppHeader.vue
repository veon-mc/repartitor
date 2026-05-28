<script>
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import { useRoleStore } from '@/stores/RoleStore'

export default {
  name: 'AppHeader',
  computed: {
    ...mapStores(useAuthStore),
    ...mapStores(useAuthStore, useRoleStore),
  },
  methods: {
    handleLogin() {
      this.authStore.loginWithGoogle()
    },
    async handleLogout() {
      await this.authStore.logout()
      // retour à la page d'accueil après déconnexion (exigé par l'énoncé)
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' })
      }
    },
  },
}
</script>

<template>
  <header class="bg-slate-800 text-white">
    <!-- Titre du site -->
    <div class="px-6 py-4 border-b border-slate-700">
      <h1 class="text-3xl font-bold tracking-wider text-center">
        REPARTITOR
      </h1>
    </div>

    <!-- Menu + zone connexion -->
    <nav class="px-6 py-3 flex items-center justify-between flex-wrap gap-4">
      <ul class="flex gap-6">
        <li>
          <RouterLink :to="{ name: 'home' }" class="hover:text-amber-300 transition-colors"
            active-class="text-amber-300 font-semibold">
            Accueil
          </RouterLink>
        </li>
        <!-- Les liens protégés ne s'affichent QUE si l'utilisateur est connecté -->
        <template v-if="authStore.isAuthenticated">
          <li>
            <RouterLink :to="{ name: 'roles' }" class="hover:text-amber-300 transition-colors"
              active-class="text-amber-300 font-semibold">
              Changer de rôle
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'texts' }" class="hover:text-amber-300 transition-colors"
              active-class="text-amber-300 font-semibold">
              Gérer les textes
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'stats' }" class="hover:text-amber-300 transition-colors"
              active-class="text-amber-300 font-semibold">
              Statistiques
            </RouterLink>
          </li>
        </template>
      </ul>

      <!-- Zone connexion / déconnexion -->
      <div class="flex items-center gap-3">
        <!-- Si pas connecté : bouton Login -->
        <button v-if="!authStore.isAuthenticated" @click="handleLogin"
          class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded transition-colors">
          Connexion avec Google
        </button>

        <!-- Si connecté : email + bouton Logout -->
        <template v-else>
          <div class="text-sm text-slate-300 text-right">
            <div>
              Connecté en tant que
              <strong class="text-white">{{ authStore.displayName }}</strong>
            </div>
            <div>
              Rôle :
              <strong class="text-amber-300">{{ roleStore.roleLabel }}</strong>
              <span v-if="roleStore.person" class="text-slate-200">
                — {{ roleStore.person.firstname }} {{ roleStore.person.lastname }}
                ({{ roleStore.person.id }})
              </span>
            </div>
          </div>
          <button @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition-colors">
            Déconnexion
          </button>
        </template>
      </div>
    </nav>
  </header>
</template>
