<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Drama, Episode } from '@/types'
import { getDramaDetail } from '@/mock/data'
import { getVideoUrl } from '@/config/video'
import EasyPlayer from '@/components/EasyPlayer.vue'

const route = useRoute()
const router = useRouter()

const drama = ref<Drama | null>(null)
const currentEp = ref<Episode | null>(null)
const showEpisodeList = ref(false)
const playerKey = ref(0)

const currentEpIndex = computed(() => {
  if (!drama.value || !currentEp.value) return 0
  return drama.value.episodes.findIndex(ep => ep.id === currentEp.value!.id)
})

const currentVideoUrl = computed(() => {
  if (!drama.value || !currentEp.value) return ''
  return getVideoUrl(drama.value.id, currentEp.value.id)
})

function goBack() {
  router.back()
}

function goToDetail() {
  if (drama.value) {
    router.push(`/detail/${drama.value.id}`)
  }
}

function selectEpisode(ep: Episode) {
  currentEp.value = ep
  showEpisodeList.value = false
  playerKey.value++
}

function prevEpisode() {
  if (!drama.value || currentEpIndex.value <= 0) return
  selectEpisode(drama.value.episodes[currentEpIndex.value - 1])
}

function nextEpisode() {
  if (!drama.value || currentEpIndex.value >= drama.value.episodes.length - 1) return
  selectEpisode(drama.value.episodes[currentEpIndex.value + 1])
}

function handleEnded() {
  if (drama.value && currentEpIndex.value < drama.value.episodes.length - 1) {
    nextEpisode()
  }
}

onMounted(() => {
  const id = route.params.id as string
  const epId = Number(route.params.ep) || 1

  drama.value = getDramaDetail(id) || null
  if (drama.value) {
    currentEp.value = drama.value.episodes.find(ep => ep.id === epId) || drama.value.episodes[0]
  }
})
</script>

<template>
  <div v-if="drama && currentEp" class="min-h-screen flex flex-col items-center bg-[#0a0a0f]">
    <div class="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl relative bg-black">
      <EasyPlayer
        :key="playerKey"
        :url="currentVideoUrl"
        :poster="drama.cover"
        :is-live="false"
        :title="drama.title"
        :subtitle="currentEp.title"
        @ended="handleEnded"
        @back="goBack"
      />
    </div>

    <div class="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#0a0a0f] px-4 py-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-white font-bold text-lg">{{ drama.title }}</h2>
          <p class="text-gray-500 text-sm">
            {{ currentEp.title }} · {{ currentEp.duration }}
            <span class="text-gray-600 mx-2">|</span>
            {{ drama.category.join(' / ') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="text-gray-400 hover:text-white transition-colors p-2"
            :disabled="currentEpIndex <= 0"
            :class="{ 'opacity-30': currentEpIndex <= 0 }"
            @click="prevEpisode"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
          </button>
          <button
            class="text-gray-400 hover:text-white transition-colors p-2"
            :disabled="currentEpIndex >= drama.episodes.length - 1"
            :class="{ 'opacity-30': currentEpIndex >= drama.episodes.length - 1 }"
            @click="nextEpisode"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
          </button>
          <button
            class="flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-full px-4 py-2 text-sm text-gray-300 transition-all"
            @click="showEpisodeList = !showEpisodeList"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
            选集
            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showEpisodeList }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <transition name="slide">
        <div v-if="showEpisodeList" class="bg-white/5 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-400 text-sm">共{{ drama.episodes.length }}集</span>
            <button class="text-gray-500 text-xs" @click="showEpisodeList = false">收起</button>
          </div>
          <div class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto">
            <button
              v-for="ep in drama.episodes"
              :key="ep.id"
              class="aspect-square rounded-lg text-sm flex items-center justify-center transition-all duration-200"
              :class="ep.id === currentEp.id
                ? 'bg-gradient-to-r from-[#e8364e] to-[#ff6b81] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'"
              @click="selectEpisode(ep)"
            >
              {{ ep.id }}
            </button>
          </div>
        </div>
      </transition>

      <button
        class="text-gray-400 text-sm hover:text-[#ff6b81] transition-colors"
        @click="goToDetail"
      >
        查看短剧详情 →
      </button>

      <div class="border-t border-white/10 pt-4">
        <h3 class="text-white font-medium mb-2">短剧简介</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          {{ drama?.description }}
        </p>
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

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
