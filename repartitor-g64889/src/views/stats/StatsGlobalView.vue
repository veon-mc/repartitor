<script>
import {
  getGlobalStats,
  getTranslatorStats,
  getEditorStats,
} from '@/services/statsService'
import DateRangePicker from '@/components/DateRangePicker.vue'
import StatCard from '@/components/StatCard.vue'

/**
 * Renvoie l'intervalle par défaut : du 1er janvier de l'année courante
 * à aujourd'hui.
 */
function defaultRange() {
  const now = new Date()
  const from = new Date(now.getFullYear(), 0, 1)
  return {
    from: from.toISOString(),
    to: now.toISOString(),
  }
}

export default {
  name: 'StatsGlobalView',
  components: { DateRangePicker, StatCard },

  data() {
    const initial = defaultRange()
    return {
      range: initial,
      global: null,
      translators: [],
      editors: [],
      isLoading: false,
      errorMessage: '',
      // tri des tableaux
      tSortKey: 'lastname',
      tSortAsc: true,
      eSortKey: 'lastname',
      eSortAsc: true,
    }
  },

  computed: {
    sortedTranslators() {
      return this.sortBy(this.translators, this.tSortKey, this.tSortAsc)
    },
    sortedEditors() {
      return this.sortBy(this.editors, this.eSortKey, this.eSortAsc)
    },
  },

  async created() {
    await this.loadAll()
  },

  methods: {
    async loadAll() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const [global, translators, editors] = await Promise.all([
          getGlobalStats(this.range.from, this.range.to),
          getTranslatorStats(this.range.from, this.range.to),
          getEditorStats(this.range.from, this.range.to),
        ])
        this.global = global
        this.translators = translators
        this.editors = editors
      } catch (e) {
        this.errorMessage = "Impossible de charger les statistiques."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    onRangeChange(newRange) {
      this.range = newRange
      this.loadAll()
    },

    sortBy(list, key, asc) {
      const sorted = [...list].sort((a, b) => {
        let va = a[key] ?? ''
        let vb = b[key] ?? ''
        if (typeof va === 'string') {
          va = va.toLowerCase()
          vb = String(vb).toLowerCase()
        }
        if (va < vb) return asc ? -1 : 1
        if (va > vb) return asc ? 1 : -1
        return 0
      })
      return sorted
    },

    toggleTSort(key) {
      if (this.tSortKey === key) this.tSortAsc = !this.tSortAsc
      else { this.tSortKey = key; this.tSortAsc = true }
    },
    toggleESort(key) {
      if (this.eSortKey === key) this.eSortAsc = !this.eSortAsc
      else { this.eSortKey = key; this.eSortAsc = true }
    },

    tSortIcon(key) {
      if (this.tSortKey !== key) return '↕'
      return this.tSortAsc ? '▲' : '▼'
    },
    eSortIcon(key) {
      if (this.eSortKey !== key) return '↕'
      return this.eSortAsc ? '▲' : '▼'
    },

    goToTranslatorStats(id) {
      this.$router.push({ name: 'stats-translator', params: { id } })
    },
    goToEditorStats(id) {
      this.$router.push({ name: 'stats-editor', params: { id } })
    },
  },
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-3xl font-bold text-slate-800">Statistiques globales</h1>

    <!-- Sélecteur d'intervalle -->
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
      <button @click="loadAll" class="ml-2 underline">Réessayer</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 py-8">
      Chargement…
    </div>

    <!-- Contenu -->
    <div v-if="!isLoading && global" class="space-y-8">
      <!-- Cartes globales -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">
          Vue d'ensemble du service
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Textes au total"
            :value="global.total_texts"
            hint="Reçus jusqu'à la fin de période"
          />
          <StatCard
            label="Traducteurs actifs"
            :value="global.active_translators"
          />
          <StatCard
            label="Éditeurs actifs"
            :value="global.active_editors"
          />
          <StatCard
            label="Mots traduits"
            :value="global.total_words_translated.toLocaleString('fr-BE')"
            hint="Sur la période"
          />
        </div>
      </div>

      <!-- Traductions -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">
          Traductions
        </h2>
        <div class="grid grid-cols-3 gap-3">
          <StatCard
            label="Terminées"
            :value="global.translations_finished"
            variant="success"
          />
          <StatCard
            label="En cours"
            :value="global.translations_in_progress"
            variant="warning"
          />
          <StatCard
            label="Finies en retard"
            :value="global.translations_late"
            variant="danger"
            hint="Sur les traductions finies"
          />
        </div>
      </div>

      <!-- Éditions -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">
          Éditions
        </h2>
        <div class="grid grid-cols-3 gap-3">
          <StatCard
            label="Terminées"
            :value="global.editions_finished"
            variant="success"
          />
          <StatCard
            label="En cours"
            :value="global.editions_in_progress"
            variant="warning"
          />
          <StatCard
            label="Finies en retard"
            :value="global.editions_late"
            variant="danger"
          />
        </div>
      </div>

      <!-- Tableau des traducteurs -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">
          Par traducteur
          <span class="text-sm font-normal text-slate-400">
            (clique sur une ligne pour voir le détail)
          </span>
        </h2>
        <div class="overflow-x-auto rounded border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-700">
              <tr>
                <th class="px-3 py-2 cursor-pointer select-none" @click="toggleTSort('translator_id')">
                  Trigramme {{ tSortIcon('translator_id') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none" @click="toggleTSort('lastname')">
                  Nom {{ tSortIcon('lastname') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleTSort('finished_count')">
                  Terminées {{ tSortIcon('finished_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleTSort('in_progress_count')">
                  En cours {{ tSortIcon('in_progress_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleTSort('late_count')">
                  En retard {{ tSortIcon('late_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleTSort('total_words')">
                  Mots {{ tSortIcon('total_words') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in sortedTranslators"
                :key="t.translator_id"
                @click="goToTranslatorStats(t.translator_id)"
                class="border-t border-slate-100 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <td class="px-3 py-2 font-mono">{{ t.translator_id }}</td>
                <td class="px-3 py-2">
                  {{ t.firstname }} {{ t.lastname }}
                </td>
                <td class="px-3 py-2 text-right text-green-700 font-semibold">
                  {{ t.finished_count }}
                </td>
                <td class="px-3 py-2 text-right text-amber-700">
                  {{ t.in_progress_count }}
                </td>
                <td class="px-3 py-2 text-right" :class="t.late_count > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'">
                  {{ t.late_count }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ Number(t.total_words).toLocaleString('fr-BE') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tableau des éditeurs -->
      <div>
        <h2 class="text-lg font-semibold text-slate-700 mb-3">
          Par éditeur
          <span class="text-sm font-normal text-slate-400">
            (clique sur une ligne pour voir le détail)
          </span>
        </h2>
        <div class="overflow-x-auto rounded border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-700">
              <tr>
                <th class="px-3 py-2 cursor-pointer select-none" @click="toggleESort('editor_id')">
                  Trigramme {{ eSortIcon('editor_id') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none" @click="toggleESort('lastname')">
                  Nom {{ eSortIcon('lastname') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleESort('finished_count')">
                  Terminées {{ eSortIcon('finished_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleESort('in_progress_count')">
                  En cours {{ eSortIcon('in_progress_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleESort('late_count')">
                  En retard {{ eSortIcon('late_count') }}
                </th>
                <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleESort('total_words')">
                  Mots {{ eSortIcon('total_words') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in sortedEditors"
                :key="e.editor_id"
                @click="goToEditorStats(e.editor_id)"
                class="border-t border-slate-100 hover:bg-amber-50 cursor-pointer transition-colors"
              >
                <td class="px-3 py-2 font-mono">{{ e.editor_id }}</td>
                <td class="px-3 py-2">
                  {{ e.firstname }} {{ e.lastname }}
                </td>
                <td class="px-3 py-2 text-right text-green-700 font-semibold">
                  {{ e.finished_count }}
                </td>
                <td class="px-3 py-2 text-right text-amber-700">
                  {{ e.in_progress_count }}
                </td>
                <td class="px-3 py-2 text-right" :class="e.late_count > 0 ? 'text-red-700 font-semibold' : 'text-slate-400'">
                  {{ e.late_count }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ Number(e.total_words).toLocaleString('fr-BE') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
