<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f] text-white">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 pt-20 pb-8">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
