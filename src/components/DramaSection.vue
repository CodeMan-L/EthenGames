<script setup lang="ts">
import type { Drama } from '@/types'
import DramaCard from './DramaCard.vue'
import { ChevronRight } from 'lucide-vue-next'

defineProps<{
  title: string
  dramas: Drama[]
  showRank?: boolean
  moreLink?: string
}>()
</script>

<template>
  <section class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-white text-lg md:text-xl font-bold flex items-center gap-2">
        <span class="w-1 h-5 bg-gradient-to-b from-[#e8364e] to-[#ff6b81] rounded-full" />
        {{ title }}
      </h2>
      <router-link
        v-if="moreLink"
        :to="moreLink"
        class="text-gray-400 hover:text-[#ff6b81] text-sm flex items-center gap-1 transition-colors"
      >
        更多 <ChevronRight class="w-4 h-4" />
      </router-link>
    </div>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
      <DramaCard
        v-for="(drama, index) in dramas"
        :key="drama.id"
        :drama="drama"
        :rank="showRank ? index + 1 : undefined"
      />
    </div>
  </section>
</template>
