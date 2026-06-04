<script>
import {
  getTextWithStatus,
  attributeTranslation,
  attributeEdition,
} from '@/services/textService'
import { getTranslators } from '@/services/translatorService'
import { getEditors } from '@/services/editorService'
import PersonTable from '@/components/PersonTable.vue'
import TextStatusBadge from '@/components/TextStatusBadge.vue'

export default {
  name: 'TextAttributionView',
  components: { PersonTable, TextStatusBadge },

  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },

  data() {
    return {
      text: null,
      translators: [],
      editors: [],
      isLoading: false,
      errorMessage: '',
      // état du modal de sélection
      pickerMode: null, // 'translator' | 'editor' | null
      // deadline saisie par le répartiteur pour la traduction
      translationDeadline: '',
      // feedback sur l'action en cours
      isSubmitting: false,
      submitError: '',
    }
  },

  computed: {
    /**
     * On ne peut attribuer un éditeur que si un traducteur est déjà attribué.
     */
    canAttributeEditor() {
      return this.text?.translation != null && this.text?.edition == null
    },

    /**
     * On ne peut attribuer un traducteur que s'il n'y en a pas déjà un.
     */
    canAttributeTranslator() {
      return this.text != null && this.text.translation == null
    },

    /**
     * Deadline du texte (utilisée comme valeur par défaut pour la deadline
     * de traduction).
     */
    defaultTranslationDeadline() {
      if (!this.text?.deadline) return ''
      // on enlève l'éventuelle partie heure pour mettre dans un <input type="date">
      return this.text.deadline.substring(0, 10)
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
        const [text, translators, editors] = await Promise.all([
          getTextWithStatus(this.id),
          getTranslators(),
          getEditors(),
        ])
        this.text = text
        this.translators = translators
        this.editors = editors
        this.translationDeadline = this.defaultTranslationDeadline
      } catch (e) {
        this.errorMessage = "Impossible de charger ce texte. Réessaie."
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },

    openPicker(mode) {
      this.submitError = ''
      this.pickerMode = mode
    },

    closePicker() {
      this.pickerMode = null
    },

    async onTranslatorSelected(translator) {
      if (!this.translationDeadline) {
        this.submitError = "Choisis d'abord une deadline pour la traduction."
        return
      }
      this.isSubmitting = true
      this.submitError = ''
      try {
        // on convertit la date 'YYYY-MM-DD' en ISO complète (fin de journée)
        const isoDeadline = new Date(this.translationDeadline + 'T23:59:59').toISOString()
        await attributeTranslation(this.text.id, translator.id, isoDeadline)
        // on recharge le texte pour refléter la nouvelle attribution
        await this.loadAll()
        this.closePicker()
      } catch (e) {
        console.error("Erreur lors de l'attribution du traducteur :", e)
        this.submitError = "Échec de l'attribution. Vérifie que ce traducteur n'a pas déjà ce texte."
      } finally {
        this.isSubmitting = false
      }
    },

    async onEditorSelected(editor) {
      if (!this.text.translation) {
        this.submitError = "Impossible : il n'y a pas encore de traducteur attribué."
        return
      }
      this.isSubmitting = true
      this.submitError = ''
      try {
        await attributeEdition(
          this.text.id,
          editor.id,
          this.text.translation.translator
        )
        await this.loadAll()
        this.closePicker()
      } catch (e) {
        console.error("Erreur lors de l'attribution de l'éditeur :", e)
        this.submitError = "Échec de l'attribution. Vérifie que cet éditeur n'a pas déjà ce texte."
      } finally {
        this.isSubmitting = false
      }
    },

    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('fr-BE')
    },

    backToList() {
      this.$router.push({ name: 'texts-repartition' })
    },
  },
}
</script>

