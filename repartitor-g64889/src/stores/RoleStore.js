import { defineStore } from 'pinia'

/**
 * Les rôles possibles dans le système.
 * On utilise des constantes pour éviter les fautes de frappe.
 */
export const ROLES = Object.freeze({
  REPARTITOR: 'repartitor',
  TRANSLATOR: 'translator',
  EDITOR: 'editor',
})

const STORAGE_KEY = 'repartitor-role'

/**
 * Store qui conserve le rôle courant de l'utilisateur.
 * - role : 'repartitor' | 'translator' | 'editor'
 * - person : null pour le répartiteur, sinon l'objet { id, firstname, lastname }
 *   du traducteur ou éditeur dont on a pris l'identité.
 *
 * L'état est persisté dans le localStorage pour survivre aux rechargements.
 */
export const useRoleStore = defineStore('role', {
  state() {
    return {
      role: ROLES.REPARTITOR, // rôle par défaut d'après l'énoncé
      person: null,
    }
  },

  getters: {
    isRepartitor: (state) => state.role === ROLES.REPARTITOR,
    isTranslator: (state) => state.role === ROLES.TRANSLATOR,
    isEditor: (state) => state.role === ROLES.EDITOR,

    /**
     * Libellé lisible du rôle, utile pour l'affichage dans le header.
     */
    roleLabel: (state) => {
      switch (state.role) {
        case ROLES.REPARTITOR: return 'Répartiteur'
        case ROLES.TRANSLATOR: return 'Traducteur'
        case ROLES.EDITOR: return 'Éditeur'
        default: return ''
      }
    },
  },

  actions: {
    /**
     * Restaure l'état depuis le localStorage au démarrage.
     */
    init() {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.role = parsed.role ?? ROLES.REPARTITOR
          this.person = parsed.person ?? null
        } catch (e) {
          console.warn('Impossible de restaurer le rôle depuis localStorage', e)
        }
      }
    },

    /**
     * Passer en mode répartiteur (rôle par défaut, pas d'identité associée).
     */
    becomeRepartitor() {
      this.role = ROLES.REPARTITOR
      this.person = null
      this._persist()
    },

    /**
     * Prendre l'identité d'un traducteur.
     * @param {Object} translator { id, firstname, lastname, ... }
     */
    becomeTranslator(translator) {
      this.role = ROLES.TRANSLATOR
      this.person = translator
      this._persist()
    },

    /**
     * Prendre l'identité d'un éditeur.
     * @param {Object} editor { id, firstname, lastname }
     */
    becomeEditor(editor) {
      this.role = ROLES.EDITOR
      this.person = editor
      this._persist()
    },

    /**
     * Sauvegarde l'état actuel dans le localStorage.
     * Le _ devant indique une méthode "privée" par convention.
     */
    _persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ role: this.role, person: this.person })
      )
    },
  },
})
