<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Drama } from '@/types'
import { searchDramas, hotSearchKeywords } from '@/mock/data'
import DramaCard from '@/components/DramaCard.vue'
import { Search, TrendingUp, Clock, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const query = ref('')
const results = ref<Drama[]>([])
const hasSearched = ref(false)
const searchHistory = ref<string[]>([])

function doSearch(keyword?: string) {
  const q = keyword || query.value.trim()
  if (!q) return

  query.value = q
  results.value = searchDramas(q)
  hasSearched.value = true

  if (!searchHistory.value.includes(q)) {
    searchHistory.value.unshift(q)
    if (searchHistory.value.length > 10) searchHistory.value.pop()
  }

  router.replace({ query: { q } })
}

function clearHistory() {
  searchHistory.value = []
}

function removeHistoryItem(index: number) {
  searchHistory.value.splice(index, 1)
}

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q as string
    doSearch(query.value)
  }
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-2xl mx-auto mb-8">
      <div class="relative">
        <input
          v-model="query"
          type="text"
          placeholder="输入短剧名称、类型搜索..."
          class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-[#e8364e]/50 focus:ring-2 focus:ring-[#e8364e]/20 transition-all text-lg"
          @keyup.enter="doSearch()"
        />
        <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <button
          v-if="query"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-[#e8364e] to-[#ff6b81] rounded-xl text-white flex items-center justify-center hover:shadow-lg hover:shadow-[#e8364e]/30 transition-all"
          @click="doSearch()"
        >
          <Search class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="!hasSearched" class="space-y-8">
      <div v-if="searchHistory.length">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white text-sm font-medium flex items-center gap-2">
            <Clock class="w-4 h-4 text-gray-500" />
            搜索历史
          </h3>
          <button class="text-gray-500 text-xs hover:text-gray-300 transition-colors" @click="clearHistory">
            清空
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(item, index) in searchHistory"
            :key="index"
            class="group flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 text-sm text-gray-300 cursor-pointer transition-all"
            @click="doSearch(item)"
          >
            {{ item }}
            <button class="opacity-0 group-hover:opacity-100 transition-opacity" @click.stop="removeHistoryItem(index)">
              <X class="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-white text-sm font-medium flex items-center gap-2 mb-3">
          <TrendingUp class="w-4 h-4 text-[#e8364e]" />
          热门搜索
        </h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(keyword, index) in hotSearchKeywords"
            :key="keyword"
            class="bg-white/5 hover:bg-white/10 rounded-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-all"
            @click="doSearch(keyword)"
          >
            <span :class="index < 3 ? 'text-[#e8364e] font-bold' : 'text-gray-500'" class="mr-1">{{ index + 1 }}</span>
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>

    <div v-else>
      <p class="text-gray-400 text-sm mb-4">
        搜索 "<span class="text-white">{{ query }}</span>" 共找到
        <span class="text-[#ff6b81]">{{ results.length }}</span> 部短剧
      </p>

      <div v-if="results.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        <DramaCard v-for="drama in results" :key="drama.id" :drama="drama" />
      </div>

      <div v-else class="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Search class="w-16 h-16 text-gray-700" />
        <p class="text-gray-500">没有找到相关短剧</p>
        <p class="text-gray-600 text-sm">换个关键词试试吧</p>
      </div>
    </div>
  </div>
</template>
