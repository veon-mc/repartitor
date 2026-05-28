import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RolesView from '@/views/RolesView.vue'
import TextsView from '@/views/TextsView.vue'
import StatsView from '@/views/StatsView.vue'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      // accessible à tous
    },
    {
      path: '/roles',
      name: 'roles',
      component: RolesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/texts',
      name: 'texts',
      component: TextsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { requiresAuth: true },
    },
  ],
})

/**
 * Garde global : empêche l'accès aux routes protégées si non connecté.
 * Si la session n'est pas encore initialisée, on attend qu'elle le soit.
 */
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const authStore = useAuthStore()

  // Si la session est encore en cours de vérification, attendre
  // (peut arriver si l'utilisateur tape une URL protégée au tout premier chargement)
  if (authStore.isLoading) {
    // petite attente active : on poll toutes les 50ms jusqu'à ce que isLoading passe à false
    await new Promise((resolve) => {
      const check = () => {
        if (!authStore.isLoading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }

  // Si toujours pas authentifié → retour à l'accueil
  if (!authStore.isAuthenticated) {
    return { name: 'home' }
  }

  return true
})

export default router
