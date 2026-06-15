<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = [
  { label: '甜宠', icon: '💕', color: 'from-pink-500 to-rose-400' },
  { label: '逆袭', icon: '🔥', color: 'from-orange-500 to-red-400' },
  { label: '悬疑', icon: '🔍', color: 'from-purple-500 to-indigo-400' },
  { label: '古装', icon: '🏯', color: 'from-amber-500 to-yellow-400' },
  { label: '都市', icon: '🌃', color: 'from-blue-500 to-cyan-400' },
  { label: '虐恋', icon: '💔', color: 'from-red-500 to-pink-400' },
  { label: '奇幻', icon: '✨', color: 'from-violet-500 to-purple-400' },
  { label: '喜剧', icon: '😄', color: 'from-green-500 to-emerald-400' },
]

function goToCategory(cat: string) {
  router.push({ path: '/category', query: { category: cat } })
}
</script>

<template>
  <div class="grid grid-cols-4 md:grid-cols-8 gap-3">
    <button
      v-for="cat in categories"
      :key="cat.label"
      class="flex flex-col items-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
      @click="goToCategory(cat.label)"
    >
      <span class="text-2xl group-hover:scale-110 transition-transform">{{ cat.icon }}</span>
      <span class="text-xs text-gray-300 group-hover:text-white transition-colors">{{ cat.label }}</span>
    </button>
  </div>
</template>
