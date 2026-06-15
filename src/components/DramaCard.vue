<script setup lang="ts">
import type { Drama } from '@/types'
import { useRouter } from 'vue-router'

const props = defineProps<{
  drama: Drama
  rank?: number
}>()

const router = useRouter()

function goToDetail() {
  router.push(`/detail/${props.drama.id}`)
}

function formatViews(views: number): string {
  if (views >= 10000) return (views / 10000).toFixed(1) + '万'
  return String(views)
}
</script>

<template>
  <div
    class="group cursor-pointer"
    @click="goToDetail"
  >
    <div class="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5">
      <img
        :src="drama.cover"
        :alt="drama.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div v-if="rank" class="absolute top-2 left-2 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
        :class="rank <= 3 ? 'bg-gradient-to-br from-[#e8364e] to-[#ff6b81] text-white' : 'bg-black/60 text-gray-300'"
      >
        {{ rank }}
      </div>

      <div v-if="drama.updateStatus" class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full">
        {{ drama.updateStatus }}
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div class="flex gap-1 flex-wrap">
          <span
            v-for="cat in drama.category.slice(0, 2)"
            :key="cat"
            class="text-[10px] bg-[#e8364e]/80 text-white px-1.5 py-0.5 rounded"
          >
            {{ cat }}
          </span>
        </div>
      </div>

      <div v-if="drama.rating" class="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-[#f0c040] text-xs font-bold px-1.5 py-0.5 rounded group-hover:opacity-0 transition-opacity">
        {{ drama.rating }}
      </div>
    </div>

    <div class="mt-2 px-0.5">
      <h3 class="text-white text-sm font-medium truncate group-hover:text-[#ff6b81] transition-colors">
        {{ drama.title }}
      </h3>
      <p class="text-gray-500 text-xs mt-0.5 truncate">
        {{ drama.region }} · {{ drama.year }}
        <span v-if="drama.views" class="ml-1">{{ formatViews(drama.views) }}播放</span>
      </p>
    </div>
  </div>
</template>
