<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <footer class="border-t border-white/5 mt-16 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 cursor-pointer" @click="goHome">
          <img src="/logo.svg" alt="MH Logo" class="w-7 h-7 object-contain" />
          <div class="flex flex-col leading-none">
            <span class="text-white font-bold text-sm tracking-wide">墨焕科技</span>
            <span class="text-gray-600 text-[9px] tracking-widest uppercase">Momentum & Hope</span>
          </div>
        </div>
        <div class="flex items-center gap-6 text-gray-500 text-xs">
          <span class="hover:text-gray-300 transition-colors cursor-pointer">关于我们</span>
          <span
            class="hover:text-gray-300 transition-colors cursor-pointer"
            @click="router.push('/user-agreement')"
          >
            用户协议
          </span>
          <span
            class="hover:text-gray-300 transition-colors cursor-pointer"
            @click="router.push('/privacy-policy')"
          >
            隐私政策
          </span>
          <span class="hover:text-gray-300 transition-colors cursor-pointer">联系客服</span>
        </div>
        <p class="text-gray-600 text-xs">
          © 2026 HONGKONG LIAN ARCHITECTURE DESIGN LIMITED. All Rights Reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
