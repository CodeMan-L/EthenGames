<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  if (username.value === 'admin' && password.value === 'admin123') {
    localStorage.setItem('admin_token', 'true')
    router.push('/admin')
  } else {
    error.value = '用户名或密码错误'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7.5 18H4v-3.667L16.5 3.5z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">短剧管理系统</h1>
          <p class="text-gray-400 mt-2">请登录后台管理</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            登录
          </button>
        </form>
        
        <p v-if="error" class="mt-4 text-center text-red-400 text-sm">{{ error }}</p>
        
        <div class="mt-6 text-center text-gray-500 text-xs">
          默认账号：admin / admin123
        </div>
      </div>
    </div>
  </div>
</template>
