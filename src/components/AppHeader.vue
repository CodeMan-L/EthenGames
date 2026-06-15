<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Menu, X } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: '首页', path: '/' },
  { label: '分类', path: '/category' },
  { label: '排行榜', path: '/category?sort=评分' },
]

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <router-link to="/" class="flex items-center gap-2.5 shrink-0">
        <img src="/logo.svg" alt="MH Logo" class="w-9 h-9 object-contain" />
        <div class="flex flex-col leading-none">
          <span class="text-white font-bold text-base tracking-wide">墨焕科技</span>
          <span class="text-gray-500 text-[10px] tracking-widest uppercase">Momentum & Hope</span>
        </div>
      </router-link>

      <nav class="hidden md:flex items-center gap-6">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="text-gray-300 hover:text-white transition-colors text-sm font-medium"
          active-class="text-[#ff6b81]"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-3 flex-1 max-w-md justify-end">
        <div class="relative flex-1 max-w-xs hidden sm:block">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索短剧..."
            class="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8364e]/50 focus:ring-1 focus:ring-[#e8364e]/30 transition-all"
            @keyup.enter="handleSearch"
          />
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        </div>

        <button class="md:hidden text-gray-300 hover:text-white" @click="toggleMobileMenu">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden bg-[#0a0a0f]/98 border-t border-white/5 px-4 py-4">
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索短剧..."
          class="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8364e]/50"
          @keyup.enter="handleSearch"
        />
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>
      <nav class="flex flex-col gap-3">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="text-gray-300 hover:text-white transition-colors text-sm font-medium py-2"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>
