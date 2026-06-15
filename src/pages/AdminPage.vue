<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Drama, Episode } from '@/types'
import { getDramaList, getDramaDetail } from '@/mock/data'
import { Plus, Search, Edit2, Trash2, Eye, LogOut, Film, Upload, Users, Settings } from 'lucide-vue-next'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10

const dramas = ref<Drama[]>([])
const total = ref(0)

const filteredDramas = computed(() => {
  let result = dramas.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(d => 
      d.title.toLowerCase().includes(query) || 
      d.id.includes(query)
    )
  }
  return result
})

const paginatedDramas = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredDramas.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredDramas.value.length / pageSize))

function loadDramas() {
  const result = getDramaList({})
  dramas.value = result.list
  total.value = result.total
}

function handleLogout() {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

function goToDetail(id: string) {
  router.push(`/admin/drama/${id}`)
}

function addDrama() {
  router.push('/admin/drama/new')
}

onMounted(() => {
  if (!localStorage.getItem('admin_token')) {
    router.push('/admin/login')
    return
  }
  loadDramas()
})
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Film class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold text-white">短剧管理系统</h1>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
          >
            <LogOut class="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索短剧名称或ID..."
              class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
        <button
          @click="addDrama"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          <Plus class="w-5 h-5" />
          添加短剧
        </button>
      </div>

      <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800/50 border-b border-gray-700 text-sm font-medium text-gray-400">
          <div class="col-span-1">ID</div>
          <div class="col-span-2">封面</div>
          <div class="col-span-3">名称</div>
          <div class="col-span-2">分类</div>
          <div class="col-span-2">评分/播放</div>
          <div class="col-span-2">操作</div>
        </div>
        
        <div v-if="paginatedDramas.length > 0">
          <div
            v-for="drama in paginatedDramas"
            :key="drama.id"
            class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors items-center"
          >
            <div class="col-span-1 text-gray-400 text-sm">{{ String(drama.id).padStart(5, '0') }}</div>
            <div class="col-span-2">
              <img :src="drama.cover" :alt="drama.title" class="w-12 h-16 object-cover rounded-lg" />
            </div>
            <div class="col-span-3">
              <h3 class="text-white font-medium">{{ drama.title }}</h3>
              <p class="text-gray-500 text-xs">{{ drama.updateStatus }}</p>
            </div>
            <div class="col-span-2">
              <span class="inline-block px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">{{ drama.category[0] }}</span>
            </div>
            <div class="col-span-2 text-sm">
              <span class="text-yellow-400">{{ drama.rating }}</span>
              <span class="text-gray-500 mx-2">|</span>
              <span class="text-gray-400">{{ (drama.views / 10000).toFixed(1) }}万</span>
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <button
                @click="goToDetail(drama.id)"
                class="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                title="查看详情"
              >
                <Eye class="w-4 h-4" />
              </button>
              <button
                @click="goToDetail(drama.id)"
                class="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button class="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors" title="删除">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="py-12 text-center text-gray-500">
          暂无数据
        </div>
      </div>

      <div class="flex items-center justify-between mt-6">
        <p class="text-gray-400 text-sm">
          共 {{ filteredDramas.length }} 条记录，当前第 {{ currentPage }} / {{ totalPages }} 页
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage <= 1"
            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-300 text-sm transition-colors"
          >
            上一页
          </button>
          <span class="px-3 py-1 text-gray-400 text-sm">{{ currentPage }}</span>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-300 text-sm transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
