<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0f]">
    <header class="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <button
            @click="router.back()"
            class="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 class="ml-4 text-white font-semibold">隐私政策</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-6">
        <div class="text-center py-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">隐私政策</h1>
          <p class="text-gray-400 text-sm">最后更新日期：2026年5月28日</p>
        </div>

        <div class="space-y-8 text-gray-300">
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">一、概述</h2>
            <p class="leading-relaxed">
              本隐私政策由 HONGKONG LIAN ARCHITECTURE DESIGN LIMITED（以下简称"我们"）制定，
              旨在说明我们如何收集、使用、存储和保护您的个人信息。
              使用我们的服务，即表示您同意本隐私政策的所有内容。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">二、信息收集</h2>
            <p class="leading-relaxed">
              我们可能收集以下类型的信息：
              <br />
              1. <strong>个人身份信息</strong>：姓名、邮箱、电话号码等（如适用）；
              <br />
              2. <strong>使用信息</strong>：您访问时间、浏览记录、观看历史、设备信息等；
              <br />
              3. <strong>技术信息</strong>：IP地址、浏览器类型、操作系统、设备型号等。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">三、信息使用</h2>
            <p class="leading-relaxed">
              我们收集的信息将用于以下目的：
              <br />
              1. 提供、维护和改进我们的服务；
              <br />
              2. 分析服务使用情况；
              <br />
              3. 向您发送服务通知；
              <br />
              4. 确保服务的安全性和稳定性。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">四、信息保护</h2>
            <p class="leading-relaxed">
              我们采取适当的技术和管理措施来保护您的个人信息安全，防止信息泄露、篡改或丢失。
              但请注意，互联网传输不能保证100%的安全。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">五、信息共享</h2>
            <p class="leading-relaxed">
              除以下情况外，我们不会向第三方共享您的个人信息：
              <br />
              1. 获得您的明确同意；
              <br />
              2. 根据法律法规或政府要求；
              <br />
              3. 为维护我们的合法权益所需。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">六、Cookie使用</h2>
            <p class="leading-relaxed">
              我们使用Cookie和类似技术来改善用户体验、分析网站流量、提供个性化服务。
              您可以通过浏览器设置管理Cookie偏好。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">七、未成年人保护</h2>
            <p class="leading-relaxed">
              我们非常重视未成年人的隐私保护。
              如果您是未成年人，请在监护人的指导下阅读本隐私政策。
              如我们发现收集了未成年人的个人信息，将采取措施尽快删除。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">八、您的权利</h2>
            <p class="leading-relaxed">
              您有权：
              <br />
              1. 访问和更新您的个人信息；
              <br />
              2. 删除您的账号和相关信息；
              <br />
              3. 撤回您的同意；
              <br />
              4. 注销账号。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">九、政策更新</h2>
            <p class="leading-relaxed">
              我们可能会不时更新本隐私政策。更新后的政策将在本页面发布。
              建议您定期查看本页面以了解最新信息。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">十、联系我们</h2>
            <p class="leading-relaxed">
              如您对本隐私政策有任何疑问，请通过以下方式联系我们：
              <br />
              公司名称：HONGKONG LIAN ARCHITECTURE DESIGN LIMITED
              <br />
              联系邮箱：inEthen@126.com
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer class="border-t border-white/10 mt-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-500 text-sm">
          <p>© 2026 HONGKONG LIAN ARCHITECTURE DESIGN LIMITED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
