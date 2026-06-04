<script>
import { mapStores } from 'pinia'
import { useRoleStore } from '@/stores/RoleStore'
import { getEditorStats, findStatsById } from '@/services/statsService'
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
  name: 'StatsEditorView',
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

    isAccessDenied() {
      if (this.roleStore.isRepartitor) return false
      if (this.roleStore.isEditor) {
        return this.roleStore.person?.id !== this.id
      }
      return true
    },

    periodDays() {
      const from = new Date(this.range.from)
      const to = new Date(this.range.to)
      const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24))
      return Math.max(days, 1)
    },

    averageThroughput() {
      if (!this.stats) return 0
      return Math.round(Number(this.stats.total_words) / this.periodDays)
    },
  },

  watch: {
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
        const all = await getEditorStats(this.range.from, this.range.to)
        this.stats = findStatsById(all, this.id, 'editor_id')
        if (!this.stats) {
          this.errorMessage = `Aucun éditeur trouvé avec le trigramme ${this.id}.`
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
    <div v-if="isAccessDenied" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
      🚫 Tu n'as pas accès à ces statistiques.
      <RouterLink :to="{ name: 'home' }" class="underline ml-2">Retour à l'accueil</RouterLink>
    </div>

    <template v-else>
      <div class="flex items-baseline justify-between flex-wrap gap-2">
        <h1 class="text-3xl font-bold text-slate-800">
          Statistiques — Éditeur
        </h1>
        <button
          v-if="roleStore.isRepartitor"
          @click="backToGlobal"
          class="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          ← Retour aux stats globales
        </button>
      </div>

      <DateRangePicker
        :initial-from="range.from"
        :initial-to="range.to"
        @apply="onRangeChange"
      />

      <div
        v-if="errorMessage"
        class="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
      >
        {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="text-center text-slate-400 py-8">
        Chargement…
      </div>

      <div v-if="!isLoading && stats" class="space-y-6">
        <div class="bg-white border border-slate-200 rounded p-4 flex items-baseline gap-3">
          <span class="font-mono text-lg text-slate-500">{{ stats.editor_id }}</span>
          <span class="text-2xl font-bold text-slate-800">
            {{ stats.firstname }} {{ stats.lastname }}
          </span>
        </div>

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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StatCard
            label="Mots édités"
            :value="Number(stats.total_words).toLocaleString('fr-BE')"
            hint="Textes finis sur la période"
          />
          <StatCard
            label="Mots / jour (moyen)"
            :value="averageThroughput.toLocaleString('fr-BE')"
            :hint="`Sur ${periodDays} jour(s)`"
          />
        </div>
      </div>
    </template>
  </section>
</template>
