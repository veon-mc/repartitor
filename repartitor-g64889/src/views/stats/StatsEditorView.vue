<script>
export default {
  name: 'StatsEditorView',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
}
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-3xl font-bold text-slate-800">
      Stats de l'éditeur {{ id }}
    </h1>
    <p class="text-slate-600">À venir : productivité, retards, etc.</p>
  </section>
</template>