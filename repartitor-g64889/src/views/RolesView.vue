<script>
import { mapStores } from 'pinia'
import { useRoleStore } from '@/stores/RoleStore'
import { getTranslators } from '@/services/translatorService'
import { getEditors } from '@/services/editorService'
import PersonTable from '@/components/PersonTable.vue'

export default {
  name: 'RolesView',
  components: { PersonTable },

  data() {
    return {
      translators: [],
      editors: [],
      isLoading: false,
      errorMessage: '',
    }
  },

  computed: {
    ...mapStores(useRoleStore),
  },

  async created() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        // requêtes en parallèle pour gagner du temps
        const [translators, editors] = await Promise.all([
          getTranslators(),
          getEditors(),
        ])
        this.translators = translators
        this.editors = editors
      } catch (e) {
        this.errorMessage = "Impossible de charger les traducteurs et éditeurs. Réessaie."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    selectTranslator(translator) {
      this.roleStore.becomeTranslator(translator)
    },

    selectEditor(editor) {
      this.roleStore.becomeEditor(editor)
    },

    backToRepartitor() {
      this.roleStore.becomeRepartitor()
    },
  },
}
</script>

<template>
  <section class="space-y-8">
    <h1 class="text-3xl font-bold text-slate-800">Changement de rôle</h1>

    <!-- Rôle courant + bouton retour répartiteur -->
    <div class="flex items-center gap-4 p-4 bg-white rounded border border-slate-200">
      <div class="flex-1">
        <p class="text-sm text-slate-500">Rôle actuel</p>
        <p class="font-semibold text-slate-800">
          {{ roleStore.roleLabel }}
          <span v-if="roleStore.person" class="text-slate-600">
            — {{ roleStore.person.firstname }} {{ roleStore.person.lastname }}
            <span class="font-mono text-xs text-slate-400">
              ({{ roleStore.person.id }})
            </span>
          </span>
        </p>
      </div>
      <button
        v-if="!roleStore.isRepartitor"
        @click="backToRepartitor"
        class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-semibold transition-colors"
      >
        Revenir au rôle de répartiteur
      </button>
    </div>

    <!-- Message d'erreur si échec de chargement -->
    <div
      v-if="errorMessage"
      class="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
    >
      {{ errorMessage }}
      <button
        @click="loadData"
        class="ml-2 underline hover:no-underline"
      >
        Réessayer
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 py-8">
      Chargement…
    </div>

    <!-- Section Traducteurs -->
    <div v-if="!isLoading && !errorMessage">
      <h2 class="text-xl font-semibold text-slate-700 mb-3">
        Traducteur
        <span class="text-sm font-normal text-slate-400">
          ({{ translators.length }})
        </span>
      </h2>
      <PersonTable
        :people="translators"
        action-label="Choisir"
        @select="selectTranslator"
      />
    </div>

    <!-- Section Éditeurs -->
    <div v-if="!isLoading && !errorMessage">
      <h2 class="text-xl font-semibold text-slate-700 mb-3">
        Éditeur
        <span class="text-sm font-normal text-slate-400">
          ({{ editors.length }})
        </span>
      </h2>
      <PersonTable
        :people="editors"
        action-label="Choisir"
        @select="selectEditor"
      />
    </div>
  </section>
</template>
