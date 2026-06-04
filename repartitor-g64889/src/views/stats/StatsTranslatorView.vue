<script>
import { mapStores } from 'pinia'
import { useRoleStore } from '@/stores/RoleStore'
import { getTranslatorStats, findStatsById } from '@/services/statsService'
import DateRangePicker from '@/components/DateRangePicker.vue'
import StatCard from '@/components/StatCard.vue'

function defaultRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), 0, 1)
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

export default {
  name: 'StatsTranslatorView',
  components: { DateRangePicker, StatCard },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    const initial = defaultRange()
    return {
      range: initial,
      stats: null,
      isLoading: false,
      errorMessage: '',
    }
  },

  computed: {
    ...mapStores(useRoleStore),

    /**
     * Contrôle d'accès : un traducteur ne voit que ses propres stats.
     * Un éditeur n'a rien à faire ici. Un répartiteur voit tout.
     */
    isAccessDenied() {
      if (this.roleStore.isRepartitor) return false
      if (this.roleStore.isTranslator) {
        return this.roleStore.person?.id !== this.id
      }
      return true // éditeur sur une page de traducteur → refusé
    },

    /**
     * Nombre de jours dans la période (au moins 1).
     */
    periodDays() {
      const from = new Date(this.range.from)
      const to = new Date(this.range.to)
      const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24))
      return Math.max(days, 1)
    },

    /**
     * Productivité moyenne : mots/jour sur la période.
     */
    averageThroughput() {
      if (!this.stats) return 0
      return Math.round(Number(this.stats.total_words) / this.periodDays)
    },

    /**
     * Productivité attendue (donnée dans la table translator) vs réelle.
     * Renvoie un ratio : 1.0 = pile attendu, 1.5 = 50% au-dessus, etc.
     */
    throughputRatio() {
      if (!this.stats?.expectedthroughput || this.stats.expectedthroughput === 0) {
        return null
      }
      return this.averageThroughput / this.stats.expectedthroughput
    },

    throughputVariant() {
      if (this.throughputRatio === null) return 'default'
      if (this.throughputRatio >= 1) return 'success'
      if (this.throughputRatio >= 0.7) return 'warning'
      return 'danger'
    },
  },

  watch: {
    // si l'ID change (navigation entre traducteurs depuis la page globale)
    id() {
      this.loadStats()
    },
  },

  async created() {
    if (this.isAccessDenied) return
    await this.loadStats()
  },

  methods: {
    async loadStats() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const all = await getTranslatorStats(this.range.from, this.range.to)
        this.stats = findStatsById(all, this.id, 'translator_id')
        if (!this.stats) {
          this.errorMessage = `Aucun traducteur trouvé avec le trigramme ${this.id}.`
        }
      } catch (e) {
        this.errorMessage = "Impossible de charger les statistiques."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    onRangeChange(newRange) {
      this.range = newRange
      this.loadStats()
    },

    backToGlobal() {
      this.$router.push({ name: 'stats' })
    },
  },
}
</script>

<template>
  <section class="space-y-6">
    <!-- Accès refusé -->
    <div v-if="isAccessDenied" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
      🚫 Tu n'as pas accès à ces statistiques.
      <RouterLink :to="{ name: 'home' }" class="underline ml-2">Retour à l'accueil</RouterLink>
    </div>

    <template v-else>
      <div class="flex items-baseline justify-between flex-wrap gap-2">
        <h1 class="text-3xl font-bold text-slate-800">
          Statistiques — Traducteur
        </h1>
        <button
          v-if="roleStore.isRepartitor"
          @click="backToGlobal"
          class="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          ← Retour aux stats globales
        </button>
      </div>

      <!-- Sélecteur de période -->
      <DateRangePicker
        :initial-from="range.from"
        :initial-to="range.to"
        @apply="onRangeChange"
      />

      <!-- Erreur -->
      <div
        v-if="errorMessage"
        class="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
      >
        {{ errorMessage }}
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center text-slate-400 py-8">
        Chargement…
      </div>

      <!-- Stats -->
      <div v-if="!isLoading && stats" class="space-y-6">
        <!-- Identité -->
        <div class="bg-white border border-slate-200 rounded p-4 flex items-baseline gap-3">
          <span class="font-mono text-lg text-slate-500">{{ stats.translator_id }}</span>
          <span class="text-2xl font-bold text-slate-800">
            {{ stats.firstname }} {{ stats.lastname }}
          </span>
          <span v-if="stats.expectedthroughput" class="text-sm text-slate-500 ml-auto">
            Productivité attendue : <strong>{{ stats.expectedthroughput }}</strong> mots/jour
          </span>
        </div>

        <!-- Cartes principales -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Attribuées"
            :value="stats.attributed_count"
            hint="Dans la période"
          />
          <StatCard
            label="Terminées"
            :value="stats.finished_count"
            variant="success"
          />
          <StatCard
            label="En cours"
            :value="stats.in_progress_count"
            variant="warning"
          />
          <StatCard
            label="Finies en retard"
            :value="stats.late_count"
            :variant="stats.late_count > 0 ? 'danger' : 'default'"
          />
        </div>

        <!-- Productivité -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard
            label="Mots traduits"
            :value="Number(stats.total_words).toLocaleString('fr-BE')"
            hint="Textes finis sur la période"
          />
          <StatCard
            label="Mots / jour (moyen)"
            :value="averageThroughput.toLocaleString('fr-BE')"
            :hint="`Sur ${periodDays} jour(s)`"
          />
          <StatCard
            v-if="stats.expectedthroughput"
            label="Atteinte de l'objectif"
            :value="throughputRatio !== null ? (throughputRatio * 100).toFixed(0) + ' %' : '—'"
            :variant="throughputVariant"
            hint="Productivité réelle / attendue"
          />
        </div>
      </div>
    </template>
  </section>
</template>
