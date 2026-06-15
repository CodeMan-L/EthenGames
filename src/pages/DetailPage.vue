<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Drama } from '@/types'
import { getDramaDetail, getRelatedDramas } from '@/mock/data'
import DramaCard from '@/components/DramaCard.vue'
import { Play, Star, Eye, Calendar, MapPin, Film, ChevronRight } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const drama = ref<Drama | null>(null)
const relatedDramas = ref<Drama[]>([])
const showFullDesc = ref(false)

function goToPlay(episodeId: number) {
  router.push(`/play/${drama.value!.id}/${episodeId}`)
}

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1) + '万'
  return String(views)
}

onMounted(() => {
  const id = route.params.id as string
  drama.value = getDramaDetail(id) || null
  if (drama.value) {
    relatedDramas.value = getRelatedDramas(id)
  }
})
</script>

<template>
  <div v-if="drama" class="min-h-screen">
    <div class="relative rounded-xl overflow-hidden mb-8">
      <img :src="drama.cover" :alt="drama.title" class="w-full aspect-[21/9] object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-32 md:w-44 shrink-0 hidden md:block">
            <img :src="drama.cover" :alt="drama.title" class="w-full aspect-[3/4] rounded-lg object-cover shadow-2xl" />
          </div>
          <div class="flex-1">
            <div class="flex gap-2 mb-2">
              <span
                v-for="cat in drama.category"
                :key="cat"
                class="text-xs bg-[#e8364e]/80 text-white px-2 py-0.5 rounded-full"
              >
                {{ cat }}
              </span>
              <span class="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                {{ drama.updateStatus }}
              </span>
            </div>
            <h1 class="text-white text-2xl md:text-4xl font-bold mb-3">{{ drama.title }}</h1>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <span class="flex items-center gap-1">
                <Star class="w-4 h-4 text-[#f0c040]" />
                <span class="text-[#f0c040] font-bold">{{ drama.rating }}</span>
              </span>
              <span class="flex items-center gap-1">
                <Eye class="w-4 h-4" />
                {{ formatViews(drama.views) }}播放
              </span>
              <span class="flex items-center gap-1">
                <MapPin class="w-4 h-4" />
                {{ drama.region }}
              </span>
              <span class="flex items-center gap-1">
                <Calendar class="w-4 h-4" />
                {{ drama.year }}
              </span>
              <span class="flex items-center gap-1">
                <Film class="w-4 h-4" />
                {{ drama.episodes.length }}集
              </span>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <span v-if="drama.director" class="text-gray-500 text-sm">导演: {{ drama.director }}</span>
              <span v-if="drama.cast?.length" class="text-gray-500 text-sm">主演: {{ drama.cast.join(' / ') }}</span>
            </div>

            <button
              class="bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-[#e8364e]/30 transition-all hover:scale-105"
              @click="goToPlay(1)"
            >
              <Play class="w-5 h-5" />
              立即播放
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-8">
      <h2 class="text-white text-lg font-bold mb-3 flex items-center gap-2">
        <span class="w-1 h-5 bg-gradient-to-b from-[#e8364e] to-[#ff6b81] rounded-full" />
        剧情简介
      </h2>
      <p
        class="text-gray-400 text-sm leading-relaxed"
        :class="{ 'line-clamp-3': !showFullDesc }"
      >
        {{ drama.description }}
      </p>
      <button
        v-if="drama.description.length > 80"
        class="text-[#ff6b81] text-sm mt-1 flex items-center gap-1 hover:underline"
        @click="showFullDesc = !showFullDesc"
      >
        {{ showFullDesc ? '收起' : '展开' }}
        <ChevronRight class="w-3 h-3" :class="{ 'rotate-90': showFullDesc }" />
      </button>
    </div>

    <div class="mb-8">
      <h2 class="text-white text-lg font-bold mb-3 flex items-center gap-2">
        <span class="w-1 h-5 bg-gradient-to-b from-[#e8364e] to-[#ff6b81] rounded-full" />
        选集
        <span class="text-gray-500 text-sm font-normal">共{{ drama.episodes.length }}集</span>
      </h2>
      <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        <button
          v-for="ep in drama.episodes"
          :key="ep.id"
          class="aspect-square rounded-lg bg-white/5 hover:bg-[#e8364e]/20 text-gray-300 hover:text-white text-sm flex items-center justify-center transition-all duration-200"
          @click="goToPlay(ep.id)"
        >
          {{ ep.id }}
        </button>
      </div>
    </div>

    <div v-if="relatedDramas.length">
      <h2 class="text-white text-lg font-bold mb-3 flex items-center gap-2">
        <span class="w-1 h-5 bg-gradient-to-b from-[#e8364e] to-[#ff6b81] rounded-full" />
        相关推荐
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
        <DramaCard v-for="d in relatedDramas" :key="d.id" :drama="d" />
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center min-h-[60vh]">
    <div class="flex flex-col items-center gap-4">
      <div class="w-12 h-12 border-2 border-[#e8364e] border-t-transparent rounded-full animate-spin" />
      <p class="text-gray-500 text-sm">加载中...</p>
    </div>
  </div>
</template>
