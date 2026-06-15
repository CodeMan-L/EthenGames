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
          <h1 class="ml-4 text-white font-semibold">用户协议</h1>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-6">
        <div class="text-center py-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">用户协议</h1>
          <p class="text-gray-400 text-sm">最后更新日期：2026年5月28日</p>
        </div>

        <div class="space-y-8 text-gray-300">
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">一、服务条款的接受</h2>
            <p class="leading-relaxed">
              欢迎使用本网站。在使用本网站之前，请您仔细阅读本用户协议（以下简称"本协议"）的所有内容。
              如您不同意本协议任何条款，请您不要使用本网站。您使用本网站的行为将被视为对本协议的完全接受。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">二、服务说明</h2>
            <p class="leading-relaxed">
              本网站由 HONGKONG LIAN ARCHITECTURE DESIGN LIMITED（以下简称"我们"）提供服务。
              我们致力于为用户提供优质的短剧观看服务。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">三、用户账号</h2>
            <p class="leading-relaxed">
              1. 用户在使用我们的服务时，应提供真实、准确的个人信息。
              <br />
              2. 用户应妥善保管自己的账号和密码，因保管不善所造成的损失由用户自行承担。
              <br />
              3. 用户不得将账号转让、出借或与他人分享。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">四、用户行为规范</h2>
            <p class="leading-relaxed">
              用户在使用本网站服务时，不得从事以下行为：
              <br />
              1. 发布、传播违反国家法律、行政法规禁止的内容；
              <br />
              2. 侵犯他人知识产权、商业秘密等合法权益；
              <br />
              3. 恶意攻击、干扰本网站的正常运行；
              <br />
              4. 利用本网站从事任何非法活动。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">五、知识产权</h2>
            <p class="leading-relaxed">
              本网站上的所有内容（包括但不限于文字、图片、音视频、软件、软件界面设计等）的知识产权均归我们或相关权利人所有。
              未经我们或相关权利人书面许可，用户不得擅自复制、传播、展示、镜像、上载、下载本网站内容用于商业用途。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">六、免责声明</h2>
            <p class="leading-relaxed">
              1. 我们将尽力提供稳定、安全的服务，但不保证服务不会中断或出错；
              <br />
              2. 因不可抗力、网络故障、系统维护等原因造成的服务中断，我们不承担责任；
              <br />
              3. 用户使用本网站所产生的风险由用户自行承担。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">七、服务变更与终止</h2>
            <p class="leading-relaxed">
              我们保留随时修改或中断服务的权利，无需对用户或第三方负责。
              如用户违反本协议，我们有权立即中止或终止向该用户提供服务。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">八、争议解决</h2>
            <p class="leading-relaxed">
              本协议的解释、效力及纠纷解决均适用中华人民共和国法律。
              如发生争议，双方应友好协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
            </p>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-white">九、联系我们</h2>
            <p class="leading-relaxed">
              如您对本协议有任何疑问，请通过以下方式联系我们：
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
