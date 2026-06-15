<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HomeData } from '@/types'
import { getHomeData } from '@/mock/data'
import BannerCarousel from '@/components/BannerCarousel.vue'
import CategoryNav from '@/components/CategoryNav.vue'
import DramaSection from '@/components/DramaSection.vue'

const homeData = ref<HomeData | null>(null)

onMounted(() => {
  homeData.value = getHomeData()
})
</script>

<template>
  <div class="min-h-screen">
    <div v-if="homeData" class="space-y-8">
      <BannerCarousel :banners="homeData.banners" />

      <CategoryNav />

      <DramaSection
        title="热门短剧"
        :dramas="homeData.hotDramas"
        :show-rank="true"
        more-link="/category?sort=热门"
      />

      <DramaSection
        title="最新上线"
        :dramas="homeData.newDramas"
        more-link="/category?sort=最新"
      />

      <DramaSection
        title="口碑排行"
        :dramas="homeData.rankings"
        :show-rank="true"
        more-link="/category?sort=评分"
      />
    </div>

    <div v-else class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-2 border-[#e8364e] border-t-transparent rounded-full animate-spin" />
        <p class="text-gray-500 text-sm">加载中...</p>
      </div>
    </div>
  </div>
</template>
