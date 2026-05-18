<template>
  <div>
    <div class="card-footer flex items-center justify-between gap-3 px-9 pt-5 pb-6 border-t border-(--border) bg-(--bg-input) max-[600px]:px-5 max-[600px]:py-4 max-[600px]:flex-wrap max-[600px]:gap-2.5">
      <!-- Left side — back button or info text -->
      <div class="footer-left flex items-center gap-2">
        <button
          v-if="showBack"
          type="button"
          class="btn-ghost h-11 px-5 rounded-[10px] border-[1.5px] border-(--border) bg-transparent text-(--text-secondary) text-sm font-medium cursor-pointer transition-[border-color,color,background] duration-200 flex items-center gap-2 whitespace-nowrap hover:border-(--green-mid) hover:text-primary hover:bg-(--green-pale)"
          @click="$emit('back')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span v-else-if="infoText" class="btn-text text-[13px] text-(--text-muted)">{{ infoText }}</span>
      </div>

      <!-- Right side — skip + continue -->
      <div class="footer-right flex items-center gap-2.5">
        <button
          v-if="showSkip"
          type="button"
          class="btn-text bg-transparent border-none text-[13px] text-(--text-muted) cursor-pointer p-0 transition-colors duration-200 hover:text-(--text-secondary) mr-2"
          @click="$emit('skip')"
        >Skip for now</button>
        <button
          type="button"
          class="btn-primary h-11 px-6 rounded-[10px] border-none bg-primary text-white text-sm font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap transition-[background,transform,box-shadow] duration-200 hover:bg-(--green-hover) hover:shadow-[0_4px_16px_rgba(26,122,74,0.3)] active:scale-[.98]"
          :class="{ 'opacity-70 pointer-events-none': loading }"
          @click="$emit('continue')"
        >
          <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".25"/>
            <path d="M21 12a9 9 0 0 0-9-9"/>
          </svg>
          {{ loading ? loadingLabel : continueLabel }}
          <svg v-if="!loading" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
    <!-- Progress bar -->
    <div class="progress-bar-track h-[3px] bg-(--border) relative overflow-hidden">
      <div
        class="progress-bar-fill absolute left-0 top-0 h-full bg-linear-to-r from-primary to-(--green-mid) rounded-r-sm transition-[width] duration-600"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  showBack?: boolean
  showSkip?: boolean
  infoText?: string
  continueLabel?: string
  loading?: boolean
  loadingLabel?: string
  progress: number
}>(), {
  showBack: false,
  showSkip: false,
  infoText: '',
  continueLabel: 'Continue',
  loading: false,
  loadingLabel: 'Setting up…',
})

defineEmits<{
  back: []
  skip: []
  continue: []
}>()
</script>
