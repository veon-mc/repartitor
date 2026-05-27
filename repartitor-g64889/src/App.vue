<script>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'App',
  components: { AppHeader, AppFooter },
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <AppHeader />

    <main class="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
