import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state() {
    return {
      // user vaut null tant qu'on n'est pas connecté
      // sinon contient l'objet user de Supabase (id, email, user_metadata, etc.)
      user: null,
      // true tant qu'on n'a pas encore vérifié la session existante
      isLoading: true,
    }
  },

  getters: {
    // raccourci pratique pour les composants
    isAuthenticated: (state) => state.user !== null,
    // pour afficher l'identité dans le header (email ou nom)
    displayName: (state) => state.user?.email ?? '',
  },

  actions: {
    /**
     * À appeler une seule fois au démarrage de l'app (dans App.vue).
     * - Récupère la session existante (au cas où l'utilisateur est déjà connecté
     *   depuis une visite précédente).
     * - S'abonne aux changements d'état d'authentification (login, logout,
     *   refresh de token...) pour mettre à jour `user` automatiquement.
     */
    async init() {
      // 1. Récupérer la session existante
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Erreur lors de la récupération de la session :', error)
      } else {
        this.user = data.session?.user ?? null
      }
      this.isLoading = false

      // 2. S'abonner aux changements futurs
      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user ?? null
      })
    },

    /**
     * Lance la connexion avec Google via OAuth.
     * Supabase redirige vers Google, qui redirige vers Supabase,
     * qui redirige enfin vers notre app (où `onAuthStateChange` se déclenche).
     */
    async loginWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // redirige vers la page courante après login
          redirectTo: window.location.origin,
        },
      })
      if (error) {
        console.error('Erreur de connexion Google :', error)
        alert('Impossible de se connecter avec Google. Réessaie.')
      }
    },

    /**
     * Déconnexion. Vide le user et redirige vers l'accueil.
     */
    async logout() {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Erreur lors de la déconnexion :', error)
      }
      // user sera mis à null automatiquement par onAuthStateChange
      // la redirection vers l'accueil se fera depuis le composant qui appelle logout()
    },
  },
})
