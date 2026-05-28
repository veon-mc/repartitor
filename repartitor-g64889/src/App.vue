<script>
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/AuthStore'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'App',
  components: { AppHeader, AppFooter },
  computed: {
    ...mapStores(useAuthStore),
  },
  created() {
    // initialise le store une seule fois au démarrage
    this.authStore.init()
  },
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <AppHeader />

    <main class="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
      <!-- Petit indicateur de chargement tant que la session n'est pas vérifiée -->
      <div v-if="authStore.isLoading" class="text-center text-slate-400 py-12">
        Chargement…
      </div>
      <RouterView v-else />
    </main>

    <AppFooter />
  </div>
</template>
