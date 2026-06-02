<script>
export default {
  name: 'TextStatusBadge',

  props: {
    /**
     * L'objet translation ou edition (ou null si non attribué).
     */
    attribution: {
      type: Object,
      default: null,
    },
    /**
     * Label pour l'état "non attribué"
     */
    notAttributedLabel: {
      type: String,
      default: 'Non attribué',
    },
  },

  computed: {
    /**
     * Détermine le statut : 'none' / 'inProgress' / 'done'
     */
    status() {
      if (!this.attribution) return 'none'
      if (this.attribution.finished) return 'done'
      return 'inProgress'
    },

    /**
     * Classes Tailwind selon le statut
     */
    badgeClasses() {
      const base = 'inline-block px-2 py-1 text-xs font-semibold rounded'
      switch (this.status) {
        case 'done':
          return `${base} bg-green-100 text-green-800`
        case 'inProgress':
          return `${base} bg-amber-100 text-amber-800`
        case 'none':
        default:
          return `${base} bg-slate-100 text-slate-500`
      }
    },

    label() {
      switch (this.status) {
        case 'done': return 'Terminé'
        case 'inProgress': return 'En cours'
        case 'none':
        default: return this.notAttributedLabel
      }
    },
  },
}
</script>

<template>
  <span :class="badgeClasses">{{ label }}</span>
</template>