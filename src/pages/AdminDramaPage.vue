<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Drama, Episode } from '@/types'
import { getDramaDetail } from '@/mock/data'
import { ArrowLeft, Save, Plus, Trash2, Upload, Film, Calendar, Star, Eye, Play } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.params.id === 'new')
const dramaId = computed(() => route.params.id as string)

const drama = ref<Partial<Drama>>({
  id: '',
  title: '',
  cover: '',
  description: '',
  category: [''],
  region: '大陆',
  year: 2025,
  rating: 8.0,
  updateStatus: '',
  views: 0,
  tags: [],
  episodes: []
})

const newEpisode = ref({
  episodeNumber: 1,
  title: '',
  duration: '3:00',
  playUrl: ''
})

const categories = ['2D解说漫', '3D动态漫', '真人解说漫', '仿真人演绎剧']
const regions = ['大陆', '韩国', '日本', '欧美']
const tags = ['热门', '完结', '连载中', '高分']

function goBack() {
  router.push('/admin')
}

function addEpisode() {
  if (!drama.value.episodes) drama.value.episodes = []
  drama.value.episodes.push({
    id: drama.value.episodes.length + 1,
    episodeNumber: newEpisode.value.episodeNumber,
    title: newEpisode.value.title || `第${newEpisode.value.episodeNumber}集`,
    duration: newEpisode.value.duration,
    playUrl: newEpisode.value.playUrl
  })
  newEpisode.value = {
    episodeNumber: drama.value.episodes.length + 1,
    title: '',
    duration: '3:00',
    playUrl: ''
  }
}

function removeEpisode(index: number) {
  if (drama.value.episodes) {
    drama.value.episodes.splice(index, 1)
  }
}

function handleSave() {
  alert('保存成功！')
  router.push('/admin')
}

function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      drama.value.cover = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  if (!localStorage.getItem('admin_token')) {
    router.push('/admin/login')
    return
  }
  
  if (!isNew.value) {
    const detail = getDramaDetail(dramaId.value)
    if (detail) {
      drama.value = { ...detail }
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <button
              @click="goBack"
              class="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="text-xl font-bold text-white">{{ isNew ? '添加短剧' : '编辑短剧' }}</h1>
          </div>
          <button
            @click="handleSave"
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Save class="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <label class="block text-sm font-medium text-gray-300 mb-4">封面图片</label>
            <div class="relative">
              <div 
                v-if="drama.cover" 
                class="aspect-[3/4] rounded-lg overflow-hidden bg-gray-700"
              >
                <img :src="drama.cover" :alt="drama.title" class="w-full h-full object-cover" />
              </div>
              <div 
                v-else 
                class="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center bg-gray-700/50"
              >
                <Upload class="w-12 h-12 text-gray-400 mb-2" />
                <p class="text-gray-400 text-sm">点击上传封面</p>
              </div>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleCoverUpload"
              />
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Film class="w-5 h-5 text-purple-400" />
              基本信息
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">短剧ID</label>
                <input
                  v-model="drama.id"
                  type="text"
                  placeholder="输入短剧ID"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">短剧名称</label>
                <input
                  v-model="drama.title"
                  type="text"
                  placeholder="输入短剧名称"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">分类</label>
                <select
                  v-model="drama.category"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">地区</label>
                <select
                  v-model="drama.region"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option v-for="reg in regions" :key="reg" :value="reg">{{ reg }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">
                  <Calendar class="w-4 h-4 inline mr-1" />
                  上线年份
                </label>
                <input
                  v-model.number="drama.year"
                  type="number"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">
                  <Star class="w-4 h-4 inline mr-1" />
                  评分
                </label>
                <input
                  v-model.number="drama.rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-400 mb-1">标签</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in tags"
                  :key="tag"
                  @click="() => {
                    const index = drama.tags?.indexOf(tag)
                    if (index !== -1 && index !== undefined) {
                      drama.tags?.splice(index, 1)
                    } else {
                      if (!drama.tags) drama.tags = []
                      drama.tags.push(tag)
                    }
                  }"
                  class="px-3 py-1 rounded-full text-sm transition-all"
                  :class="drama.tags?.includes(tag) 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-white mb-4">短剧简介</h2>
            <textarea
              v-model="drama.description"
              rows="4"
              placeholder="输入短剧简介..."
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                <Play class="w-5 h-5 text-green-400" />
                剧集列表
              </h2>
              <button
                @click="addEpisode"
                class="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors"
              >
                <Plus class="w-4 h-4" />
                添加剧集
              </button>
            </div>

            <div v-if="drama.episodes && drama.episodes.length > 0" class="space-y-3">
              <div
                v-for="(ep, index) in drama.episodes"
                :key="ep.id"
                class="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg"
              >
                <span class="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full text-sm font-medium">
                  {{ ep.episodeNumber }}
                </span>
                <input
                  v-model="ep.title"
                  type="text"
                  placeholder="剧集标题"
                  class="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <input
                  v-model="ep.duration"
                  type="text"
                  placeholder="时长"
                  class="w-20 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <input
                  v-model="ep.playUrl"
                  type="text"
                  placeholder="播放链接"
                  class="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  @click="removeEpisode(index)"
                  class="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-else class="py-8 text-center text-gray-500">
              <Play class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂无剧集，点击上方按钮添加</p>
            </div>

            <div v-if="!isNew" class="mt-4 pt-4 border-t border-gray-700">
              <input
                v-model="newEpisode.episodeNumber"
                type="number"
                placeholder="集数"
                class="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 mr-2"
              />
              <input
                v-model="newEpisode.title"
                type="text"
                placeholder="标题"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 mr-2"
              />
              <input
                v-model="newEpisode.duration"
                type="text"
                placeholder="时长"
                class="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 mr-2"
              />
              <input
                v-model="newEpisode.playUrl"
                type="text"
                placeholder="播放链接"
                class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
