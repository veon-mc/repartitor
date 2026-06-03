<script>
import { mapStores } from 'pinia'
import { useRoleStore } from '@/stores/RoleStore'
import { getTextsForTranslator, finishTranslation } from '@/services/textService'
import MyTextsTable from '@/components/MyTextsTable.vue'

export default {
  name: 'TextsTraductionView',
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

    translatorId() {
      return this.roleStore.person?.id
    },

    fullName() {
      const p = this.roleStore.person
      if (!p) return ''
      return `${p.firstname} ${p.lastname}`
    },
  },

  async created() {
    if (!this.translatorId) {
      this.errorMessage = "Aucun traducteur sélectionné. Va sur 'Changer de rôle' pour en choisir un."
      return
    }
    await this.loadTexts()
  },

  methods: {
    async loadTexts() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        this.texts = await getTextsForTranslator(this.translatorId)
      } catch (e) {
        this.errorMessage = "Impossible de charger tes traductions."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    async onFinish(text) {
      this.actionError = ''
      // confirmation utilisateur
      if (!confirm(`Confirmer la fin de la traduction de "${text.title}" ?`)) {
        return
      }
      try {
        await finishTranslation(text.id, this.translatorId)
        await this.loadTexts() // recharge pour refléter le changement
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
      <h1 class="text-3xl font-bold text-slate-800">Mes traductions</h1>
      <span v-if="fullName" class="text-sm text-slate-500">
        {{ fullName }}
        <span class="font-mono text-xs">({{ translatorId }})</span>
      </span>
    </div>

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
      @finish="onFinish"
    />
  </section>
</template>