<template>
  <section class="space-y-6">
    <!-- En-tête + retour -->
    <div class="flex items-baseline justify-between">
      <h1 class="text-3xl font-bold text-slate-800">Attribution</h1>
      <button
        @click="backToList"
        class="text-sm text-slate-600 hover:text-slate-900 underline"
      >
        ← Retour à la liste
      </button>
    </div>

    <!-- Erreur globale -->
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

    <!-- Fiche du texte -->
    <div v-if="!isLoading && text" class="space-y-6">
      <!-- Métadonnées du texte -->
      <div class="bg-white border border-slate-200 rounded p-5 space-y-3">
        <h2 class="text-xl font-semibold text-slate-800">
          {{ text.title }}
          <span class="font-mono text-base text-slate-500 ml-2">{{ text.cote }}</span>
        </h2>
        <dl class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <dt class="text-slate-500">Nombre de mots</dt>
            <dd class="font-semibold">{{ text.wordcount }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Reçu le</dt>
            <dd class="font-semibold">{{ formatDate(text.received) }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Échéance globale</dt>
            <dd class="font-semibold">{{ formatDate(text.deadline) }}</dd>
          </div>
          <div v-if="text.precedent">
            <dt class="text-slate-500">Texte précédent</dt>
            <dd class="font-semibold">#{{ text.precedent }}</dd>
          </div>
        </dl>
      </div>

      <!-- Bloc Traduction -->
      <div class="bg-white border border-slate-200 rounded p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">Traduction</h3>
          <TextStatusBadge
            :attribution="text.translation"
            not-attributed-label="Non attribuée"
          />
        </div>

        <!-- Si déjà attribuée -->
        <div v-if="text.translation" class="text-sm text-slate-700 space-y-1">
          <p>
            Attribuée à
            <strong class="font-mono">{{ text.translation.translator }}</strong>
            le {{ formatDate(text.translation.attributed) }}
          </p>
          <p>Deadline traduction : {{ formatDate(text.translation.deadline) }}</p>
          <p v-if="text.translation.finished">
            Terminée le <strong>{{ formatDate(text.translation.finished) }}</strong>
          </p>
        </div>

        <!-- Si non attribuée : formulaire -->
        <div v-else class="space-y-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">
              Deadline pour la traduction
            </label>
            <input
              v-model="translationDeadline"
              type="date"
              class="px-3 py-2 border border-slate-300 rounded text-sm"
            />
          </div>
          <button
            @click="openPicker('translator')"
            :disabled="!canAttributeTranslator"
            class="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-900 font-semibold px-4 py-2 rounded transition-colors"
          >
            Choisir un traducteur
          </button>
        </div>
      </div>

      <!-- Bloc Édition -->
      <div class="bg-white border border-slate-200 rounded p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">Édition</h3>
          <TextStatusBadge
            :attribution="text.edition"
            not-attributed-label="Non attribuée"
          />
        </div>

        <!-- Si déjà attribuée -->
        <div v-if="text.edition" class="text-sm text-slate-700 space-y-1">
          <p>
            Attribuée à
            <strong class="font-mono">{{ text.edition.editor }}</strong>
            le {{ formatDate(text.edition.attributed) }}
          </p>
          <p v-if="text.edition.finished">
            Terminée le <strong>{{ formatDate(text.edition.finished) }}</strong>
          </p>
        </div>

        <!-- Si non attribuée -->
        <div v-else class="space-y-3">
          <p v-if="!text.translation" class="text-sm text-amber-700 bg-amber-50 p-3 rounded">
            ⚠️ Il faut d'abord attribuer un traducteur avant de pouvoir attribuer un éditeur.
          </p>
          <button
            @click="openPicker('editor')"
            :disabled="!canAttributeEditor"
            class="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-900 font-semibold px-4 py-2 rounded transition-colors"
          >
            Choisir un éditeur
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de sélection (overlay) -->
    <div
      v-if="pickerMode"
      class="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
      @click.self="closePicker"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- En-tête du modal -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 class="text-lg font-semibold text-slate-800">
            Choisir un {{ pickerMode === 'translator' ? 'traducteur' : 'éditeur' }}
          </h3>
          <button
            @click="closePicker"
            class="text-slate-400 hover:text-slate-700 text-2xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <!-- Erreur de soumission éventuelle -->
        <div
          v-if="submitError"
          class="mx-5 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm"
        >
          {{ submitError }}
        </div>

        <!-- Indicateur de submission -->
        <div v-if="isSubmitting" class="px-5 py-3 text-sm text-slate-500">
          Attribution en cours…
        </div>

        <!-- Tableau de sélection -->
        <div class="overflow-y-auto p-5">
          <PersonTable
            v-if="pickerMode === 'translator'"
            :people="translators"
            action-label="Attribuer"
            @select="onTranslatorSelected"
          />
          <PersonTable
            v-else
            :people="editors"
            action-label="Attribuer"
            @select="onEditorSelected"
          />
        </div>
      </div>
    </div>
  </section>
</template>
