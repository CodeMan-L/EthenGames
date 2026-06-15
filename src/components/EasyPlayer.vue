<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'

interface Props {
  url: string
  poster?: string
  isLive?: boolean
  hasAudio?: boolean
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  poster: '',
  isLive: false,
  hasAudio: true,
  title: '',
  subtitle: '',
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  error: [msg: string]
  timeUpdate: [currentTime: number, duration: number]
  back: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const playerContainerRef = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const buffered = ref(0)
const isFullscreen = ref(false)
const showControls = ref(true)
const showVolumeSlider = ref(false)
const controlsTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMsg = ref('')

const progress = computed(() => {
  if (!duration.value || !isFinite(duration.value)) return 0
  return (currentTime.value / duration.value) * 100
})

const bufferedPercent = computed(() => {
  if (!duration.value || !isFinite(duration.value)) return 0
  return (buffered.value / duration.value) * 100
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play().catch(() => {})
  }
  resetControlsTimer()
}

function toggleMute() {
  if (!videoRef.value) return
  videoRef.value.muted = !videoRef.value.muted
  isMuted.value = videoRef.value.muted
}

function handleVolumeChange(val: number) {
  volume.value = val
  if (videoRef.value) {
    videoRef.value.volume = val
    videoRef.value.muted = val === 0
    isMuted.value = val === 0
  }
}

function toggleFullscreen() {
  if (!playerContainerRef.value) return
  if (!document.fullscreenElement) {
    playerContainerRef.value.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function handleTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  if (videoRef.value.buffered.length > 0) {
    buffered.value = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
  }
  emit('timeUpdate', currentTime.value, duration.value)
}

function handlePlay() {
  isPlaying.value = true
  isLoading.value = false
  emit('play')
}

function handlePause() {
  isPlaying.value = false
  emit('pause')
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    if (videoRef.value.volume !== undefined) {
      volume.value = videoRef.value.volume
    }
  }
}

function handleEnded() {
  isPlaying.value = false
  emit('ended')
}

function handleWaiting() {
  isLoading.value = true
}

function handlePlaying() {
  isLoading.value = false
}

function handleError() {
  hasError.value = true
  errorMsg.value = '播放出错'
  isLoading.value = false
  emit('error', errorMsg.value)
}

function seekTo(event: Event) {
  const target = event.target as HTMLInputElement
  const pct = Number(target.value)
  if (videoRef.value && videoRef.value.duration) {
    videoRef.value.currentTime = (pct / 100) * videoRef.value.duration
  }
}

function seekRelative(delta: number) {
  if (videoRef.value && videoRef.value.duration) {
    videoRef.value.currentTime = Math.max(0, Math.min(videoRef.value.duration, videoRef.value.currentTime + delta))
  }
}

function resetControlsTimer() {
  if (controlsTimer.value) clearTimeout(controlsTimer.value)
  showControls.value = true
  if (isPlaying.value) {
    controlsTimer.value = setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

function handleMouseMove() {
  resetControlsTimer()
}

function handleVideoClick() {
  togglePlay()
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement) return

  switch (e.code) {
    case 'Space':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      e.preventDefault()
      seekRelative(-10)
      break
    case 'ArrowRight':
      e.preventDefault()
      seekRelative(10)
      break
    case 'ArrowUp':
      e.preventDefault()
      handleVolumeChange(Math.min(1, volume.value + 0.1))
      break
    case 'ArrowDown':
      e.preventDefault()
      handleVolumeChange(Math.max(0, volume.value - 0.1))
      break
    case 'KeyF':
    case 'KeyFf':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'KeyM':
      e.preventDefault()
      toggleMute()
      break
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (controlsTimer.value) clearTimeout(controlsTimer.value)
})

watch(isMuted, (val) => {
  if (videoRef.value) {
    videoRef.value.muted = val
  }
})
</script>

<template>
  <div
    ref="playerContainerRef"
    class="relative bg-black select-none overflow-hidden"
    :class="{ 'is-fullscreen': isFullscreen }"
    @mousemove="handleMouseMove"
    @mouseleave="isPlaying && (showControls = false)"
    @touchstart="showControls = !showControls"
  >
    <div class="relative overflow-hidden bg-black flex items-center justify-center">
      <video
        ref="videoRef"
        :src="url"
        :poster="poster"
        class="w-full h-auto object-contain cursor-pointer max-h-[85vh]"
        @timeupdate="handleTimeUpdate"
        @play="handlePlay"
        @pause="handlePause"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @waiting="handleWaiting"
        @playing="handlePlaying"
        @error="handleError"
        @click="handleVideoClick"
      />

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

      <div
        v-if="!isPlaying && !isLoading && !hasError"
        class="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
        @click="togglePlay"
      >
        <div class="w-12 h-12 sm:w-16 md:w-20 lg:w-24 xl:w-28 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-[#e8364e]/80 transition-all duration-300 hover:scale-110">
          <svg class="w-6 h-6 sm:w-7 md:w-8 lg:w-9 xl:w-10 text-white ml-0.5 sm:ml-1" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>

      <div
        class="absolute inset-x-0 top-0 p-3 sm:p-4 transition-opacity duration-300 z-30"
        :class="showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <div class="flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-xl px-4 py-2">
          <button class="text-white/90 hover:text-white transition-colors" @click="emit('back')">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
          <div class="min-w-0 flex-1">
            <h1 v-if="title" class="text-white text-sm font-medium truncate">{{ title }}</h1>
            <p v-if="subtitle" class="text-white/50 text-xs truncate">{{ subtitle }}</p>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-x-0 bottom-0 transition-opacity duration-300 z-30"
        :class="showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <div class="bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-10 pb-2 px-4 sm:px-4">
          <div v-if="!isLive" class="flex items-center gap-2 sm:gap-3 mb-2">
            <span class="text-white/80 text-[10px] sm:text-xs font-mono tabular-nums w-10 sm:w-14 shrink-0">{{ formattedCurrentTime }}</span>
            <div class="flex-1 relative h-5 flex items-center group/progress">
              <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 group-hover/progress:h-1.5 transition-all rounded-full overflow-hidden bg-white/15">
                <div class="absolute h-full bg-white/20 rounded-full" :style="{ width: bufferedPercent + '%' }" />
                <div class="absolute h-full bg-[#e8364e] rounded-full" :style="{ width: progress + '%' }" />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                :value="progress"
                class="absolute inset-x-0 top-0 h-6 opacity-0 cursor-pointer"
                @input="seekTo"
              />
            </div>
            <span class="text-white/80 text-[10px] sm:text-xs font-mono tabular-nums w-10 sm:w-14 text-right shrink-0">{{ formattedDuration }}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 sm:gap-2">
              <button
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 transition-all"
                @click="togglePlay"
              >
                <svg v-if="isPlaying" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                <svg v-else class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>

              <button
                v-if="!isLive"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                @click="seekRelative(-10)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
              </button>

              <button
                v-if="!isLive"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                @click="seekRelative(10)"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
              </button>
            </div>

            <div class="flex items-center gap-1 sm:gap-2">
              <div
                class="relative flex items-center"
                @mouseenter="showVolumeSlider = true"
                @mouseleave="showVolumeSlider = false"
              >
                <button
                  class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  @click="toggleMute"
                >
                  <svg v-if="isMuted || volume === 0" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  <svg v-else-if="volume < 0.5" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                </button>
                <div
                  class="absolute bottom-full mb-2 right-0 origin-bottom-right transition-all duration-200"
                  :class="showVolumeSlider ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'"
                >
                  <div class="bg-black/80 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      :value="volume"
                      class="volume-vertical-slider"
                      style="writing-mode: vertical-lr; direction: rtl; width: 20px; height: 80px;"
                      @input="handleVolumeChange(Number(($event.target as HTMLInputElement).value))"
                    />
                  </div>
                </div>
              </div>

              <button
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                @click="toggleFullscreen"
              >
                <svg v-if="isFullscreen" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
.is-fullscreen :deep(.aspect-video) {
  max-height: none !important;
  height: 100vh;
}
</style>
