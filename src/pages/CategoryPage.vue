<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Drama } from '@/types'
import { getDramaList, categoryList, regionList, sortList } from '@/mock/data'
import DramaCard from '@/components/DramaCard.vue'
import { Filter } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const selectedCategory = ref('全部')
const selectedRegion = ref('全部')
const selectedSort = ref('热门')
const currentPage = ref(1)
const pageSize = 12

const dramas = ref<Drama[]>([])
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize))

function loadData() {
  const result = getDramaList({
    category: selectedCategory.value,
    region: selectedRegion.value,
    sort: selectedSort.value,
    page: currentPage.value,
    pageSize,
  })
  dramas.value = result.list
  total.value = result.total
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  currentPage.value = 1
  loadData()
}

function selectRegion(region: string) {
  selectedRegion.value = region
  currentPage.value = 1
  loadData()
}

function selectSort(sort: string) {
  selectedSort.value = sort
  currentPage.value = 1
  loadData()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (route.query.category) selectedCategory.value = route.query.category as string
  if (route.query.sort) selectedSort.value = route.query.sort as string
  loadData()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mb-6 space-y-4">
      <div class="bg-white/5 rounded-xl p-4 space-y-4">
        <div class="flex items-center gap-2 text-gray-400 text-sm">
          <Filter class="w-4 h-4" />
          <span>筛选</span>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="text-gray-500 text-sm w-12 shrink-0 pt-1">类型</span>
          <button
            v-for="cat in categoryList"
            :key="cat"
            class="px-3 py-1 rounded-full text-sm transition-all duration-200"
            :class="selectedCategory === cat
              ? 'bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white shadow-lg shadow-[#e8364e]/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
            @click="selectCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="text-gray-500 text-sm w-12 shrink-0 pt-1">地区</span>
          <button
            v-for="region in regionList"
            :key="region"
            class="px-3 py-1 rounded-full text-sm transition-all duration-200"
            :class="selectedRegion === region
              ? 'bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white shadow-lg shadow-[#e8364e]/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
            @click="selectRegion(region)"
          >
            {{ region }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="text-gray-500 text-sm w-12 shrink-0 pt-1">排序</span>
          <button
            v-for="sort in sortList"
            :key="sort"
            class="px-3 py-1 rounded-full text-sm transition-all duration-200"
            :class="selectedSort === sort
              ? 'bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white shadow-lg shadow-[#e8364e]/20'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
            @click="selectSort(sort)"
          >
            {{ sort }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="dramas.length" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
      <DramaCard v-for="drama in dramas" :key="drama.id" :drama="drama" />
    </div>

    <div v-else class="flex items-center justify-center min-h-[40vh]">
      <p class="text-gray-500">暂无相关短剧</p>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-8">
      <button
        class="px-3 py-1.5 rounded-lg text-sm transition-all"
        :class="currentPage === 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        上一页
      </button>
      <template v-for="page in totalPages" :key="page">
        <button
          v-if="page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1"
          class="w-8 h-8 rounded-lg text-sm transition-all"
          :class="page === currentPage
            ? 'bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <span v-else-if="Math.abs(page - currentPage) === 2" class="text-gray-600 text-xs">...</span>
      </template>
      <button
        class="px-3 py-1.5 rounded-lg text-sm transition-all"
        :class="currentPage === totalPages ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-white/5 text-gray-400 hover:bg-white/10'"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
