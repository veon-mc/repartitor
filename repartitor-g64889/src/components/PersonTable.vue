<script>
export default {
  name: 'PersonTable',

  props: {
    /**
     * Liste des personnes à afficher.
     * Chaque élément doit avoir au moins { id, firstname, lastname }.
     */
    people: {
      type: Array,
      required: true,
    },
    /**
     * Libellé du bouton d'action à droite de chaque ligne.
     */
    actionLabel: {
      type: String,
      default: 'Choisir',
    },
  },

  emits: ['select'],

  data() {
    return {
      // filtres (un par colonne)
      filterId: '',
      filterFirstname: '',
      filterLastname: '',
      // tri
      sortKey: 'id',
      sortAsc: true,
    }
  },

  computed: {
    /**
     * Liste filtrée + triée à partir de la prop `people`.
     * computed = recalculé automatiquement quand une dépendance change.
     */
    filteredAndSorted() {
      // 1. Filtrage (insensible à la casse)
      const id = this.filterId.toLowerCase()
      const fn = this.filterFirstname.toLowerCase()
      const ln = this.filterLastname.toLowerCase()

      const filtered = this.people.filter((p) =>
        p.id.toLowerCase().includes(id) &&
        p.firstname.toLowerCase().includes(fn) &&
        p.lastname.toLowerCase().includes(ln)
      )

      // 2. Tri
      const sorted = [...filtered].sort((a, b) => {
        const va = String(a[this.sortKey]).toLowerCase()
        const vb = String(b[this.sortKey]).toLowerCase()
        if (va < vb) return this.sortAsc ? -1 : 1
        if (va > vb) return this.sortAsc ? 1 : -1
        return 0
      })

      return sorted
    },
  },

  methods: {
    /**
     * Change la colonne de tri, ou inverse l'ordre si même colonne.
     */
    toggleSort(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc
      } else {
        this.sortKey = key
        this.sortAsc = true
      }
    },

    /**
     * Émet l'événement de sélection au parent.
     */
    select(person) {
      this.$emit('select', person)
    },

    sortIcon(key) {
      if (this.sortKey !== key) return '↕'
      return this.sortAsc ? '▲' : '▼'
    },
  },
}
</script>

<template>
  <div class="overflow-x-auto rounded border border-slate-200 bg-white">
    <table class="w-full text-left">
      <thead class="bg-slate-100 text-slate-700">
        <tr>
          <th class="px-4 py-2 cursor-pointer select-none" @click="toggleSort('id')">
            Trigramme {{ sortIcon('id') }}
          </th>
          <th class="px-4 py-2 cursor-pointer select-none" @click="toggleSort('firstname')">
            Prénom {{ sortIcon('firstname') }}
          </th>
          <th class="px-4 py-2 cursor-pointer select-none" @click="toggleSort('lastname')">
            Nom {{ sortIcon('lastname') }}
          </th>
          <th class="px-4 py-2"></th>
        </tr>
        <tr class="bg-slate-50">
          <th class="px-4 py-2">
            <input
              v-model="filterId"
              type="text"
              placeholder="Filtrer…"
              class="w-full px-2 py-1 text-sm border border-slate-300 rounded font-normal"
            />
          </th>
          <th class="px-4 py-2">
            <input
              v-model="filterFirstname"
              type="text"
              placeholder="Filtrer…"
              class="w-full px-2 py-1 text-sm border border-slate-300 rounded font-normal"
            />
          </th>
          <th class="px-4 py-2">
            <input
              v-model="filterLastname"
              type="text"
              placeholder="Filtrer…"
              class="w-full px-2 py-1 text-sm border border-slate-300 rounded font-normal"
            />
          </th>
          <th class="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="person in filteredAndSorted"
          :key="person.id"
          class="border-t border-slate-100 hover:bg-amber-50 transition-colors"
        >
          <td class="px-4 py-2 font-mono">{{ person.id }}</td>
          <td class="px-4 py-2">{{ person.firstname }}</td>
          <td class="px-4 py-2">{{ person.lastname }}</td>
          <td class="px-4 py-2 text-right">
            <button
              @click="select(person)"
              class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-3 py-1 rounded text-sm transition-colors"
            >
              {{ actionLabel }}
            </button>
          </td>
        </tr>
        <tr v-if="filteredAndSorted.length === 0">
          <td colspan="4" class="px-4 py-6 text-center text-slate-400">
            Aucun résultat
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
