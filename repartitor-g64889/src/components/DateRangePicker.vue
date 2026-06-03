<script>
/**
 * Sélecteur d'intervalle de dates avec bouton "Appliquer".
 *
 * Props :
 *  - modelValue : { from: string ISO, to: string ISO }
 *
 * Emits :
 *  - apply : émet { from, to } quand l'utilisateur clique sur Appliquer
 *
 * Note : on n'utilise pas v-model car on ne veut PAS mettre à jour le parent
 * à chaque changement de date — uniquement quand on clique sur Appliquer.
 */
export default {
  name: 'DateRangePicker',

  props: {
    initialFrom: {
      type: String,
      required: true,
    },
    initialTo: {
      type: String,
      required: true,
    },
  },

  emits: ['apply'],

  data() {
    return {
      // les dates en cours d'édition (format YYYY-MM-DD pour <input type="date">)
      localFrom: this.toInputDate(this.initialFrom),
      localTo: this.toInputDate(this.initialTo),
    }
  },

  computed: {
    /**
     * Vrai si les dates locales diffèrent des dates appliquées (props).
     */
    hasChanges() {
      return (
        this.localFrom !== this.toInputDate(this.initialFrom) ||
        this.localTo !== this.toInputDate(this.initialTo)
      )
    },

    isValid() {
      return this.localFrom && this.localTo && this.localFrom <= this.localTo
    },
  },

  methods: {
    /**
     * Convertit une date ISO complète en format YYYY-MM-DD.
     */
    toInputDate(iso) {
      if (!iso) return ''
      return iso.substring(0, 10)
    },

    apply() {
      if (!this.isValid) return
      this.$emit('apply', {
        // début de journée pour 'from'
        from: new Date(this.localFrom + 'T00:00:00').toISOString(),
        // fin de journée pour 'to'
        to: new Date(this.localTo + 'T23:59:59').toISOString(),
      })
    },

    /**
     * Quelques raccourcis pratiques (dernière semaine, dernier mois...)
     */
    setLastWeek() {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 7)
      this.localFrom = this.toInputDate(from.toISOString())
      this.localTo = this.toInputDate(to.toISOString())
    },

    setLastMonth() {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 1)
      this.localFrom = this.toInputDate(from.toISOString())
      this.localTo = this.toInputDate(to.toISOString())
    },

    setCurrentYear() {
      const now = new Date()
      const from = new Date(now.getFullYear(), 0, 1)
      const to = new Date(now.getFullYear(), 11, 31)
      this.localFrom = this.toInputDate(from.toISOString())
      this.localTo = this.toInputDate(to.toISOString())
    },
  },
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded p-4 space-y-3">
    <div class="flex items-end gap-3 flex-wrap">
      <div>
        <label class="block text-xs text-slate-500 mb-1">Du</label>
        <input
          v-model="localFrom"
          type="date"
          class="px-3 py-2 border border-slate-300 rounded text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-slate-500 mb-1">Au</label>
        <input
          v-model="localTo"
          type="date"
          class="px-3 py-2 border border-slate-300 rounded text-sm"
        />
      </div>

      <button
        @click="apply"
        :disabled="!isValid || !hasChanges"
        class="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-900 font-semibold px-4 py-2 rounded transition-colors"
      >
        Appliquer
      </button>
    </div>

    <!-- Raccourcis -->
    <div class="flex gap-2 flex-wrap text-xs">
      <span class="text-slate-500 self-center">Raccourcis :</span>
      <button
        @click="setLastWeek"
        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
      >
        7 derniers jours
      </button>
      <button
        @click="setLastMonth"
        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
      >
        30 derniers jours
      </button>
      <button
        @click="setCurrentYear"
        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
      >
        Année en cours
      </button>
    </div>

    <p v-if="!isValid" class="text-xs text-red-600">
      ⚠️ La date de fin doit être postérieure à la date de début.
    </p>
  </div>
</template>