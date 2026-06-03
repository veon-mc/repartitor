<script>
import { mapStores } from 'pinia'
import { useRoleStore } from '@/stores/RoleStore'
import { getTextsForEditor, finishEdition } from '@/services/textService'
import MyTextsTable from '@/components/MyTextsTable.vue'

export default {
  name: 'TextsEditionView',
  components: { MyTextsTable },

  data() {
    return {
      texts: [],
      isLoading: false,
      errorMessage: '',
      actionError: '',
    }
  },

  computed: {
    ...mapStores(useRoleStore),

    editorId() {
      return this.roleStore.person?.id
    },

    fullName() {
      const p = this.roleStore.person
      if (!p) return ''
      return `${p.firstname} ${p.lastname}`
    },
  },

  async created() {
    if (!this.editorId) {
      this.errorMessage = "Aucun éditeur sélectionné. Va sur 'Changer de rôle' pour en choisir un."
      return
    }
    await this.loadTexts()
  },

  methods: {
    async loadTexts() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        this.texts = await getTextsForEditor(this.editorId)
      } catch (e) {
        this.errorMessage = "Impossible de charger tes éditions."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    async onFinish(text) {
      this.actionError = ''
      if (!confirm(`Confirmer la fin de l'édition de "${text.title}" ?`)) {
        return
      }
      try {
        await finishEdition(text.id, this.editorId)
        await this.loadTexts()
      } catch (e) {
        this.actionError = "Échec de la validation. Réessaie."
        console.error(e)
      }
    },
  },
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-baseline justify-between flex-wrap gap-2">
      <h1 class="text-3xl font-bold text-slate-800">Mes éditions</h1>
      <span v-if="fullName" class="text-sm text-slate-500">
        {{ fullName }}
        <span class="font-mono text-xs">({{ editorId }})</span>
      </span>
    </div>

    <p class="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded p-3">
      ℹ️ Tu ne peux marquer une édition comme terminée que si la traduction
      correspondante est elle-même terminée.
    </p>

    <div
      v-if="errorMessage"
      class="p-4 bg-red-50 border border-red-200 text-red-700 rounded"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="actionError"
      class="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
    >
      {{ actionError }}
    </div>

    <div v-if="isLoading" class="text-center text-slate-400 py-8">
      Chargement…
    </div>

    <MyTextsTable
      v-if="!isLoading && !errorMessage"
      :texts="texts"
      :requires-translation-done="true"
      @finish="onFinish"
    />
  </section>
</template>