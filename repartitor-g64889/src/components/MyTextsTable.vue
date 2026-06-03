<script>
import TextStatusBadge from '@/components/TextStatusBadge.vue'

export default {
  name: 'MyTextsTable',
  components: { TextStatusBadge },

  props: {
    /**
     * Liste des textes attribués à l'utilisateur courant.
     * Chaque texte doit avoir : id, cote, title, wordcount, deadline,
     * attributed, finished.
     * En option : translationFinished (pour les éditeurs).
     */
    texts: {
      type: Array,
      required: true,
    },
    /**
     * Si true (cas éditeur), désactive le bouton "Terminer" tant que
     * la traduction n'est pas finie.
     */
    requiresTranslationDone: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['finish'],

  data() {
    return {
      filterCote: '',
      filterTitle: '',
      sortKey: 'deadline',
      sortAsc: true,
    }
  },

  computed: {
    filteredAndSorted() {
      const fc = this.filterCote.toLowerCase()
      const ft = this.filterTitle.toLowerCase()

      const filtered = this.texts.filter((t) =>
        (t.cote || '').toLowerCase().includes(fc) &&
        (t.title || '').toLowerCase().includes(ft)
      )

      const sorted = [...filtered].sort((a, b) => {
        let va = a[this.sortKey] ?? ''
        let vb = b[this.sortKey] ?? ''
        if (va < vb) return this.sortAsc ? -1 : 1
        if (va > vb) return this.sortAsc ? 1 : -1
        return 0
      })

      return sorted
    },
  },

  methods: {
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

    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('fr-BE')
    },

    /**
     * Peut-on cliquer sur "Terminer" pour ce texte ?
     * - Non si déjà terminé
     * - Non si c'est une édition et la traduction n'est pas finie
     */
    canFinish(text) {
      if (text.finished) return false
      if (this.requiresTranslationDone && !text.translationFinished) return false
      return true
    },

    /**
     * Texte explicatif quand on ne peut pas finir.
     */
    disabledReason(text) {
      if (text.finished) return 'Déjà terminé'
      if (this.requiresTranslationDone && !text.translationFinished) {
        return 'La traduction n\'est pas encore terminée'
      }
      return ''
    },

    finish(text) {
      this.$emit('finish', text)
    },
  },
}
</script>

<template>
  <div class="overflow-x-auto rounded border border-slate-200 bg-white">
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
          <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('attributed')">
            Attribué le {{ sortIcon('attributed') }}
          </th>
          <th class="px-3 py-2 cursor-pointer select-none" @click="toggleSort('deadline')">
            Échéance {{ sortIcon('deadline') }}
          </th>
          <th class="px-3 py-2">Statut</th>
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
          <th colspan="5"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="text in filteredAndSorted"
          :key="text.id"
          class="border-t border-slate-100 hover:bg-amber-50/50 transition-colors"
        >
          <td class="px-3 py-2 font-mono">{{ text.cote }}</td>
          <td class="px-3 py-2">{{ text.title }}</td>
          <td class="px-3 py-2 text-right">{{ text.wordcount }}</td>
          <td class="px-3 py-2">{{ formatDate(text.attributed) }}</td>
          <td class="px-3 py-2">{{ formatDate(text.deadline) }}</td>
          <td class="px-3 py-2">
            <TextStatusBadge :attribution="text" />
          </td>
          <td class="px-3 py-2 text-right">
            <button
              v-if="!text.finished"
              :disabled="!canFinish(text)"
              :title="disabledReason(text)"
              @click="finish(text)"
              class="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-3 py-1 rounded text-xs transition-colors"
            >
              Terminer
            </button>
            <span v-else class="text-xs text-slate-400 italic">
              Terminé
            </span>
          </td>
        </tr>
        <tr v-if="filteredAndSorted.length === 0">
          <td colspan="7" class="px-3 py-6 text-center text-slate-400">
            Aucun texte à afficher.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>