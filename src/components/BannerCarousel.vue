<script setup lang="ts">
import type { BannerItem } from '@/types'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  banners: BannerItem[]
}>()

const router = useRouter()
const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval>

function goTo(index: number) {
  currentIndex.value = (index + props.banners.length) % props.banners.length
}

function prev() {
  goTo(currentIndex.value - 1)
}

function next() {
  goTo(currentIndex.value + 1)
}

function goToDetail(id: string) {
  router.push(`/detail/${id}`)
}

function startAutoPlay() {
  timer = setInterval(next, 5000)
}

function stopAutoPlay() {
  clearInterval(timer)
}

onMounted(startAutoPlay)
onUnmounted(stopAutoPlay)
</script>

<template>
  <div
    class="relative w-full aspect-[21/9] rounded-xl overflow-hidden group"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <div>
      <transition-group name="banner">
        <div
          v-for="(banner, index) in banners"
          :key="banner.id"
          v-show="index === currentIndex"
          class="absolute inset-0 cursor-pointer"
          @click="goToDetail(banner.id)"
        >
          <img
            :src="banner.cover"
            :alt="banner.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/30 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div class="flex gap-2 mb-2">
              <span
                v-for="tag in banner.tags"
                :key="tag"
                class="text-xs bg-[#e8364e]/80 text-white px-2 py-0.5 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
            <h2 class="text-white text-2xl md:text-4xl font-bold mb-2">{{ banner.title }}</h2>
            <p class="text-gray-300 text-sm md:text-base max-w-lg">{{ banner.description }}</p>
          </div>
        </div>
      </transition-group>
    </div>

    <button
      class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
      @click.stop="prev"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    <button
      class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
      @click.stop="next"
    >
      <ChevronRight class="w-5 h-5" />
    </button>

    <div class="absolute bottom-3 right-6 flex gap-1.5">
      <button
        v-for="(_, index) in banners"
        :key="index"
        class="w-2 h-2 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'bg-[#e8364e] w-6' : 'bg-white/40 hover:bg-white/60'"
        @click.stop="goTo(index)"
      />
    </div>
  </div>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.5s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
}
</style>
