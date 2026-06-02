<script>
import { getAllTextsWithStatus } from '@/services/textService'
import TextStatusBadge from '@/components/TextStatusBadge.vue'

export default {
  name: 'TextsRepartitionView',
  components: { TextStatusBadge },

  data() {
    return {
      texts: [],
      isLoading: false,
      errorMessage: '',
      // filtres
      filterCote: '',
      filterTitle: '',
      // tri
      sortKey: 'deadline',
      sortAsc: true,
    }
  },

  computed: {
    /**
     * Liste filtrée + triée.
     */
    filteredAndSortedTexts() {
      const fc = this.filterCote.toLowerCase()
      const ft = this.filterTitle.toLowerCase()

      const filtered = this.texts.filter((t) =>
        (t.cote || '').toLowerCase().includes(fc) &&
        (t.title || '').toLowerCase().includes(ft)
      )

      const sorted = [...filtered].sort((a, b) => {
        let va = a[this.sortKey]
        let vb = b[this.sortKey]
        // dates : on compare en ISO string ça suffit
        if (va == null) va = ''
        if (vb == null) vb = ''
        if (va < vb) return this.sortAsc ? -1 : 1
        if (va > vb) return this.sortAsc ? 1 : -1
        return 0
      })

      return sorted
    },
  },

  async created() {
    await this.loadTexts()
  },

  methods: {
    async loadTexts() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        this.texts = await getAllTextsWithStatus()
      } catch (e) {
        this.errorMessage = "Impossible de charger les textes. Réessaie."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    toggleSort(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc
      } else {
        this.sortKey = key
        this.sortAsc = true
      }
    },

    sortIcon(key) {
      if (this.sortKey !== key) return '↕'
      return this.sortAsc ? '▲' : '▼'
    },

    /**
     * Formate une date ISO en JJ/MM/AAAA.
     */
    formatDate(iso) {
      if (!iso) return '—'
      const d = new Date(iso)
      return d.toLocaleDateString('fr-BE')
    },

    /**
     * Navigation vers la page d'attribution (à implémenter en 7.4).
     */
    goToAttribution(textId) {
      this.$router.push({ name: 'text-attribution', params: { id: textId } })
    },
  },
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-baseline justify-between">
      <h1 class="text-3xl font-bold text-slate-800">Gestion des textes</h1>
      <span class="text-sm text-slate-400">
        Vue répartiteur — {{ texts.length }} texte(s)
      </span>
    </div>

    <!-- Erreur -->
    <div
      v-if="errorMessage"
      class="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
    >
      {{ errorMessage }}
      <button @click="loadTexts" class="ml-2 underline">Réessayer</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 py-8">
      Chargement…
    </div>

    <!-- Tableau -->
    <div v-if="!isLoading && !errorMessage" class="overflow-x-auto rounded border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('cote')">
              Cote {{ sortIcon('cote') }}
            </th>
            <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('title')">
              Titre {{ sortIcon('title') }}
            </th>
            <th class="px-3 py-2 cursor-pointer select-none text-right" @click="toggleSort('wordcount')">
              Mots {{ sortIcon('wordcount') }}
            </th>
            <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('received')">
              Reçu {{ sortIcon('received') }}
            </th>
            <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('deadline')">
              Échéance {{ sortIcon('deadline') }}
            </th>
            <th class="px-3 py-2">Traduction</th>
            <th class="px-3 py-2">Édition</th>
            <th class="px-3 py-2"></th>
          </tr>
          <tr class="bg-slate-50">
            <th class="px-3 py-2">
              <input
                v-model="filterCote"
                type="text"
                placeholder="Filtrer…"
                class="w-full px-2 py-1 text-xs border border-slate-300 rounded font-normal"
              />
            </th>
            <th class="px-3 py-2">
              <input
                v-model="filterTitle"
                type="text"
                placeholder="Filtrer…"
                class="w-full px-2 py-1 text-xs border border-slate-300 rounded font-normal"
              />
            </th>
            <th colspan="6"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="text in filteredAndSortedTexts"
            :key="text.id"
            class="border-t border-slate-100 hover:bg-amber-50/50 transition-colors"
          >
            <td class="px-3 py-2 font-mono">{{ text.cote }}</td>
            <td class="px-3 py-2">{{ text.title }}</td>
            <td class="px-3 py-2 text-right">{{ text.wordcount }}</td>
            <td class="px-3 py-2">{{ formatDate(text.received) }}</td>
            <td class="px-3 py-2">{{ formatDate(text.deadline) }}</td>
            <td class="px-3 py-2">
              <TextStatusBadge
                :attribution="text.translation"
                not-attributed-label="À attribuer"
              />
              <div v-if="text.translation" class="text-xs text-slate-500 mt-1 font-mono">
                {{ text.translation.translator }}
              </div>
            </td>
            <td class="px-3 py-2">
              <TextStatusBadge
                :attribution="text.edition"
                not-attributed-label="À attribuer"
              />
              <div v-if="text.edition" class="text-xs text-slate-500 mt-1 font-mono">
                {{ text.edition.editor }}
              </div>
            </td>
            <td class="px-3 py-2 text-right">
              <button
                @click="goToAttribution(text.id)"
                class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-3 py-1 rounded text-xs transition-colors"
              >
                Attribuer
              </button>
            </td>
          </tr>
          <tr v-if="filteredAndSortedTexts.length === 0">
            <td colspan="8" class="px-3 py-6 text-center text-slate-400">
              Aucun texte ne correspond aux filtres.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>