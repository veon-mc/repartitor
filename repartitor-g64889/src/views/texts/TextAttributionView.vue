<script>
export default {
  name: 'TextAttributionView',
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold text-slate-800">Attribution du texte #{{ id }}</h1>
    <p class="text-slate-600">À venir : choix du traducteur et de l'éditeur.</p>
    <button
      @click="$router.back()"
      class="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-semibold transition-colors"
    >
      ← Retour
    </button>
  </section>
</template>