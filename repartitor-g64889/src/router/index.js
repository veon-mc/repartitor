import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RolesView from '@/views/RolesView.vue'
import TextsView from '@/views/TextsView.vue'
import StatsView from '@/views/StatsView.vue'
import TextsRepartitionView from '@/views/texts/TextsRepartitionView.vue'
import TextsTraductionView from '@/views/texts/TextsTraductionView.vue'
import TextsEditionView from '@/views/texts/TextsEditionView.vue'
import { useAuthStore } from '@/stores/AuthStore'
import { useRoleStore, ROLES } from '@/stores/RoleStore'
import TextAttributionView from '@/views/texts/TextAttributionView.vue'

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
      // Redirection automatique vers la bonne sous-route selon le rôle
      redirect: () => {
        const roleStore = useRoleStore()
        if (roleStore.isTranslator) return { name: 'texts-traduction' }
        if (roleStore.isEditor) return { name: 'texts-edition' }
        return { name: 'texts-repartition' }
      },
      children: [
        {
          path: 'repartition',
          name: 'texts-repartition',
          component: TextsRepartitionView,
          meta: { requiresAuth: true, requiresRole: ROLES.REPARTITOR },
        },
        {
          path: 'traduction',
          name: 'texts-traduction',
          component: TextsTraductionView,
          meta: { requiresAuth: true, requiresRole: ROLES.TRANSLATOR },
        },
        {
          path: 'edition',
          name: 'texts-edition',
          component: TextsEditionView,
          meta: { requiresAuth: true, requiresRole: ROLES.EDITOR },
        },
        {
          path: 'attribute/:id',
          name: 'text-attribution',
          component: TextAttributionView,
          props: true,
          meta: { requiresAuth: true, requiresRole: ROLES.REPARTITOR },
        },
      ],
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

  // Attendre la fin de l'init si nécessaire
  if (authStore.isLoading) {
    await new Promise((resolve) => {
      const check = () => {
        if (!authStore.isLoading) resolve()
        else setTimeout(check, 50)
      }
      check()
    })
  }

  if (!authStore.isAuthenticated) {
    return { name: 'home' }
  }

  // Contrôle du rôle si la route en exige un spécifique
  if (to.meta.requiresRole) {
    const roleStore = useRoleStore()
    if (roleStore.role !== to.meta.requiresRole) {
      // Si on a le mauvais rôle, redirige vers /texts qui fera la bonne redirection
      return { name: 'texts' }
    }
  }

  return true
})

export default router
