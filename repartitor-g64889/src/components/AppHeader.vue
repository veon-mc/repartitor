<script>
export default {
  name: 'AppHeader',
  methods: {
    handleLogin() {
      // TODO : implémenter la connexion Google via Supabase (étape suivante)
      console.log('Connexion Google — à implémenter')
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

    <!-- Menu + bouton connexion -->
    <nav class="px-6 py-3 flex items-center justify-between">
      <ul class="flex gap-6">
        <li>
          <RouterLink
            :to="{ name: 'home' }"
            class="hover:text-amber-300 transition-colors"
            active-class="text-amber-300 font-semibold"
          >
            Accueil
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{ name: 'roles' }"
            class="hover:text-amber-300 transition-colors"
            active-class="text-amber-300 font-semibold"
          >
            Changer de rôle
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{ name: 'texts' }"
            class="hover:text-amber-300 transition-colors"
            active-class="text-amber-300 font-semibold"
          >
            Gérer les textes
          </RouterLink>
        </li>
        <li>
          <RouterLink
            :to="{ name: 'stats' }"
            class="hover:text-amber-300 transition-colors"
            active-class="text-amber-300 font-semibold"
          >
            Statistiques
          </RouterLink>
        </li>
      </ul>

      <button
        @click="handleLogin"
        class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-4 py-2 rounded transition-colors"
      >
        Connexion avec Google
      </button>
    </nav>
  </header>
</template>
