<script>
/**
 * Carte affichant une statistique avec :
 *  - un label
 *  - une valeur principale (nombre ou texte)
 *  - une couleur indicative (default, success, warning, danger)
 *  - une description optionnelle en bas
 */
export default {
  name: 'StatCard',

  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    /**
     * 'default' | 'success' | 'warning' | 'danger'
     */
    variant: {
      type: String,
      default: 'default',
      validator: (v) => ['default', 'success', 'warning', 'danger'].includes(v),
    },
    hint: {
      type: String,
      default: '',
    },
  },

  computed: {
    accentClasses() {
      switch (this.variant) {
        case 'success':
          return 'border-l-green-500 text-green-700'
        case 'warning':
          return 'border-l-amber-500 text-amber-700'
        case 'danger':
          return 'border-l-red-500 text-red-700'
        default:
          return 'border-l-slate-500 text-slate-700'
      }
    },
  },
}
</script>

<template>
  <div
    class="bg-white border border-slate-200 border-l-4 rounded p-4"
    :class="accentClasses.split(' ')[0]"
  >
    <p class="text-xs text-slate-500 uppercase tracking-wide">{{ label }}</p>
    <p class="text-3xl font-bold mt-1" :class="accentClasses.split(' ')[1]">
      {{ value }}
    </p>
    <p v-if="hint" class="text-xs text-slate-400 mt-1">{{ hint }}</p>
  </div>
</template>